import React, { useState, useRef } from "react";
import { Dimensions, FlatList, ImageBackground, Animated, useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { PageIndicator } from 'react-native-page-indicator';

import EmailSignButton from "@/components/EmailSignButton";
import GoogleSignInButton from '@/components/GoogleSignInButton';
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

type OnBoardingItem = {
  id: string;             // id는 문자열
  image: any;             // require()로 불러오기 때문에 any 사용
  TitleText: string;      // 제목 텍스트
  SubTitleText: string;   // 부제목 텍스트
};

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  const onBoardingData: OnBoardingItem[] = [
    { id: "1", image: require("@/assets/images/onboarding1.png"), TitleText: "Meet New friends", SubTitleText:"Connect with people abroad in Korea for\nstudy, work, travel, or more."},
    { id: "2", image: require("@/assets/images/onboarding2.png"), TitleText: "Chat Without Barriers", SubTitleText:"Chat in your own language.\nJust hit the translate button to read theirs."},
    { id: "3", image: require("@/assets/images/onboarding3.png"), TitleText: "Connect in our community", SubTitleText:"Have questions or stories to tell?\nJoin in and talk freely with everyone."},
  ];

  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;

  // 서버로 구글 로그인 토큰 전송
  const sendTokenToServer = async (code: string) => {
    try {
      const res = await axios.post<AppLoginResponse>(
        `${Config.SERVER_URL}/api/v1/member/google/app-login`,
        { code }
      );

      const { accessToken, refreshToken, userId } = res.data.data;

      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());

      router.replace('/(tabs)');
    } catch (error) {
      console.error('서버 요청 실패', error);
    }
  };

  // 구글 로그인
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
  
  const goEmailLoginScreen=()=>{
    router.push("./screens/login/GeneralLoginScreen");
  };
  return (
    <Container>
      {/* 온보딩 이미지 영역 */}
      <OnBoardingContainer>
        <AnimatedFlatList
          data={onBoardingData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item }) => (
            <Slide source={item.image} resizeMode="cover" style={{ width, height:height*0.55 }}>
              <Overlay>
                <OnBoardingText>{item.TitleText}</OnBoardingText>
                <OnBoardingSubText>{item.SubTitleText}</OnBoardingSubText>
              </Overlay>
            </Slide>
          )}
        />
        
        {/* 페이지 인디케이터 */}
        <PageIndicatorWrapper>
          <PageIndicator 
            count={onBoardingData.length} 
            current={animatedCurrent} 
            dashSize={14}  // 바 길이를 12px로 줄임
          />
        </PageIndicatorWrapper>
      </OnBoardingContainer>

      {/* 로그인 버튼 영역 */}
      <ButtonContainer>
        <GoogleSignInButton onPress={signIn} />
        <EmailSignButton onPress={goEmailLoginScreen}/>
        <SmallText>By singing up, you agree to our Terms.{'\n'} 
          See how we use your data in our <HighlightText> Privacy Policy.</HighlightText></SmallText>
      </ButtonContainer>
    </Container>
  );
};

export default LoginScreen;

// ---------------- Styled Components ----------------

const Container = styled.View`
  flex: 1;
  background-color: #1D1E1F;
`;

const OnBoardingContainer = styled.View`
  flex: 2;
`;

const AnimatedFlatList = styled(Animated.FlatList)``;

const Slide = styled(ImageBackground)`
  flex: 1;
  align-items: center;
`;

const Overlay = styled.View`
  position: absolute;
  bottom: -45;
  padding: 16px 24px;
  border-radius: 12px;
  align-items: center;
`;

const OnBoardingText = styled.Text`
  color: #FFFFFF;
  font-size: 24px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const OnBoardingSubText = styled.Text`
  color: #949899;
  font-size: 13px;
  text-align: center;
  font-family: PlusJakartaSans_400Regular;
  margin-top:10px;
`;

const PageIndicatorWrapper = styled.View`
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  align-items: center;
  
`;

const ButtonContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const SmallText=styled.Text`
  color:#848687;
  font-family:PlusJakartaSans_300Light;
  font-size:11px;
  text-align:center;
  margin-top:10px;

`;

const HighlightText = styled.Text`
  color: #FFFFFF;       /* 원하는 색상 */
  font-size: 12px;      /* 원하는 크기 */
  font-family: PlusJakartaSans_600SemiBold;
`;
