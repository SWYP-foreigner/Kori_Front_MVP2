import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { StatusBar, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { Config } from '@/src/lib/config';
import Entypo from '@expo/vector-icons/Entypo';
import * as SecureStore from 'expo-secure-store';

enum isKoriEmail {
  Init = 'Init',
  Exist = 'Exist',
  NotExist = 'NotExist',
}

enum isCorrectCode {
  Init = 'Init',
  Fail = 'Fail',
  Success = 'Success',
}

const CreateAccountScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isExistEmail, setIsExistEmail] = useState<isKoriEmail>(isKoriEmail.Init);
  const [isCorrect, setIsCorrect] = useState<isCorrectCode>(isCorrectCode.Init);
  const [code, setCode] = useState('');
  const completeCondition = isExistEmail === isKoriEmail.Exist && isCorrect === isCorrectCode.Success;

  const [EmailChecks, setEmailChecks] = useState({
    isnull: true,
    isEmail: false,
  });

  useEffect(() => {
    setEmailChecks({
      isnull: email.length === 0,
      isEmail: isEmail(),
    });
  }, [email]);

  const isEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 가입된 이메일 중복 체크 후 -> 이메일 인증 코드 발송
  const VerifyEmail = async () => {
    try {
      const res = await axios.post(`${Config.SERVER_URL}/api/v1/member/email/check`, { email: email });
      console.log('테스트', res.data);
      const { exists } = res.data.data;
      if (exists) {
        console.log('들어옴12313');
        const res = await axios.post(`${Config.SERVER_URL}/api/v1/member/password/forgot`, {
          email: email,
          lang: 'en',
        });
        console.log('테스트2', res.data);
        setIsExistEmail(isKoriEmail.Exist);
        console.log('이메일 인증 코드 발송', res.data);
      } else {
        console.log('들어옴');
        setIsExistEmail(isKoriEmail.NotExist);
      }
    } catch (err) {
      console.error('이메일 확인 중 에러 발생', err);
    }
  };

  // 이메일 인증 코드 보내서 검증 받음
  const verifyCode = async () => {
    try {
      const res = await axios.post(`${Config.SERVER_URL}/api/v1/member/verify-code`, {
        email: email,
        verificationCode: code,
      });
      console.log('이메일 인증 코드 검증', res.data);
      const { data } = res.data;

      if (data) {
        setIsCorrect(isCorrectCode.Success);
      } else {
        setIsCorrect(isCorrectCode.Fail);
        console.log('인증실패');
      }
    } catch (err) {
      console.error('코드 확인 중 에러 발생', err);
    }
  };

  const goNextScreen = async () => {
    await SecureStore.setItemAsync('emailCode', code);
    router.replace({
      pathname: './ResetPasswordScreen',
      params: { email: email },
    });
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <HeaderContainer>
          <HeaderBox>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={23} color="#CCCFD0" />
            </TouchableOpacity>
            <HeaderTitleText>Reset Password</HeaderTitleText>
          </HeaderBox>
        </HeaderContainer>
        <KeyboardAvoidingView>
          {/* ScrollView 안에는 입력 폼만 */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <GeneralLoginContainer>
              {/* Email */}
              <TitleContainer>
                <TitleText>Email</TitleText>
              </TitleContainer>
              <VerifyContainer>
                <EmailContainer>
                  <EmailInputBox
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setIsExistEmail(isKoriEmail.Init); // 입력값 바뀔 때마다 초기화
                    }}
                    placeholder="Enter email address"
                    placeholderTextColor={'#616262'}
                  />
                  <CloseErrorBox>
                    {!EmailChecks.isEmail && !EmailChecks.isnull && (
                      <Ionicons name="close-sharp" size={27} color="#FF4F4F" />
                    )}
                  </CloseErrorBox>
                </EmailContainer>

                {isExistEmail === isKoriEmail.Exist ? (
                  <ShowVerifiedBox>
                    <Entypo name="check" size={24} color="#949899" />
                  </ShowVerifiedBox>
                ) : (
                  <VerifyButton onPress={VerifyEmail} disabled={!EmailChecks.isEmail} canVerify={EmailChecks.isEmail}>
                    <VerifyText>Verify</VerifyText>
                  </VerifyButton>
                )}
              </VerifyContainer>
              <ErrorBox>
                {!EmailChecks.isEmail && !EmailChecks.isnull && (
                  <>
                    <Ionicons name="information-circle-outline" size={18} color="#FF4F4F" />
                    <ErrorText>Not the correct email format.</ErrorText>
                  </>
                )}

                {EmailChecks.isEmail && isExistEmail === isKoriEmail.NotExist && (
                  <>
                    <Ionicons name="information-circle-outline" size={18} color="#FF4F4F" />
                    <ErrorText>This is not a registered account</ErrorText>
                  </>
                )}
                {EmailChecks.isEmail && isExistEmail === isKoriEmail.Exist && (
                  <>
                    <NotErrorBox>
                      <AntDesign name="check" size={18} color="#02F59B" />
                      <NotErrorText>Email verification code sent</NotErrorText>
                    </NotErrorBox>
                  </>
                )}
              </ErrorBox>
              {/* Code Verification Box */}
              <TitleContainer>
                <TitleText>Code Verification</TitleText>
              </TitleContainer>
              <VerifyContainer>
                <CodeVerifyContainer>
                  <CodeInputBox
                    value={code}
                    onChangeText={(text) => {
                      setCode(text);
                      setIsCorrect(isCorrectCode.Init);
                    }}
                    placeholder="Enter Code"
                    placeholderTextColor={'#616262'}
                  />
                </CodeVerifyContainer>
                {isCorrect === isCorrectCode.Success ? (
                  <ShowVerifiedBox>
                    <Entypo name="check" size={24} color="#949899" />
                  </ShowVerifiedBox>
                ) : (
                  <VerifyButton
                    onPress={verifyCode}
                    disabled={!(isExistEmail === isKoriEmail.Exist)}
                    canVerify={isExistEmail === isKoriEmail.Exist}
                  >
                    <VerifyText>Verify</VerifyText>
                  </VerifyButton>
                )}
              </VerifyContainer>
              {isCorrect === isCorrectCode.Fail && (
                <>
                  <ErrorBox>
                    <Ionicons name="information-circle-outline" size={18} color="#FF4F4F" />
                    <ErrorText>Fail Code Verification</ErrorText>
                  </ErrorBox>
                </>
              )}
              {isCorrect === isCorrectCode.Success && (
                <>
                  <NotErrorBox>
                    <AntDesign name="check" size={18} color="#02F59B" />
                    <NotErrorText>Authentication successful</NotErrorText>
                  </NotErrorBox>
                </>
              )}
            </GeneralLoginContainer>
          </ScrollView>
        </KeyboardAvoidingView>
        <NextButtonContainer disabled={!completeCondition} completeCondition={completeCondition} onPress={goNextScreen}>
          <NextText>Next</NextText>
        </NextButtonContainer>
      </Container>
    </SafeArea>
  );
};

export default CreateAccountScreen;

/* 스타일 */
const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10%;
  align-items: center;
`;

const HeaderBox = styled.View`
  flex-direction: row;
  width: 70%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;

const GeneralLoginContainer = styled.View`
  flex: 1;
`;

const TitleContainer = styled.View`
  justify-content: flex-end;
  height: 50px;
`;

const TitleText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
  margin-bottom: 5px;
`;

const VerifyContainer = styled.View`
  margin-top: 5px;
  height: 50px;
  flex-direction: row;
`;

const EmailContainer = styled.View`
  background-color: #353637;
  width: 75%;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
`;

const EmailInputBox = styled.TextInput`
  width: 80%;
  color: #ffffff;
  height: 50px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const CloseErrorBox = styled.View`
  height: 50px;
  width: 20%;
  align-items: center;
  justify-content: center;
`;

const VerifyButton = styled.TouchableOpacity`
  background-color: #02f59b;
  width: 20%;
  border-radius: 4px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  opacity: ${(props) => (props.canVerify ? 1 : 0.5)};
`;
const ShowVerifiedBox = styled.View`
  width: 20%;
  border-radius: 4px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  border-color: #949899;
  border-width: 2px;
`;

const VerifyText = styled.Text`
  color: #1d1e1f;
  font-size: 13px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const ErrorBox = styled.View`
  height: 20px;
  margin-top: 10px;
  flex-direction: row;
`;

const ErrorText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 11px;
  margin-left: 5px;
`;

const CodeVerifyContainer = styled.View`
  background-color: #353637;
  width: 75%;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
`;
const CodeInputBox = styled.TextInput`
  width: 80%;
  color: #ffffff;
  height: 50px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const NextButtonContainer = styled.TouchableOpacity`
  position: absolute;
  background-color: #02f59b;
  border-radius: 8px;
  width: 100%;
  height: 50px;
  bottom: 50px;
  opacity: ${(props) => (props.completeCondition ? 1 : 0.5)};
  align-items: center;
  justify-content: center;
  align-self: center;
`;

const NextText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;

const NotErrorBox = styled.View`
  height: 20px;
  margin-top: 10px;
  flex-direction: row;
`;

const NotErrorText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 11px;
  margin-left: 5px;
`;
