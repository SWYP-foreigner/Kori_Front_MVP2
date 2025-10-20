import AppleSignInButton from '@/components/AppleSignInButton';
import EmailSignButton from '@/components/EmailSignButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Config } from '@/src/lib/config';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as AppleAuthentication from 'expo-apple-authentication';
import { randomUUID } from 'expo-crypto';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { PageIndicator } from 'react-native-page-indicator';
import styled from 'styled-components/native';
import api from '@/api/axiosInstance';
import { requestLocationPermission } from '@/lib/location/requestLocationPermission';
import { patchLocation } from '@/api/member/location';

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
    isNewUser: boolean;
  };
  message: string;
  timestamp: string;
};

type OnBoardingItem = {
  id: string; // id는 문자열
  image: any; // require()로 불러오기 때문에 any 사용
  TitleText: string; // 제목 텍스트
  SubTitleText: string; // 부제목 텍스트
};

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allCheck, setAllCheck] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [isAppleLogin, setIsAppleLogin] = useState(false);

  const onBoardingData: OnBoardingItem[] = [
    {
      id: '1',
      image: require('@/assets/images/onboarding1.png'),
      TitleText: 'Meet New friends',
      SubTitleText: 'Connect with people abroad in Korea for\nstudy, work, travel, or more.',
    },
    {
      id: '2',
      image: require('@/assets/images/onboarding2.png'),
      TitleText: 'Chat Without Barriers',
      SubTitleText: 'Chat in your own language.\nJust hit the translate button to read theirs.',
    },
    {
      id: '3',
      image: require('@/assets/images/onboarding3.png'),
      TitleText: 'Connect in our community',
      SubTitleText: 'Have questions or stories to tell?\nJoin in and talk freely with everyone.',
    },
  ];

  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;

  const confirmAndGoSetProfilePage = async () => {
    const { latitude, longitude } = await requestLocationPermission();
    await patchLocation(latitude, longitude);

    setModalVisible(false);
    if (isAppleLogin) {
      setIsAppleLogin(false);
      router.push('/screens/makeprofile/GenderStepScreen');
    } else {
      router.push('/screens/makeprofile/NameStepScreen');
    }
  };

  // 서버로 구글 로그인 토큰 전송
  const sendGoogleTokenToServer = async (code: string) => {
    try {
      const res = await axios.post<AppLoginResponse>(`${Config.SERVER_URL}/api/v1/member/google/app-login`, { code });

      const { accessToken, refreshToken, userId, isNewUser } = res.data.data;
      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());

      if (isNewUser) {
        showModal();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('서버 요청 실패', error);
    }
  };

  // 구글 로그인
  const googleSignIn = async () => {
    try {
      setGoogleLoading(true); // 로딩 시작
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        setUserInfo({ userInfo: response.data });
        const code = response.data.serverAuthCode;
        if (!code) {
          setGoogleLoading(false); // 로딩 끝

          return;
        }
        await sendGoogleTokenToServer(code);
      } else {
        console.error('사용자가 로그인 취소');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
        }
      } else {
        console.error('Google Sign-In 이외 오류', error);
      }
    } finally {
      setGoogleLoading(false); // 로딩 끝
    }
  };

  // 애플 로그인
  const appleSignIn = async () => {
    try {
      setAppleLoading(true);
      const rawNonce = randomUUID();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
      });

      const res = await axios.post<AppLoginResponse>(
        // 애플 로그인 API 주소로 바꿔야함
        `${Config.SERVER_URL}/api/v1/member/apple/app-login`,
        {
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          nonce: rawNonce,
          email: credential.email,
          fullName: {
            givenName: credential.fullName?.givenName,
            familyName: credential.fullName?.familyName,
          },
        },
      );

      const { accessToken, refreshToken, userId, isNewUser } = res.data.data;
      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());

      if (isNewUser) {
        try {
          const res = await api.get(`${Config.SERVER_URL}/api/v1/member/${userId}/is-apple`);
          const { isRejoiningWithoutFullName } = res.data.data;
          if (isRejoiningWithoutFullName) {
            // 알림 띄워주기
            Alert.alert(
              'Apple Sign-In Not Completed!',
              [
                'Go to iOS Settings → [Your Name/Apple ID]  → Password & Security → Sign in with Apple',
                'find this app, and disconnect it.',
                'Then return to the app and sign up again to complete the process',
              ].join('\n'),
              [{ text: 'OK', onPress: () => console.log('ok') }],
            );
          } else {
            // 바로 약관 동의 보여주기
            showModal();
            setIsAppleLogin(true);
          }
        } catch (error) {
          console.error('error', error);
        }
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
      } else {
        console.error('에러코드', e);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  // 이메일 로그인 화면으로 이동
  const goEmailLoginScreen = async () => {
    router.push('./screens/login/GeneralLoginScreen');
  };

  // 약관 동의 화면 보여줌
  const showModal = () => {
    setModalVisible(true);
  };

  // TermsAndConditions 상세 페이지
  const showTermsAndConditions = () => {
    router.push('/screens/login/TermsAndConditionsScreen');
  };

  // PrivacyPolicy 상세 페이지
  const showPrivacyPolicy = () => {
    router.push('/screens/login/PrivacyPolicyScreen');
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        {/* 온보딩 이미지 영역 */}
        <OnBoardingContainer>
          <AnimatedFlatList
            data={onBoardingData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
            renderItem={({ item }) => (
              <Slide source={item.image} resizeMode="cover" style={{ width, height: height * 0.55 }}>
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
              dashSize={14}
              color="#02F59B"
              activeColor="#02F59B"
            />
          </PageIndicatorWrapper>
        </OnBoardingContainer>

        {/* 로그인 버튼 영역 */}
        <ButtonContainer>
          {Platform.OS === 'ios' ? (
            <AppleSignInButton onPress={appleSignIn} loading={appleLoading} />
          ) : (
            <GoogleSignInButton onPress={googleSignIn} loading={googleLoading} />
          )}
          <EmailSignButton onPress={goEmailLoginScreen} />
          <SmallText>
            By singing up, you agree to our Terms.{'\n'}
            See how we use your data in our <HighlightText> Privacy Policy.</HighlightText>
          </SmallText>
        </ButtonContainer>
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <ModalOverlay activeOpacity={1}>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetHandle />
              </BottomSheetHeader>
              <BottomSheetTitle>Please agree to the terms to continue.</BottomSheetTitle>
              <AllCheckBoxContainer>
                <CheckBox
                  onPress={() => {
                    const newValue = !allCheck; // 토글 후 값
                    setAllCheck(newValue);
                    setCheck1(newValue);
                    setCheck2(newValue);
                    setCheck3(newValue);
                  }}
                  check={allCheck}
                >
                  {allCheck && <Entypo name="check" size={15} color="#02F59B" />}
                </CheckBox>
                <AllCheckText>I agree to all.</AllCheckText>
              </AllCheckBoxContainer>
              <Divider />
              <CheckBoxContainer>
                <CheckBox onPress={() => setCheck1(!check1)} check={check1}>
                  {check1 && <Entypo name="check" size={15} color="#02F59B" />}
                </CheckBox>
                <CheckText>(Required) I am over 14 years old.</CheckText>
              </CheckBoxContainer>
              <CheckBoxContainer>
                <CheckBox onPress={() => setCheck2(!check2)} check={check2}>
                  {check2 && <Entypo name="check" size={15} color="#02F59B" />}
                </CheckBox>
                <CheckText>(Required) Terms & Conditions</CheckText>
                <TouchableOpacity onPress={showTermsAndConditions}>
                  <MaterialIcons name="navigate-next" size={35} color="#848687" />
                </TouchableOpacity>
              </CheckBoxContainer>
              <CheckBoxContainer>
                <CheckBox onPress={() => setCheck3(!check3)} check={check3}>
                  {check3 && <Entypo name="check" size={15} color="#02F59B" />}
                </CheckBox>
                <CheckText>(Required) Privacy Policy</CheckText>
                <TouchableOpacity onPress={showPrivacyPolicy}>
                  <MaterialIcons name="navigate-next" size={35} color="#848687" />
                </TouchableOpacity>
              </CheckBoxContainer>
              <ConfirmButton disabled={!allCheck} allCheck={allCheck} onPress={confirmAndGoSetProfilePage}>
                <ConfirmText>Confirm</ConfirmText>
              </ConfirmButton>
            </BottomSheetContent>
          </ModalOverlay>
        </Modal>
      </Container>
    </SafeArea>
  );
};

export default LoginScreen;

// ---------------- Styled Components ----------------

const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;

const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
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
  bottom: -25;
  padding: 16px 24px;
  border-radius: 12px;
  align-items: center;
  width: 100%;
`;

const OnBoardingText = styled.Text`
  color: #ffffff;
  font-size: 24px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const OnBoardingSubText = styled.Text`
  color: #949899;
  font-size: 13px;
  text-align: center;
  font-family: PlusJakartaSans_400Regular;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const PageIndicatorWrapper = styled.View`
  position: absolute;
  bottom: ${Platform.OS === 'ios' ? '-30px' : '0px'};
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

const SmallText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_300Light;
  font-size: 11px;
  text-align: center;
  margin-top: 10px;
`;

const HighlightText = styled.Text`
  color: #ffffff; /* 원하는 색상 */
  font-size: 12px; /* 원하는 크기 */
  font-family: PlusJakartaSans_600SemiBold;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheetContent = styled.View`
  background-color: #353637;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 60%;
  padding-bottom: 40px;
`;

const BottomSheetHeader = styled.View`
  align-items: center;
  padding: 15px 20px 10px 20px;
`;

const BottomSheetHandle = styled.View`
  width: 45px;
  height: 6px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const BottomSheetTitle = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-family: PlusJakartaSans_600SemiBold;
  margin-left: 30px;
`;

const AllCheckBoxContainer = styled.View`
  height: 60px;
  margin: 20px 5px 10px 5px;
  flex-direction: row;
  padding-left: 20px;
  align-items: center;
`;
const AllCheckText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-family: PlusJakartaSans_600SemiBold;
  margin-left: 15px;
`;

const Divider = styled.View`
  width: 90%;
  align-self: center;
  height: 2px;
  background-color: #616262;
  margin-bottom: 10px;
`;

const CheckBoxContainer = styled.View`
  height: 50px;
  margin: 5px;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 15px;
`;

const CheckBox = styled.TouchableOpacity`
  border-color: ${(props) => (props.check ? '#02F59B' : '#CCCFD0')};
  border-width: 1.25px;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
`;
const CheckText = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-family: PlusJakartaSans_500Medium;
  margin-left: 15px;
  flex: 1;
`;

const ConfirmButton = styled.TouchableOpacity`
  opacity: ${(props) => (props.allCheck ? 1 : 0.5)};
  background-color: #02f59b;
  height: 50px;
  width: 90%;
  align-self: center;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin: 20px 0px;
`;

const ConfirmText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;
