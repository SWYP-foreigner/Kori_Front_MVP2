import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
  FlatList,
  RefreshControl,
} from 'react-native';
import styled from 'styled-components/native';

import FriendCard from '@/components/FriendCard';
import useCancelFollowRequest from '@/hooks/mutations/useCancelFollowRequest';
import { useCreateOneToOneRoom } from '@/hooks/mutations/useCreateOneToOneRoom';
import useFollowUser from '@/hooks/mutations/useFollowUser';
import { useAcceptedFollowing } from '@/hooks/queries/useFollowing';
import { useSentFollowRequestsSet } from '@/hooks/queries/useFollowList';
import useMyProfile from '@/hooks/queries/useMyProfile';
import useRecommendedFriends from '@/hooks/queries/useRecommendedFriends';
import { router } from 'expo-router';
import {
  getNotificationsSettingStatus,
  initNotificationsSettingStatus,
  postFcmDeviceToken,
  putOSPushAgreement,
} from '@/api/notifications/notifications';
import messaging from '@react-native-firebase/messaging';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { Text } from '@react-navigation/elements';
import { getOSNotificationPermissionStatus } from '@/lib/fcm/getOSPermissionStatus';

const toBirthNumber = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const n = Number(v as any);
  return Number.isFinite(n) ? n : undefined;
};

export default function HomeScreen() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const { data: friends, isLoading, isFetching, refetch } = useRecommendedFriends(20);
  const followMutation = useFollowUser();
  const cancelReqMutation = useCancelFollowRequest();
  const { data: me } = useMyProfile();
  const { mutateAsync: createRoom, isPending: creatingRoom } = useCreateOneToOneRoom();

  const [requested, setRequested] = useState<Set<number>>(new Set());
  const [inFlight, setInFlight] = useState<Set<number>>(new Set());
  const [isNotificationPermissionModalOpen, setIsNotificationPermissionModalOpen] = useState<boolean>(false);
  const { isNotificationNeedsSetup, setIsNotificationNeedsSetup } = useNotificationStore();

  const lock = (id: number) => setInFlight((s) => new Set(s).add(id));
  const unlock = (id: number) =>
    setInFlight((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  const { data: accepted } = useAcceptedFollowing(); // [{ id: number, ... }]
  const followingSet = useMemo(
    () => new Set((accepted ?? []).map((u) => Number((u as any)?.id ?? (u as any)?.userId)).filter(Number.isFinite)),
    [accepted],
  );

  const { set: sentSet } = useSentFollowRequestsSet();

  useEffect(() => {
    const subCancel = DeviceEventEmitter.addListener('FOLLOW_REQUEST_CANCELLED', (p: { userId: number }) => {
      if (p?.userId) {
        setRequested((prev) => {
          const n = new Set(prev);
          n.delete(p.userId);
          return n;
        });
      }
    });
    const subSent = DeviceEventEmitter.addListener('FOLLOW_REQUEST_SENT', (p: { userId: number }) => {
      if (p?.userId) {
        setRequested((prev) => {
          const n = new Set(prev);
          n.add(p.userId);
          return n;
        });
      }
    });
    return () => {
      subCancel.remove();
      subSent.remove();
    };
  }, []);

  const myId = useMemo(() => {
    const raw = (me as any)?.memberId ?? (me as any)?.id ?? (me as any)?.userId;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [me]);

  const list = useMemo(() => {
    const arr = friends ?? [];
    return arr.filter((u) => {
      const id = Number((u as any)?.id);
      if (!Number.isFinite(id)) return false;
      if (myId && id === myId) return false;
      if (followingSet.has(id)) return false;
      if (sentSet.has(id)) return false;
      if (requested.has(id)) return false;
      return true;
    });
  }, [friends, myId, followingSet, sentSet, requested]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const markRequested = useCallback((id: number) => {
    setRequested((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unmarkRequested = useCallback((id: number) => {
    setRequested((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /* 1. FCM 토큰 발급 및 업데이트 */
  const updateFcmToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await postFcmDeviceToken(token);
  };

  /* 2. 알림 설정 상태 확인 */
  const checkNotificationStatus = async () => {
    const serverStatus = await getNotificationsSettingStatus();
    const osStatus = await getOSNotificationPermissionStatus();

    const needsSetupFromServer = serverStatus === 'NEEDS_SETUP';
    const needsSetupFromOS = osStatus === 'undetermined';

    const needsSetup = needsSetupFromServer || needsSetupFromOS;

    if (needsSetup) {
      setIsNotificationPermissionModalOpen(true);
    } else {
      updateOSPermissionStatus();
    }
  };

  /* 3. OS 권한 요청 및 서버 동기화 */
  const updateOSPermissionStatus = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      await putOSPushAgreement(enabled);

      setIsNotificationPermissionModalOpen(false);

      if (!enabled) {
        Alert.alert('Notifications are turned off', 'You can enable notifications for Kori in Setting.');
        setIsNotificationNeedsSetup(false);
        return;
      }

      await initNotificationsSettingStatus();
      setIsNotificationNeedsSetup(false);
    } catch (error) {
      console.error('[ERROR] 알림 권한 요청 및 서버 동기화 실패:', error);
    }
  };

  useEffect(() => {
    console.log('isNotificationNeedsSetup:', isNotificationNeedsSetup);
    if (isNotificationNeedsSetup) {
      (async () => {
        await updateFcmToken();
        await checkNotificationStatus();
      })();
    }
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
          refreshControl={<RefreshControl refreshing={Boolean(isFetching && !isLoading)} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const uid = Number(item.id);
            const isSent = requested.has(uid) || requested.has(uid);

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
                  defaultExpanded={false}
                  mode={isSent ? 'sent' : 'friend'}
                  onFollow={async (id) => {
                    if ((myId && id === myId) || inFlight.has(id)) return;

                    const already = requested.has(id);
                    if (!already) markRequested(id);

                    try {
                      lock(id);
                      await followMutation.mutateAsync(id);
                      // UI 즉시 반영 + 다른 화면 동기화
                      markRequested(id);
                      DeviceEventEmitter.emit('FOLLOW_REQUEST_SENT', { userId: id });
                    } catch (e: any) {
                      Alert.alert('Failed', e?.response?.data?.message ?? 'Failed to send request.');
                    } finally {
                      unlock(id);
                    }
                  }}
                  onCancel={async (id) => {
                    if ((myId && id === myId) || inFlight.has(id)) return;
                    const wasSent = requested.has(id);
                    if (wasSent) unmarkRequested(id); // 낙관적 제거

                    try {
                      lock(id);
                      await cancelReqMutation.mutateAsync(id);
                      // 다른 화면(보낸목록 등)과 동기화
                      DeviceEventEmitter.emit('FOLLOW_REQUEST_CANCELLED', { userId: id });
                    } catch (e: any) {
                      if (e?.response?.status !== 404) {
                        Alert.alert('Failed', e?.response?.data?.message ?? 'Failed to cancel request.');
                      }
                      // 롤백
                      if (wasSent) markRequested(id);
                    } finally {
                      unlock(id);
                    }
                  }}
                  onChat={async () => {
                    const roomId = await createRoom({ otherUserId: uid });
                    router.push({
                      pathname: '/screens/chatscreen/ChattingRoomScreen',
                      params: { userId: String(uid), roomName: encodeURIComponent(item.name || 'Unknown'), roomId },
                    });
                  }}
                />
              </CardWrap>
            );
          }}
          ListEmptyComponent={
            <EmptyWrap>
              <EmptyText>
                <Text>No recommendations yet.</Text>
              </EmptyText>
            </EmptyWrap>
          }
        />
      )}
      {/* 알림 허용 모달 */}
      <NotificationPermissionModal
        visible={isNotificationPermissionModalOpen}
        onClose={() => setIsNotificationPermissionModalOpen(false)}
        onYesPress={async () => {
          await updateOSPermissionStatus();
          setIsNotificationPermissionModalOpen(false);
        }}
        onLaterPress={async () => {
          await putOSPushAgreement(false);
          setIsNotificationPermissionModalOpen(false);
        }}
      />
    </Safe>
  );
}

/* styles */
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
