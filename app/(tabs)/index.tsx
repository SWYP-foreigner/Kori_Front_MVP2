import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import FriendCard from '@/components/FriendCard';
import useCancelFollowRequest from '@/hooks/mutations/useCancelFollowRequest';
import useFollowUser from '@/hooks/mutations/useFollowUser';
import useDirectChat from '@/hooks/mutations/useSendChat';
import useMyProfile from '@/hooks/queries/useMyProfile';
import useRecommendedFriends from '@/hooks/queries/useRecommendedFriends';

const toBirthNumber = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const n = Number(v as any);
  return Number.isFinite(n) ? n : undefined;
};

export default function HomeScreen() {
  const { data: friends, isLoading, isFetching, refetch } = useRecommendedFriends(20);
  const followMutation = useFollowUser();
  const cancelReqMutation = useCancelFollowRequest();
  const { data: me } = useMyProfile();
  const sendDirectChat = useDirectChat();

  const [requested, setRequested] = useState<Set<number>>(new Set());

  const myId = useMemo(() => {
    const raw = (me as any)?.memberId ?? (me as any)?.id ?? (me as any)?.userId;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [me]);

  const list = useMemo(() => {
    const arr = friends ?? [];
    return arr.filter(u => Number(u.id) > 0 && Number(u.id) !== myId);
  }, [friends, myId]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const markRequested = useCallback((id: number) => {
    setRequested(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unmarkRequested = useCallback((id: number) => {
    setRequested(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <Safe>
      <Header>
        <Title>Find Friends</Title>
        <IconImage source={require('../../assets/images/IsolationMode.png')} />
      </Header>

      {isLoading ? (
        <LoaderWrap>
          <ActivityIndicator />
        </LoaderWrap>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={Boolean(isFetching && !isLoading)} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const uid = Number(item.id);
            const isSent = requested.has(uid);

            return (
              <CardWrap>
                <FriendCard
                  userId={uid}
                  name={item.name || 'Unknown'}
                  country={item.country || '-'}
                  birth={toBirthNumber(item.birth)}
                  gender={item.gender || 'unspecified'}
                  purpose={item.purpose || '-'}
                  languages={item.languages || []}
                  personalities={item.personalities || []}
                  bio={item.bio || undefined}
                  imageUrl={(item as any).imageUrl}
                  imageKey={(item as any).imageKey}

                  mode={isSent ? 'sent' : 'friend'}

                  onFollow={async (id) => {
                    if (myId && id === myId) return;
                    try {
                      await followMutation.mutateAsync(id);
                      markRequested(id);
                    } catch (e) {
                    }
                  }}

                  onCancel={async (id) => {
                    if (myId && id === myId) return;
                    const wasSent = requested.has(id);
                    if (wasSent) unmarkRequested(id);
                    try {
                      await cancelReqMutation.mutateAsync(id);
                    } catch (e) {
                      // 롤백
                      if (wasSent) markRequested(id);
                    }
                  }}
                />
              </CardWrap>
            );
          }}

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
