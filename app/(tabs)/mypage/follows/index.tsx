import FriendCard from '@/components/FriendCard';
import useAcceptFollow from '@/hooks/mutations/useAcceptFollow';
import useCancelFollowRequest from '@/hooks/mutations/useCancelFollowRequest';
import useDeclineFollow from '@/hooks/mutations/useDeclineFollow';
import { useFollowList } from '@/hooks/queries/useFollowList';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import styled from 'styled-components/native';

type Tab = 'received' | 'sent';

type FriendItem = {
  id: number;
  name: string;
  country: string;
  birth?: number;
  purpose: string;
  languages: string[];
  personalities: string[];
  bio?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const toFriendItem = (row: any): FriendItem => {
  const yearMatch = (row?.birth ?? '').toString().match(/^\d{4}/)?.[0];
  return {
    id: Number(row?.userId ?? row?.id),
    name: row?.name ?? 'Unknown',
    country: row?.country ?? '-',
    birth: yearMatch ? Number(yearMatch) : undefined,
    purpose: row?.purpose ?? '',
    languages: Array.isArray(row?.languages) ? row.languages : [],
    personalities: Array.isArray(row?.hobbies) ? row.hobbies : [],
    bio: row?.bio ?? '',
  };
};

function HListBase(props: FlatListProps<FriendItem>) {
  return <FlatList {...props} />;
}
const HList = styled(HListBase)``;

export default function FollowListScreen() {
  const [tab, setTab] = useState<Tab>('received');

  const {
    data: receivedData = [],
    isLoading: loadingReceived,
    isError: errorReceived,
    refetch: refetchReceived,
  } = useFollowList('PENDING', 'received');

  const {
    data: sentData = [],
    isLoading: loadingSent,
    isError: errorSent,
  } = useFollowList('PENDING', 'sent');

  const receivedList = useMemo<FriendItem[]>(() => receivedData.map(toFriendItem), [receivedData]);
  const sentList = useMemo<FriendItem[]>(() => sentData.map(toFriendItem), [sentData]);

  const rRef = useRef<FlatList<FriendItem>>(null);
  const sRef = useRef<FlatList<FriendItem>>(null);
  const [rPage, setRPage] = useState(1);
  const [sPage, setSPage] = useState(1);

  useEffect(() => { setRPage(1); }, [receivedList.length]);
  useEffect(() => { setSPage(1); }, [sentList.length]);

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
    try {
      await acceptMutation.mutateAsync(userId);
      await refetchReceived();
    } catch (e) {
      console.log('[accept-follow] error', e);
    }
  };

  const handleDecline = async (userId: number) => {
    try {
      await declineMutation.mutateAsync(userId);
      await refetchReceived();
    } catch (e) {
      console.log('[decline-follow] error', e);
    }
  };

  const handleCancelSent = async (userId: number) => {
    try {
      await cancelReqMutation.mutateAsync(userId);
    } catch (e) {
      console.log('[cancel-follow-request] error', e);
    }
  };

  const goToIndex = <T,>(
    ref: { current: FlatList<T> | null },
    total: number,
    idx0: number
  ) => {
    if (total === 0) return;
    const safe = Math.max(0, Math.min(total - 1, idx0));
    ref.current?.scrollToIndex({ index: safe, animated: true });
  };

  const getLayout: FlatListProps<FriendItem>['getItemLayout'] =
    (_data, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index });

  const onScrollReceived = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setRPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1);
  };
  const onScrollSent = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH) + 1);
  };

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>
        <HeaderCenter><Title>Friends List</Title></HeaderCenter>
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
            data={receivedList}
            keyExtractor={(i: FriendItem) => String(i.id)}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={getLayout}
            onScroll={onScrollReceived}
            scrollEventThrottle={16}
            renderItem={({ item }: { item: FriendItem }) => (
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
                    collapsible={false}
                    mode="received"
                    onAccept={handleAccept}
                    onCancel={handleDecline}
                    onChat={() => { }}
                    isFollowed={false}
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
              <PagerBtn
                disabled={rPage <= 1}
                onPress={() => goToIndex(rRef, receivedList.length, rPage - 2)}
              >
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
            data={sentList}
            keyExtractor={(i: FriendItem) => String(i.id)}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={getLayout}
            onScroll={onScrollSent}
            scrollEventThrottle={16}
            renderItem={({ item }: { item: FriendItem }) => (
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
                    collapsible={false}
                    mode="sent"
                    onAccept={() => { }}
                    onCancel={() => handleCancelSent(item.id)}  // ✅ 요청 취소 연결
                    onChat={() => { }}
                    isFollowed={false}
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
              <PagerBtn
                disabled={sPage <= 1}
                onPress={() => goToIndex(sRef, sentList.length, sPage - 2)}
              >
                <PagerArrow>‹</PagerArrow>
              </PagerBtn>
              <PagerText>{`${sPage} / ${sentList.length}`}</PagerText>
              <PagerBtn
                disabled={sPage >= sentList.length}
                onPress={() => goToIndex(sRef, sentList.length, sPage)}
              >
                <PagerArrow>›</PagerArrow>
              </PagerBtn>
            </Pager>
          )}
        </>
      )}
    </Safe>
  );
}

const Safe = styled.SafeAreaView`flex:1;background:#1d1e1f;`;
const Header = styled.View`flex-direction:row;align-items:center;padding:12px 16px;`;
const BackBtn = styled.Pressable`width:40px;align-items:flex-start;`;
const HeaderCenter = styled.View`flex:1;align-items:center;justify-content:center;`;
const RightSlot = styled.View`width:40px;`;
const Title = styled.Text`color:#fff;font-size:20px;font-family:'PlusJakartaSans_700Bold';`;

const TabsWrap = styled.View`position:relative;padding:0 16px;margin-top:4px;`;
const TabsRow = styled.View`flex-direction:row;`;
const TabItem = styled.Pressable<{ active: boolean }>`
  flex:1;align-items:center;padding:12px 6px;
  border-bottom-width:2px;border-bottom-color:${p => p.active ? '#30F59B' : 'transparent'};
`;
const TabText = styled.Text<{ active: boolean }>`
  color:${p => p.active ? '#30F59B' : '#cfcfcf'};font-size:16px;font-family:'PlusJakartaSans_600SemiBold';
`;
const TabsBottomLine = styled.View`position:absolute;left:16px;right:16px;bottom:0;height:1px;background:#212325;`;

const Page = styled.View`justify-content:center;`;
const Inner = styled.View`padding:0 16px;margin-top:-27px;`;

const Pager = styled.View`
  position:absolute;bottom:10px;left:0;right:0;flex-direction:row;align-items:center;justify-content:center;
`;
const PagerBtn = styled.Pressable<{ disabled?: boolean }>`opacity:${p => p.disabled ? 0.3 : 1};padding:6px 10px;`;
const PagerArrow = styled.Text`color:#b7babd;font-size:20px;padding:0 4px;`;
const PagerText = styled.Text`color:#b7babd;font-size:12px;font-family:'PlusJakartaSans_400Regular';`;

const Empty = styled.View`padding:40px 16px;align-items:center;`;
const EmptyText = styled.Text`color:#cfcfcf;`;
