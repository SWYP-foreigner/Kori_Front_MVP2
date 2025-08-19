import React, { useEffect } from 'react';
import styled from 'styled-components/native';
// import * as SecureStore from 'expo-secure-store'; // JWT 토큰을 저장하기 위함
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from 'expo-router';
import { Alert } from "react-native";

import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleSignInButton from '../components/AppleSignInButton';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {

  const router = useRouter();
  const redirectUri="https://dev.ko-ri.cloud/api/v1/member/google/callback"
// //   // 디버깅용 - 실제 사용되는 URI 확인
//   const redirectUri = makeRedirectUri({
//   scheme: "koriapp",
//   useProxy: false // 네이티브 EAS 빌드에서는 반드시 false
// });
  // const redirectUri="https://dev.ko-ri.cloud/google/AppLogin";
  // console.log("실제 redirectUri:", redirectUri);
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: "299218725304-p6lv46kv7t6bhvglu72glfmaisvn7p5p.apps.googleusercontent.com",
  //   responseType: "code",
  //   redirectUri:redirectUri,
  //   scopes: ["openid", "profile", "email"],
  // });

  const [request,response,promptAsync]=Google.useAuthRequest({
    androidClientId:"299218725304-hukh2lg5tu68oestcc4t3lfhbeipgchr.apps.googleusercontent.com",
    webClientId:"299218725304-p6lv46kv7t6bhvglu72glfmaisvn7p5p.apps.googleusercontent.com"
  })
  useEffect(() => {
    console.log("들어옴");
    console.log("response",response);
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("인가 코드:", code);
      Alert.alert("인가 코드 받기 성공", code);

      // // ⚡ Spring Boot 서버로 인가 코드 전달
      // fetch("https://your-backend.com/oauth/google", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ code }),
      // })
      //   .then(async (res) => {
      //     if (!res.ok) throw new Error("서버 요청 실패");
      //     const data = await res.json();

      //     // 서버에서 JWT(access token 등) 발급받았다고 가정
      //     if (data?.jwt) {
      //       await SecureStore.setItemAsync("jwt", data.jwt);
      //       Alert.alert("로그인 성공", "JWT 저장 완료!");
      //       router.push("./(tabs)");
      //     }
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     Alert.alert("서버 전송 실패", err.message);
      //   });
    }
  }, [response]);

  return (
    <Container>
      <GoogleSignInButton
        disabled={!request}
        onPress={() => promptAsync()}
      />
      <AppleSignInButton />

      {/* 테스트용 / 로그인 없이 탭 이동 버튼 */}
      <TabsMoveButton onPress={() => router.push('./screens/makeprofile/TagStepScreen')}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>
    </Container>
  );
};

export default LoginScreen;

// Styled Components
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #0F0F10;
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
