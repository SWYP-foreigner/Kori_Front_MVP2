/* eslint-disable react-native/no-inline-styles */
import queryClient from '@/api/queryClient';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { ProfileProvider } from './contexts/ProfileContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

function AppLayout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    // eslint-disable-next-line react-native/no-color-literals
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: '#1D1E1F' }}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PlusJakartaSans_300Light,
    InstrumentSerif_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    // ------------ FCM 초기화 ------------ //
    const initFCM = async () => {
      try {
        // 1. 알림 권한 요청
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.error('알림 권한 허용 필요'); // TODO 알림 권한 허용 관련 모달 UI 필요
        }

        // 2. APNs iOS 디바이스 등록
        await messaging().registerDeviceForRemoteMessages();

        // 3. FCM 토큰 획득
        const token = await messaging().getToken();
        console.log('fcm token:', token); // TODO 서버로 FCM 토큰 전송 API 구현
      } catch (err) {
        console.error('FCM 초기화 실패:', err);
      }
    };

    initFCM();

    // 4. foreground 메시지 수신 메서드 초기화
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage)); // TODO foreground 메시지 알림 표시 구현(/w notifee)
    });

    return unsubscribe;
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AppLayout>
        <ProfileProvider>
          <QueryClientProvider client={queryClient}>
            <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <Toast />
          </QueryClientProvider>
        </ProfileProvider>
      </AppLayout>
    </SafeAreaProvider>
  );
}
