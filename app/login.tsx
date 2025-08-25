import React, { useState } from 'react';
import styled from 'styled-components/native';
// import * as SecureStore from 'expo-secure-store'; // JWT 토큰을 저장하기 위함
import AppleSignInButton from '@/components/AppleSignInButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  GoogleSignin, isErrorWithCode, isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from "axios";
import { useRouter } from 'expo-router';

GoogleSignin.configure({
  "webClientId": "86972168076-3bllmjnmkf9o6o7puri902co61jonbmi.apps.googleusercontent.com",
  "iosClientId": "86972168076-m7l8vrcmav3v3pofhu6ssheq39s9kvht.apps.googleusercontent.com",
  offlineAccess: true
});

const LoginScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);

  const sendTokenToServer = async (code) => {
    try {
      const res = await axios.post('https://dev.ko-ri.cloud/api/v1/member/google/app-login', {
        "code": code
      });
      console.log(res)
      console.log('서버 JWT:', res.data.token);
    } catch (error) {
      console.error('서버 요청 실패', error);
    }
  }
  
const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      console.log('들어옴');
      setUserInfo({ userInfo: response.data });
      console.log(response.data);
      const code=response.data.serverAuthCode;
      sendTokenToServer(code);
    } else {
      console.log('sign in was cancelled by user');
      // sign in was cancelled by user
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          console.log('operation (eg. sign in) already in progress');
          // operation (eg. sign in) already in progress
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log('Android only, play services not available or outdated');
          // Android only, play services not available or outdated
          break;
        default:
        // some other error happened
      }
    } else {
      console.log('error');
      // an error that's not related to google sign in occurred
    }
  }
};

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo({ user: null }); // Remember to remove the user from your app's state as well
      console.log('로그아웃');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <GoogleSignInButton
        // disabled={!request}
        onPress={signIn}
      />
      <AppleSignInButton />
      <TabsMoveButton onPress={signOut}>
        <TabsMoveText>구글 Sign out</TabsMoveText>
      </TabsMoveButton>
      {/* 테스트용 / 로그인 없이 탭 이동 버튼 */}
      <TabsMoveButton onPress={() => router.push('./(tabs)')}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>

      <ProfileMoveButton onPress={() => router.push('./screens/makeprofile/NameStepScreen')}>
        <ProfileMoveText>프로필 등록 화면으로 이동</ProfileMoveText>
      </ProfileMoveButton>

      <ProfileMoveButton onPress={() => router.push('./screens/chatscreen/ChattingRoomScreen')}>
        <ProfileMoveText>현재 개발 화면으로 이동</ProfileMoveText>
      </ProfileMoveButton>
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
