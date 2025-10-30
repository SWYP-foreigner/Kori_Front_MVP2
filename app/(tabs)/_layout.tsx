import queryClient from '@/api/queryClient';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import {
  getNotificationsSettingStatus,
  initNotificationsSettingStatus,
  postFcmDeviceToken,
  putOSPushAgreement,
} from '@/src/features/notification/api/notifications';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Dimensions, Image, Text } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const TAB_BAR_HEIGHT = screenHeight * 0.117; // 화면 높이의 15%

export default function TabLayout() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [isNotificationPermissionModalOpen, setIsNotificationPermissionModalOpen] = useState(false);
  const pathname = usePathname();

  // 채팅방 스크린들에서는 탭 바를 숨김
  const shouldHideTabBar = pathname.includes('/CreateSpaceScreen') || pathname.includes('/ChattingRoomScreen');

  /* 1. FCM 토큰 등록 */
  const updateFcmToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await postFcmDeviceToken(token);
  };

  /* 2. OS 권한 요청 및 서버 동기화 */
  const initOSPermissionStatus = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('✨✨✨✨✨✨✨✨✨✨ OS 알림 허용 상태:', authStatus);
      await putOSPushAgreement(enabled);

      setIsNotificationPermissionModalOpen(false);

      if (!enabled) {
        Alert.alert('Notifications are turned off', 'You can enable notifications for Kori in Settings.');
        return;
      }

      await initNotificationsSettingStatus(true);
    } catch (error) {
      console.error('[ERROR] Notification permission or sync failed:', error);
    }
  };

  /* 3. 앱 초기화 시마다 OS 알림 권한을 검사 및 서버와 동기화 */
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      const isActivated =
        (appState.current.match(/inactive|background/) && nextState === 'active') || // 백그라운드에서 포그라운드 진입 시
        (appState.current === 'active' && nextState === 'active'); // 앱 최초 실행 시

      if (isActivated) {
        try {
          await updateFcmToken();

          const { status } = await Notifications.getPermissionsAsync();

          if (status === 'undetermined') {
            // 아직 권한 설정 전인 경우 설정 요청 모달 표시
            setIsNotificationPermissionModalOpen(true);
            return;
          }

          if (status === 'denied') {
            // OS 권한이 거부된 경우 서버 알림 전체 비활성화
            await initNotificationsSettingStatus(false);
          } else if (status === 'granted') {
            // OS 권한이 허용된 경우 서버 상태 점검
            const serverStatus = await getNotificationsSettingStatus();
            if (serverStatus === 'NEEDS_SETUP') {
              // 서버 설정이 필요한 경우 OS 상태 동기화 여부와 알림 상세 설정을 모두 true로 초기화
              await putOSPushAgreement(true);
              await initNotificationsSettingStatus(true);
            }
          }
          await queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
        } catch (error) {
          console.error('[ERROR] 알림 권한 갱신 중 오류 발생:', error);
        }
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    handleAppStateChange('active');

    return () => subscription.remove();
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: shouldHideTabBar
            ? { display: 'none' }
            : {
                backgroundColor: '#1D1E1F', // 원하는 배경색
                borderTopWidth: 1,
                borderColor: '#353637',
                height: TAB_BAR_HEIGHT,
                paddingTop: 10,
              },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? '#FFFFFF' : '#616262',
                  fontSize: 13,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}
              >
                Find
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused ? require('@/assets/images/tab_find_click.png') : require('@/assets/images/tab_find.png')
                }
                style={{ width: 32, height: 32 }} // 원하는 크기
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? '#FFFFFF' : '#616262',
                  fontSize: 13,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}
              >
                Chat
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused ? require('@/assets/images/tab_chat_click.png') : require('@/assets/images/tab_chat.png')
                }
                style={{ width: 32, height: 32 }} // 원하는 크기
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? '#FFFFFF' : '#616262',
                  fontSize: 13,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}
              >
                Community
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('@/assets/images/tab_community_click.png')
                    : require('@/assets/images/tab_community.png')
                }
                style={{ width: 32, height: 32 }} // 원하는 크기
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            title: 'MyPage',
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  color: focused ? '#FFFFFF' : '#616262',
                  fontSize: 13,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}
              >
                My page
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused ? require('@/assets/images/tab_mypage_click.png') : require('@/assets/images/tab_mypage.png')
                }
                style={{ width: 32, height: 32 }} // 원하는 크기
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tabs>
      {/* 알림 권한 모달 */}
      <NotificationPermissionModal
        visible={isNotificationPermissionModalOpen}
        onClose={() => setIsNotificationPermissionModalOpen(false)}
        onYesPress={async () => {
          await initOSPermissionStatus();
        }}
        onLaterPress={async () => {
          await putOSPushAgreement(false);
          await initNotificationsSettingStatus(false);
        }}
      />
    </>
  );
}
