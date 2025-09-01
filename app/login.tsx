import AppleSignInButton from '@/components/AppleSignInButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import styled from 'styled-components/native';
import api from '@/api/axiosInstance';
import { Config } from '@/src/lib/config';

GoogleSignin.configure({
  webClientId: `${Config.GOOGLE_WEB_CLIENT_ID}`,
  iosClientId: `${Config.GOOGLE_IOS_CLIENT_ID}`,
  offlineAccess: true,
});

type AppLoginResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    userId: number;
  };
  message: string;
  timestamp: string;
};

const LoginScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  const sendTokenToServer = async (code: string) => {
    try {
      const res = await axios.post<AppLoginResponse>(
        `${Config.SERVER_URL}/api/v1/member/google/app-login`,
        { code }
      );

      const { accessToken, refreshToken,userId,isNewUser} = res.data.data;
      
      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken); // (선택)
      await SecureStore.setItemAsync('MyuserId', userId.toString());
      console.log("로그인 성공");
      console.log("userId",userId);
      
      await new Promise((r) => setTimeout(r, 0));
      // if(isNewUser)
      // {
      //   router.replace('./screens/makeprofile/NameStepScreen');
      // }else{
      //    router.replace('/(tabs)');
      // }
        router.replace('/(tabs)');
    } catch (error) {
      console.error('서버 요청 실패', error);
    }
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        setUserInfo({ userInfo: response.data });
        const code = response.data.serverAuthCode;
        if (!code) {
          console.log('serverAuthCode 없음 (Google 설정 확인 필요)');
          return;
        }
        await sendTokenToServer(code);
      } else {
        console.log('사용자가 로그인 취소');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('이미 로그인 진행 중');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play Services 문제 (Android)');
            break;
          default:
            console.log('기타 로그인 오류', error);
        }
      } else {
        console.log('Google Sign-In 이외 오류', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      const res=await api.post("/api/v1/member/logout");
      await SecureStore.deleteItemAsync('jwt');
      await SecureStore.deleteItemAsync('refresh');
      await SecureStore.deleteItemAsync('MyuserId');
      setUserInfo(null);
      console.log('로그아웃 완료',res);
      
    } catch (error) {
      console.error(error);
    }
  };
  
  const temp = async () => {
  console.log("Temp 들어옴");
  try {
    const res = await api.post("/api/v1/member/refresh");
    console.log(res);
  } catch (error) {
    // 여기에 에러 응답 본문을 출력하는 코드를 추가합니다.
    console.error("Axios Error:", error.response ? error.response.data : error.message);
  }
};

  return (
    <Container>
      <GoogleSignInButton onPress={signIn} />
      <AppleSignInButton/>

      <TabsMoveButton onPress={temp}>
        <TabsMoveText>Refresh Token 테스트</TabsMoveText>
      </TabsMoveButton>

      <TabsMoveButton onPress={signOut}>
        <TabsMoveText>구글 Sign out</TabsMoveText>
      </TabsMoveButton>

      <TabsMoveButton onPress={() => router.push('./(tabs)')}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>

      <ProfileMoveButton onPress={() => router.push('./screens/makeprofile/NameStepScreen')}>
        <ProfileMoveText>프로필 등록 화면으로 이동</ProfileMoveText>
      </ProfileMoveButton>

      <ProfileMoveButton onPress={() => router.push('./screens/chatscreen/ChatInsideMember')}>
        <ProfileMoveText>현재 개발 화면으로 이동</ProfileMoveText>
      </ProfileMoveButton>
    </Container>
  );
};

export default LoginScreen;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #0f0f10;
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
const ProfileMoveButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: yellow;
  border-radius: 8px;
  width: 250px;
  align-items: center;
  margin-top: 20px;
`;
const ProfileMoveText = styled.Text`
  color: black;
  font-weight: bold;
  font-size: 17px;
`;