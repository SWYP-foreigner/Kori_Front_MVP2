import React, { useState, useCallback } from 'react';
import styled from 'styled-components/native';
import * as SecureStore from 'expo-secure-store'; // JWT 토큰을 저장하기 위함
import { WebView } from 'react-native-webview'; 
import { useRouter } from 'expo-router';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleSignInButton from '../components/AppleSignInButton';

const LoginScreen = () => {
  const router = useRouter();
  const [authUrl, setAuthUrl] = useState<string | null>(null); // authUrl이 웹뷰로 열림
  const [loadingWebView, setLoadingWebView] = useState(false);


  // 서버에서 인증 URL 가져오기
  const handleLogin = useCallback(async (provider: 'google' | 'apple') => {
    try {
      setLoadingWebView(true);
      const res = await fetch(`https://your-server.com/auth/${provider}`);
      const { url } = await res.json();
      setAuthUrl(url);
    } catch (err) {
      console.error(err);
      alert('서버 연결 실패');
    } finally {
      setLoadingWebView(false);
    }
  }, []);

  // WebView URL 감지
  const handleWebViewNavChange = async (event: any) => {
    const redirectUrl = event.url;
    if (redirectUrl.startsWith('myapp://login')) {  // 서버에서 리다이렉트 한 주소가 맞다면 ( 서버에서 보낸게 맞다면 )
      const token = redirectUrl.split('token=')[1]; // JWT 토큰 추출
      if (token) {
        await SecureStore.setItemAsync('jwt', token); // JWT 토큰 추출 후 SecureStore에 저장
        alert('로그인 성공');
        setAuthUrl(null);
        router.replace('./(tabs)'); // 로그인 성공 후 탭 화면 이동
      }
    }
  };

  // WebView 활성화 여부에 따라 화면 전환
  if (authUrl) {
    return (
      <WebViewContainer>
        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={handleWebViewNavChange}
          startInLoadingState
          renderLoading={() => <Loading />}
        />
      </WebViewContainer>
    );
  }

  // 로그인 전 화면
  return (
    <Container>
      <GoogleSignInButton onPress={() => handleLogin('google')} loading={loadingWebView} />
      <AppleSignInButton onPress={() => handleLogin('apple')} loading={loadingWebView} />

      {/* 테스트용 / 로그인 없이 탭 이동 버튼 */}
      <TabsMoveButton onPress={() => router.push('./(tabs)')}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>
    </Container>
  );
};

export default LoginScreen;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const WebViewContainer = styled.View`
  flex: 1;
`;

const Loading = styled.ActivityIndicator.attrs(() => ({
  size: 'large',
  color: '#000',
}))`
  flex: 1;
`;

const TabsMoveButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: gray;
  border-radius: 8px;
  width: 250px;
  align-items: center;
  margin-top: 20px;
`;

const TabsMoveText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 17px;
`;
