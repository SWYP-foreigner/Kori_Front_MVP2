import React , { useEffect ,useState} from 'react';
import { Alert } from "react-native";
import styled from 'styled-components/native';
// import * as SecureStore from 'expo-secure-store'; // JWT 토큰을 저장하기 위함
import { useRouter } from 'expo-router';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AppleSignInButton from '@/components/AppleSignInButton';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes,
  isErrorWithCode
} from '@react-native-google-signin/google-signin';
import axios from "axios";
import * as AuthSession from 'expo-auth-session';
import * as Random from 'expo-random';
import * as Crypto from 'expo-crypto';


GoogleSignin.configure({
  "webClientId":"299218725304-p6lv46kv7t6bhvglu72glfmaisvn7p5p.apps.googleusercontent.com",
  "iosClientId":"299218725304-4di38h71hjma35m0qsjqcam10119le71.apps.googleusercontent.com"
});

const LoginScreen = () => {
  const router = useRouter();
  const [userInfo,setUserInfo]=useState<any>(null);
  const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      setUserInfo({ userInfo: response.data });
      console.log(response.data.idToken);
    //   try {
    //     const res = await axios.post("https://your-server.com/auth/google", {
    //       idToken: userInfo.idToken,
    //     });
    //     console.log("서버 JWT:", res.data.jwt);
    //   } catch (error) {
    //     console.error("서버 요청 실패:", error);
    //   }
    // } else {
    //   console.log(' sign in was cancelled by user');
    //   // sign in was cancelled by user
    // }
  } }catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          Alert.alert("sign in is in progress");
          // operation (eg. sign in) already in progress
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
           Alert.alert("play services not available");
          // Android only, play services not available or outdated
          break;
        default:
        // some other error happened
      }
    } else {
      Alert.alert("an error that's not related to google sign in occurred");
      // an error that's not related to google sign in occurred
    }
  }
};
 
  const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    console.log("google sign out");
    setUserInfo({ user: null }); // Remember to remove the user from your app's state as well
  } catch (error) {
    console.error(error);
  }
};

  return (
    <Container>
      <GoogleSignInButton
        // disabled={!request}
        onPress={handleGoogleSignIn}
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
