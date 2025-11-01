import FriendCard from '@/components/FriendCard';
import useAcceptFollow from '@/hooks/mutations/useAcceptFollow';
import useCancelFollowRequest from '@/hooks/mutations/useCancelFollowRequest';
import { useCreateOneToOneRoom } from '@/hooks/mutations/useCreateOneToOneRoom';
import useDeclineFollow from '@/hooks/mutations/useDeclineFollow';
import { useFollowList } from '@/hooks/queries/useFollowList';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import styled from 'styled-components/native';

type Tab = 'received' | 'sent';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FriendItem = {
  id: number;
  name: string;
  country: string;
  birth?: number;
  purpose: string;
  languages: string[];
  personalities: string[];
  bio?: string;
  imageKey?: string;
  imageUrl?: string;
};

function HListBase(props: FlatListProps<FriendItem>) {
  return <FlatList {...props} />;
}
const HList = styled(HListBase)``;

const yearFromAny = (v?: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const s = (v ?? '').toString().trim();
  const matches = s.match(/\b(19|20)\d{2}\b/g);
  if (matches && matches.length) return Number(matches[matches.length - 1]);
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.getUTCFullYear();
};

const toItem = (u: any): FriendItem | null => {
  const idNum = Number(u?.userId ?? u?.id);
  if (!Number.isFinite(idNum) || idNum <= 0) return null;

  const birth =
    yearFromAny(u?.birthYear) ??
    yearFromAny(u?.birthday ?? u?.birth ?? u?.birthDate ?? u?.dateOfBirth ?? u?.birth_year);

  return {
    id: idNum,
    name: u?.name ?? 'Unknown',
    country: u?.country ?? '-',
    birth,
    purpose: u?.purpose ?? '',
    languages: Array.isArray(u?.languages) ? u.languages : [],
    personalities: Array.isArray(u?.hobbies) ? u.hobbies : [],
    bio: u?.bio ?? '',
    imageKey: u?.imageKey,
    imageUrl: u?.imageUrl,
  };
};
const dedupById = (arr: any[]): FriendItem[] => {
  const map = new Map<number, FriendItem>();
  for (const raw of arr || []) {
    const it = toItem(raw);
    if (it) map.set(it.id, it);
  }
  return [...map.values()];
};

export default function FollowListScreen() {
  const [tab, setTab] = useState<Tab>('received');
  const [inFlight, setInFlight] = useState<Set<number>>(new Set());
  const lock = (id: number) => setInFlight((s) => new Set(s).add(id));
  const unlock = (id: number) =>
    setInFlight((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  const {
    data: receivedRaw = [],
    isLoading: loadingReceived,
    isError: errorReceived,
    refetch: refetchReceived,
  } = useFollowList('PENDING', 'received');

  const {
    data: sentRaw = [],
    isLoading: loadingSent,
    isError: errorSent,
    refetch: refetchSent,
  } = useFollowList('PENDING', 'sent');

  const { mutateAsync: createRoom } = useCreateOneToOneRoom();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('FOLLOW_REQUEST_SENT', () => {
      refetchSent();
    });
    return () => sub.remove();
  }, [refetchSent]);

  const receivedList = useMemo(() => dedupById(receivedRaw), [receivedRaw]);
  const sentList = useMemo(() => dedupById(sentRaw), [sentRaw]);

  const rRef = useRef<FlatList<FriendItem>>(null);
  const sRef = useRef<FlatList<FriendItem>>(null);
  const [rPage, setRPage] = useState(1);
  const [sPage, setSPage] = useState(1);

  useEffect(() => {
    setRPage(1);
  }, [receivedList.length]);
  useEffect(() => {
    setSPage(1);
  }, [sentList.length]);

  useEffect(() => {
    if (tab === 'received' && !loadingReceived && receivedList.length > 0) {
      rRef.current?.scrollToIndex?.({ index: 0, animated: false });
    } else if (tab === 'sent' && !loadingSent && sentList.length > 0) {
      sRef.current?.scrollToIndex?.({ index: 0, animated: false });
    }
  }, [tab, receivedList.length, sentList.length, loadingReceived, loadingSent]);

  const acceptMutation = useAcceptFollow();
  const declineMutation = useDeclineFollow();
  const cancelReqMutation = useCancelFollowRequest();

  const handleAccept = async (userId: number) => {
    if (inFlight.has(userId)) return;
    try {
      lock(userId);
      await acceptMutation.mutateAsync(userId);
      await refetchReceived();
    } finally {
      unlock(userId);
    }
  };

  const handleDecline = async (userId: number) => {
    if (inFlight.has(userId)) return;
    try {
      lock(userId);
      await declineMutation.mutateAsync(userId);
      await refetchReceived();
    } finally {
      unlock(userId);
    }
  };

  const handleCancelSent = async (userId: number) => {
    if (inFlight.has(userId)) return;
    try {
      lock(userId);
      await cancelReqMutation.mutateAsync(userId);
      DeviceEventEmitter.emit('FOLLOW_REQUEST_CANCELLED', { userId });
      await refetchSent();
    } catch (e) {
      console.error('[cancel-follow-request] error', e);
    } finally {
      unlock(userId);
    }
  };

  const goToIndex = <T,>(ref: { current: FlatList<T> | null }, total: number, idx0: number) => {
    if (total === 0) return;
    const safe = Math.max(0, Math.min(total - 1, idx0));
    ref.current?.scrollToIndex?.({ index: safe, animated: true });
  };

  const getLayout: FlatListProps<FriendItem>['getItemLayout'] = (_data, index) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const onScrollReceived = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setRPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1);
  };
  const onScrollSent = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1);
  };

  const onScrollToIndexFailed: FlatListProps<FriendItem>['onScrollToIndexFailed'] = (info) => {
    setTimeout(() => {
      info?.averageItemLength &&
        (info as any).props?.ref?.current?.scrollToOffset?.({
          offset: info.averageItemLength * info.index,
          animated: true,
        });
    }, 0);
  };

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>
        <HeaderCenter>
          <Title>Friends List</Title>
        </HeaderCenter>
        <RightSlot />
      </Header>

      <TabsWrap>
        <TabsRow>
          <TabItem active={tab === 'received'} onPress={() => setTab('received')}>
            <TabText active={tab === 'received'}>Received</TabText>
          </TabItem>
          <TabItem active={tab === 'sent'} onPress={() => setTab('sent')}>
            <TabText active={tab === 'sent'}>Sent</TabText>
          </TabItem>
        </TabsRow>
        <TabsBottomLine />
      </TabsWrap>

      {tab === 'received' ? (
        <>
          <HList
            ref={rRef}
            listKey="received-list"
            data={receivedList}
            keyExtractor={(i) => `rec-${String(i?.id)}`}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={getLayout}
            onScroll={onScrollReceived}
            onScrollToIndexFailed={onScrollToIndexFailed}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Page style={{ width: SCREEN_WIDTH }}>
                <Inner>
                  <FriendCard
                    userId={item.id}
                    name={item.name}
                    country={item.country}
                    birth={item.birth}
                    purpose={item.purpose}
                    languages={item.languages}
                    personalities={item.personalities}
                    bio={item.bio}
                    imageKey={item.imageKey}
                    imageUrl={item.imageUrl}
                    collapsible={false}
                    mode="received"
                    onAccept={handleAccept}
                    onCancel={handleDecline}
                    onChat={() => {}}
                  />
                </Inner>
              </Page>
            )}
            ListEmptyComponent={
              <Empty>
                <EmptyText>
                  {loadingReceived ? 'Loading...' : errorReceived ? 'Failed to load.' : 'No received requests.'}
                </EmptyText>
              </Empty>
            }
          />
          {receivedList.length > 1 && (
            <Pager>
              <PagerBtn disabled={rPage <= 1} onPress={() => goToIndex(rRef, receivedList.length, rPage - 2)}>
                <PagerArrow>‹</PagerArrow>
              </PagerBtn>
              <PagerText>{`${rPage} / ${receivedList.length}`}</PagerText>
              <PagerBtn
                disabled={rPage >= receivedList.length}
                onPress={() => goToIndex(rRef, receivedList.length, rPage)}
              >
                <PagerArrow>›</PagerArrow>
              </PagerBtn>
            </Pager>
          )}
        </>
      ) : (
        <>
          <HList
            ref={sRef}
            listKey="sent-list"
            data={sentList}
            keyExtractor={(i) => `sent-${String(i?.id)}`}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={getLayout}
            onScroll={onScrollSent}
            onScrollToIndexFailed={onScrollToIndexFailed}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Page style={{ width: SCREEN_WIDTH }}>
                <Inner>
                  <FriendCard
                    userId={item.id}
                    name={item.name}
                    country={item.country}
                    birth={item.birth}
                    purpose={item.purpose}
                    languages={item.languages}
                    personalities={item.personalities}
                    bio={item.bio}
                    imageKey={item.imageKey}
                    imageUrl={item.imageUrl}
                    collapsible={false}
                    mode="sent"
                    onAccept={() => {}}
                    onCancel={() => handleCancelSent(item.id)}
                    onChat={async () => {
                      try {
                        const roomId = await createRoom({ otherUserId: item.id });
                        router.push({
                          pathname: '/(tabs)/chat/ChattingRoomScreen',
                          params: {
                            userId: String(item.id),
                            roomName: encodeURIComponent(item.name || 'Unknown'),
                            roomId,
                          },
                        });
                      } catch (e: any) {
                        console.error('[chat]', e?.message ?? '채팅방 생성 실패');
                      }
                    }}
                  />
                </Inner>
              </Page>
            )}
            ListEmptyComponent={
              <Empty>
                <EmptyText>
                  {loadingSent ? 'Loading...' : errorSent ? 'Failed to load.' : 'No sent requests.'}
                </EmptyText>
              </Empty>
            }
          />
          {sentList.length > 1 && (
            <Pager>
              <PagerBtn disabled={sPage <= 1} onPress={() => goToIndex(sRef, sentList.length, sPage - 2)}>
                <PagerArrow>‹</PagerArrow>
              </PagerBtn>
              <PagerText>{`${sPage} / ${sentList.length}`}</PagerText>
              <PagerBtn disabled={sPage >= sentList.length} onPress={() => goToIndex(sRef, sentList.length, sPage)}>
                <PagerArrow>›</PagerArrow>
              </PagerBtn>
            </Pager>
          )}
        </>
      )}
    </Safe>
  );
}

/* styles 그대로 */
const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;
const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
`;
const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;
const HeaderCenter = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const RightSlot = styled.View`
  width: 40px;
`;
const Title = styled.Text`
  color: #fff;
  font-size: 20px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const TabsWrap = styled.View`
  position: relative;
  padding: 0 16px;
  margin-top: 4px;
`;
const TabsRow = styled.View`
  flex-direction: row;
`;
const TabItem = styled.Pressable<{ active: boolean }>`
  flex: 1;
  align-items: center;
  padding: 12px 6px;
  border-bottom-width: 2px;
  border-bottom-color: ${(p) => (p.active ? '#30F59B' : 'transparent')};
`;
const TabText = styled.Text<{ active: boolean }>`
  color: ${(p) => (p.active ? '#30F59B' : '#cfcfcf')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const TabsBottomLine = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: #212325;
`;
const Page = styled.View`
  justify-content: center;
`;
const Inner = styled.View`
  padding: 0 16px;
  margin-top: -27px;
`;
const Pager = styled.View`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const PagerBtn = styled.Pressable<{ disabled?: boolean }>`
  opacity: ${(p) => (p.disabled ? 0.3 : 1)};
  padding: 6px 10px;
`;
const PagerArrow = styled.Text`
  color: #b7babd;
  font-size: 20px;
  padding: 0 4px;
`;
const PagerText = styled.Text`
  color: #b7babd;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const Empty = styled.View`
  padding: 40px 16px;
  align-items: center;
`;
const EmptyText = styled.Text`
  color: #cfcfcf;
`;
