import { useEffect, useState, useCallback } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Redirect } from 'expo-router';
import CustomSplashScreen from './screens/splash/CustomSplashScreen';
import LoginScreen from './login';
SplashScreen.preventAutoHideAsync(); // 자동 숨김 방지

export default function Index() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        // 폰트 로딩
        await Font.loadAsync({
          'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
          'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
          'PlusJakartaSans-Light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadResources();
  }, []);

  const onReady = useCallback(async () => {
    if (fontsLoaded) {
      // 폰트 로딩이 끝났을 때 기본 splash 숨김
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onReady();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // 기본 splash가 계속 유지됨 (null 반환해도 화면 안 비어짐)
    return null;
  }

  // 로딩 끝나면 내가 만든 커스텀 SplashScreen 라우트로 이동
  return <CustomSplashScreen/>;
}
