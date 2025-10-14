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
import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { ProfileProvider } from './contexts/ProfileContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useCallback, useState } from 'react';
import axios from 'axios';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync().catch(() => {});
import messaging from '@react-native-firebase/messaging';
import { messageHandler } from '@/lib/fcm/messageHandler';

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
    /* ------------ foreground 메시지 수신 메서드 초기화 ------------ */
    const unsubscribeOnMessage = messaging().onMessage(messageHandler);
    return unsubscribeOnMessage;
  }, []);

  const router = useRouter();
  const [checkingToken, setCheckingToken] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAndRefreshToken = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh');
      if (!refreshToken) {
        setIsLoggedIn(false);
        return;
      }

      const res = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/v1/member/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, userId } = res.data.data;

      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', newRefreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());

      setIsLoggedIn(true);
    } catch (error) {
      console.error('자동 로그인 실패:', error);
      setIsLoggedIn(false);
    } finally {
      setCheckingToken(false);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (loaded) checkAndRefreshToken();
  }, [loaded]);

  if (!loaded || checkingToken) return null;

  return (
    <SafeAreaProvider>
      <AppLayout>
        <ProfileProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              {isLoggedIn ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="login" />}
              <Stack.Screen name="+not-found" />
            </Stack>
            <Toast />
          </QueryClientProvider>
        </ProfileProvider>
      </AppLayout>
    </SafeAreaProvider>
  );
}
