import queryClient from '@/api/queryClient';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import {
  initNotificationsSettingStatus,
  postFcmDeviceToken,
  putOSPushAgreement
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
  const isCheckingPermissions = useRef(false);

  // 채팅방 스크린들에서는 탭 바를 숨김
  const shouldHideTabBar = pathname.includes('/CreateSpaceScreen') || pathname.includes('/ChattingRoomScreen');

  /* 1. FCM 토큰 등록 */
  const updateFcmToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await postFcmDeviceToken(token);
  };

  /* 2. OS 권한 요청 및 서버 동기화 */
  /* 2. OS 권한 요청 및 서버 동기화 (expo-notifications로 통일) */
  const initOSPermissionStatus = async () => {
    try {
      // 1. expo-notifications를 사용해 권한 요청
      const { status } = await Notifications.requestPermissionsAsync();
      const enabled = status === 'granted';

      // 2. 로그 확인 (Provisional이 아닌 granted/denied가 찍힙니다)
      console.log('✨✨✨✨✨✨✨✨✨✨ OS 알림 허용 상태 (Expo):', status);

      // 3. 서버에 OS 권한 상태 동기화
      await putOSPushAgreement(enabled);

      setIsNotificationPermissionModalOpen(false);

      if (!enabled) {
        Alert.alert('Notifications are turned off', 'You can enable notifications for Kori in Settings.');
        return;
      }

      // 4. 서버에 알림 상세 설정 초기화
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

      // [2] 잠금(Lock) 상태를 확인하는 조건 추가
      if (isActivated && !isCheckingPermissions.current) {
        try {
          isCheckingPermissions.current = true; // <--- [3] 함수가 시작될 때 잠그기

          await updateFcmToken();

          const { status } = await Notifications.requestPermissionsAsync();
          // ... (if, else if 로직은 그대로 둡니다)
          // ...

          await queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
        } catch (error) {
          console.error('[ERROR] 알림 권한 갱신 중 오류 발생:', error);
        } finally {
          isCheckingPermissions.current = false; // <--- [4] 모든 작업(성공/실패)이 끝나면 잠금 해제
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
