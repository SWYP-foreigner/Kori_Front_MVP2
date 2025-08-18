import { Redirect } from 'expo-router';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function Index() {
    const [fontsLoaded,setFontsLoaded]=useState(false);
    
    
  useEffect(() => {
    Font.loadAsync({
      'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
      'PlusJakartaSans-Regular':require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
      'PlusJakartaSans-Light':require('../assets/fonts/PlusJakartaSans-Light.ttf')
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) return null; // 앱 시작 전에 잠깐 빈 화면
    return <Redirect href="/login" />;
}