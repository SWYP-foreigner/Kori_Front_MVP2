import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import FriendCard from '@/components/FriendCard';
import useFollowUser from '@/hooks/mutations/useFollowUser';
import useDirectChat from '@/hooks/mutations/useSendChat';
import useMyProfile from '@/hooks/queries/useMyProfile';
import useRecommendedFriends from '@/hooks/queries/useRecommendedFriends';

export default function HomeScreen() {
  const { data: friends, isLoading, isFetching, refetch } = useRecommendedFriends(20);
  const followMutation = useFollowUser();
  const { data: me } = useMyProfile();
  const sendDirectChat = useDirectChat();

  const myId = useMemo(() => {
    const raw = (me as any)?.memberId ?? (me as any)?.id ?? (me as any)?.userId;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [me]);

  const list = useMemo(() => {
    const arr = friends ?? [];
    console.log('[recommend]', arr.map(u => ({ id: u.id, name: u.name })));
    return arr.filter(u => Number(u.id) > 0 && Number(u.id) !== myId);
  }, [friends, myId]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // 채팅 버튼 → DM 전송 시도 → 채팅방으로 이동
  const openChat = useCallback((userId: number, name?: string) => {
    const fallbackMsg = "Hi! 👋 Let's chat";

    sendDirectChat.mutate(
      { userId, message: fallbackMsg },
      {
        onSettled: () => {
          router.push({
            pathname: '/(tabs)/chat/direct/[userId]',
            params: { userId: String(userId), name: name ?? '' },
          });
        },
      }
    );
  }, [sendDirectChat]);

  return (
    <Safe>
      <Header>
        <Title>Find Friends</Title>
        <IconImage source={require('../../assets/images/IsolationMode.png')} />
      </Header>

      {isLoading ? (
        <LoaderWrap><ActivityIndicator /></LoaderWrap>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={Boolean(isFetching && !isLoading)} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
          renderItem={({ item }) => (
            <CardWrap>
              <FriendCard
                userId={Number(item.id)}
                name={item.name || 'Unknown'}
                country={item.country || '-'}
                birth={item.birth ?? undefined}
                gender={item.gender || 'unspecified'}
                purpose={item.purpose || '-'}
                languages={item.languages || []}
                personalities={item.personalities || []}
                bio={item.bio || undefined}
                isFollowed={false}
                onFollow={(id) => {
                  if (myId && id === myId) return;
                  followMutation.mutate(id);
                }}
                onChat={() => openChat(Number(item.id), item.name)}
              />
            </CardWrap>
          )}
          ListEmptyComponent={
            <EmptyWrap>
              <EmptyText>No recommendations yet.</EmptyText>
            </EmptyWrap>
          }
        />
      )}
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Header = styled.View`
  padding: 12px 18px 8px 18px;
  flex-direction: row;
  align-items: center;
`;
const Title = styled.Text`
  color: #ffffff;
  font-size: 32px;
  font-family: 'InstrumentSerif_400Regular';
  letter-spacing: -0.2px;
`;
const IconImage = styled.Image`
  margin-left: 4px;
  width: 20px;
  height: 20px;
`;
const LoaderWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const CardWrap = styled.View`
  margin-top: 16px;
`;
const EmptyWrap = styled.View`
  padding: 40px 16px;
  align-items: center;
`;
const EmptyText = styled.Text`
  color: #cfcfcf;
`;
