import FriendCard from '@/components/FriendCard';
import { useCreateOneToOneRoom } from '@/hooks/mutations/useCreateOneToOneRoom';
import useUnfollowAccepted from '@/hooks/mutations/useUnfollowAccepted'; // ✅ 변경
import { useAcceptedFollowing } from '@/hooks/queries/useFollowing';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Dimensions } from 'react-native';
import styled from 'styled-components/native';

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
};

const yearFromBirthday = (b?: string | number) => {
  if (typeof b === 'number') return Number.isFinite(b) ? b : undefined;
  const s = (b ?? '').toString();
  const m = s.match(/\d{4}/)?.[0];
  return m ? Number(m) : undefined;
};

const toFriendItem = (row: any): FriendItem => {
  const id = Number(row?.id ?? row?.userId);
  const first = (row?.firstname ?? '').trim();
  const last = (row?.lastname ?? '').trim();
  const name = [first, last].filter(Boolean).join(' ') || row?.email || 'Unknown';

  const birth = row?.birthYear ?? yearFromBirthday(row?.birthday ?? row?.birth ?? row?.birthDate ?? row?.dateOfBirth);

  return {
    id,
    name,
    country: row?.country ?? '',
    birth: yearFromBirthday(row?.birthday),
    purpose: row?.purpose ?? '',
    languages: Array.isArray(row?.language) ? row.language : [],
    personalities: Array.isArray(row?.hobby) ? row.hobby : [],
    bio: row?.introduction ?? '',
    imageKey: row?.imageKey ?? undefined,
  };
};

export default function FriendsOnlyScreen() {
  const { data, isLoading, isError, refetch } = useAcceptedFollowing();
  const list = useMemo<FriendItem[]>(
    () => (data ?? []).map(toFriendItem).filter((v) => Number.isFinite(v.id) && v.id > 0),
    [data],
  );

  const { mutateAsync: createRoom } = useCreateOneToOneRoom();

  const totalPages = list.length;
  const [page, setPage] = useState(1);
  const listRef = useRef<import('react-native').FlatList>(null);

  const unfollowMutation = useUnfollowAccepted(); // ✅ 변경

  const confirmUnfollow = (userId: number) => {
    Alert.alert(
      'Are you sure you want to cancel follow?',
      'If you cancel follow, this will be removed from your friends list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              await unfollowMutation.mutateAsync(userId);
              await refetch();
            } catch (e) {
              console.error('[unfollow] error', e);
              Alert.alert('Failed to unfollow', 'Please try again later.');
            }
          },
        },
      ],
    );
  };

  const goToIndex = (indexZeroBased: number) => {
    if (!listRef.current) return;
    const safeIndex = Math.max(0, Math.min(totalPages - 1, indexZeroBased));
    listRef.current.scrollToIndex({ index: safeIndex, animated: true });
  };

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>

        <TitleWrap pointerEvents="none">
          <Title>Friends List</Title>
        </TitleWrap>
      </Header>

      <HList
        ref={listRef}
        data={list}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const idx = Math.round(x / SCREEN_WIDTH);
          setPage(idx + 1);
        }}
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
                isFollowed
                collapsible={false}
                onUnfollow={() => confirmUnfollow(item.id)}
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
            <EmptyText>{isLoading ? 'Loading...' : isError ? 'Failed to load.' : 'No friends yet.'}</EmptyText>
          </Empty>
        }
      />

      <Pager>
        <PagerBtn disabled={page <= 1} onPress={() => goToIndex(page - 2)}>
          <PagerArrow>‹</PagerArrow>
        </PagerBtn>

        <PagerText>{` ${page} / ${totalPages} `}</PagerText>

        <PagerBtn disabled={page >= totalPages} onPress={() => goToIndex(page)}>
          <PagerArrow>›</PagerArrow>
        </PagerBtn>
      </Pager>
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;
const Header = styled.View`
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
`;
const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;
const TitleWrap = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  align-items: center;
`;
const Title = styled.Text`
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const HList = styled.FlatList`` as unknown as typeof import('react-native').FlatList;
const Page = styled.View`
  justify-content: center;
`;
const Inner = styled.View`
  padding: 0 16px;
  margin-top: -30px;
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
