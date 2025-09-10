import React, { useState, useRef } from "react";
import { Dimensions, FlatList, ImageBackground, Animated, useWindowDimensions, TouchableOpacity ,Modal,Platform} from "react-native";
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
import AppleSignInButton from "@/components/AppleSignInButton";
import { Config } from '@/src/lib/config';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { ACCESS_KEY, isRefreshBlocked, REFRESH_KEY } from "@/src/lib/auth/session";
import api from "@/api/axiosInstance";
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
    isNewUser:boolean;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [allCheck,setAllCheck]=useState(false);
  const [check1,setCheck1]=useState(false);
  const [check2,setCheck2]=useState(false);
  const [check3,setCheck3]=useState(false);

  const onBoardingData: OnBoardingItem[] = [
    { id: "1", image: require("@/assets/images/onboarding1.png"), TitleText: "Meet New friends", SubTitleText:"Connect with people abroad in Korea for\nstudy, work, travel, or more."},
    { id: "2", image: require("@/assets/images/onboarding2.png"), TitleText: "Chat Without Barriers", SubTitleText:"Chat in your own language.\nJust hit the translate button to read theirs."},
    { id: "3", image: require("@/assets/images/onboarding3.png"), TitleText: "Connect in our community", SubTitleText:"Have questions or stories to tell?\nJoin in and talk freely with everyone."},
  ];

  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;

  const goSetProfilePage=()=>{
       router.push('/screens/makeprofile/NameStepScreen');
  };


  // 서버로 구글 로그인 토큰 전송
  const sendTokenToServer = async (code: string) => {
    try {
      const res = await axios.post<AppLoginResponse>(
        `${Config.SERVER_URL}/api/v1/member/google/app-login`,
        { code }
      );

      const { accessToken, refreshToken, userId ,isNewUser} = res.data.data;
      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());

      if(isNewUser)
      {
        showModal();
      }
      else{
        router.replace('/(tabs)');
      }

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
  
  const goEmailLoginScreen=async()=>{
   
    router.push("./screens/login/GeneralLoginScreen");
  };
  
  const showModal = () => {
    setModalVisible(true); 
  };

  const showTermsAndConditions=()=>{
      router.push("./TermsAndConditionsScreen");
  };
  
  const showPrivacyPolicy=()=>{
    router.push("./PrivacyPolicyScreen");
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
            color="#02F59B"
            activeColor="#02F59B"
          />
        </PageIndicatorWrapper>
      </OnBoardingContainer>

      {/* 로그인 버튼 영역 */}
      <ButtonContainer>
        {Platform.OS==='ios'?(<AppleSignInButton/>):(<GoogleSignInButton onPress={signIn} />)}
        <EmailSignButton onPress={goEmailLoginScreen}/>
        <SmallText>By singing up, you agree to our Terms.{'\n'} 
          See how we use your data in our <HighlightText> Privacy Policy.</HighlightText></SmallText>
      </ButtonContainer>
           <Modal
                  visible={modalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalVisible(false)}
                >
                <ModalOverlay  activeOpacity={1}>
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
                          >{allCheck&&<Entypo name="check" size={15} color="#02F59B" />}</CheckBox><AllCheckText>I agree to all.</AllCheckText>

                        </AllCheckBoxContainer>
                        <Divider/>
                        <CheckBoxContainer>
                          <CheckBox
                             onPress={() =>setCheck1(!check1)}
                            check={check1}
                          >{check1&&<Entypo name="check" size={15} color="#02F59B" />}</CheckBox><CheckText>(Required) I am over 14 years old.</CheckText>

                        </CheckBoxContainer>
                        <CheckBoxContainer>
                           <CheckBox onPress={() =>setCheck2(!check2)}
                             check={check2}
                            >
                            {check2&&<Entypo name="check" size={15} color="#02F59B" />}
                            </CheckBox><CheckText>(Required) Terms & Conditions</CheckText>
                            <TouchableOpacity onPress={showTermsAndConditions}>
                            <MaterialIcons name="navigate-next" size={35} color="#848687" /></TouchableOpacity>
                        </CheckBoxContainer>
                        <CheckBoxContainer>
                           <CheckBox onPress={() =>setCheck3(!check3)}
                            check={check3}
                            >
                            {check3&&<Entypo name="check" size={15} color="#02F59B" />}
                            </CheckBox><CheckText>(Required) Privacy Policy</CheckText>
                            <TouchableOpacity onPress={showPrivacyPolicy}>
                            <MaterialIcons name="navigate-next" size={35} color="#848687" /></TouchableOpacity>
                        </CheckBoxContainer>
                     <ConfirmButton 
                      disabled={!allCheck}
                      allCheck={allCheck}
                      onPress={goSetProfilePage}
                      >
                      <ConfirmText>Confirm</ConfirmText>
                     </ConfirmButton>
                    </BottomSheetContent>
                  </ModalOverlay>
                </Modal>
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
  font-family:PlusJakartaSans_600SemiBold;
  margin-left:30px;
`;

  const AllCheckBoxContainer=styled.View`
    height:60px;
    margin:20px 5px 10px 5px;
    flex-direction:row;
    padding-left:20px;
    align-items:center;

  `;
  const AllCheckText=styled.Text`
    color: #FFFFFF;
    font-size:15px;
    font-family:PlusJakartaSans_600SemiBold;
    margin-left:15px;
    
  `;

  const Divider=styled.View`
    width: 90%;
    align-self:center;
    height: 2px;
    background-color: #616262;
    margin-bottom:10px;
  `;

  const CheckBoxContainer=styled.View`
   
    height:50px;
    margin:5px;
    flex-direction:row;
    align-items:center;
    padding-left:20px;
    padding-right: 15px;
  `;

const CheckBox=styled.TouchableOpacity`
    border-color: ${(props) => (props.check ? "#02F59B" : "#CCCFD0")};
    border-width:1.25px;
    width:20px;
    height:20px;
    align-items:center;
    justify-content:center;

`;
const CheckText=styled.Text`
    color: #FFFFFF;
    font-size:13px;
    font-family:PlusJakartaSans_500Medium;
    margin-left:15px;
    flex:1;
`;

const ConfirmButton=styled.TouchableOpacity`
    opacity:${(props)=>(props.allCheck? 1 : 0.5)};
    background-color:#02F59B;
    height:50px;
    width:90%;
    align-self:center;
    border-radius:8px;
    align-items:center;
    justify-content:center;
    margin:20px 0px;
`;

const ConfirmText=styled.Text`
    color:#1D1E1F;
    font-size:15px;
    font-family:PlusJakartaSans_500Medium;
`;
