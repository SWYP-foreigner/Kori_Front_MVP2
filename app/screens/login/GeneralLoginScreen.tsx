import React, { useState } from 'react';
import styled from 'styled-components/native';
import { StatusBar, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { Config } from '@/src/lib/config';
import * as SecureStore from 'expo-secure-store';

type AppLoginResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  message: string;
  timestamp: string;
  isNewUser: boolean;
};

const GeneralLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [lookPassword, setLookPassword] = useState(true);
  const isFull = email && password;

  const goLogin = async () => {
    try {
      const res = await axios.post<AppLoginResponse>(`${Config.SERVER_URL}/api/v1/member/doLogin`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { accessToken, refreshToken, userId, isNewUser } = res.data;
      await SecureStore.setItemAsync('jwt', accessToken);
      await SecureStore.setItemAsync('refresh', refreshToken);
      await SecureStore.setItemAsync('MyuserId', userId.toString());
      if (isNewUser) {
        router.push('/screens/makeprofile/NameStepScreen');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setError(true);
    }
  };

  const createAccount = () => {
    router.push('./CreateAccountScreen');
  };

  const goResetScreen = () => {
    router.push('./ResetPasswordEmail');
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
            <HeaderTitleText>Continue with email</HeaderTitleText>
          </HeaderBox>
        </HeaderContainer>
        <GeneralLoginContainer>
          <TitleContainer>
            <TitleText>Email</TitleText>
          </TitleContainer>
          <InputBox
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={'#616262'}
          />
          <TitleContainer>
            <TitleText>Password</TitleText>
          </TitleContainer>
          <PasswordContainer>
            <PasswordInputBox
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
              placeholderTextColor={'#616262'}
              secureTextEntry={lookPassword}
            />
            <EyeIconBox>
              <TouchableOpacity onPress={() => setLookPassword(!lookPassword)}>
                <Ionicons name={lookPassword ? 'eye-off-outline' : 'eye-outline'} size={25} color="#616262" />
              </TouchableOpacity>
            </EyeIconBox>
          </PasswordContainer>
          <ForgotContainer>
            <TouchableOpacity onPress={goResetScreen}>
              <ForgotText>Forgot Password?</ForgotText>
            </TouchableOpacity>
          </ForgotContainer>
        </GeneralLoginContainer>
        {error && (
          <ErrorContainer>
            <ErrorBox>
              <Ionicons name="information-circle-outline" size={24} color="#FF4F4F" />
              <ErrorText>Your ID or password is incorrect.{'\n'}Please check again.</ErrorText>
            </ErrorBox>
          </ErrorContainer>
        )}
        <LoginButtonContainer isFull={isFull} disabled={!isFull} onPress={goLogin}>
          <LoginText>Login</LoginText>
        </LoginButtonContainer>
        <CNAContainter>
          <TouchableOpacity onPress={createAccount}>
            <CNAText>Create new account</CNAText>
          </TouchableOpacity>
        </CNAContainter>
      </Container>
    </SafeArea>
  );
};

export default GeneralLoginScreen;

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
  width: 72%;
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

const InputBox = styled.TextInput`
  color: #ffffff;
  background-color: #353637;
  height: 50px;
  border-radius: 4px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  margin-top: 5px;
  padding-left: 10px;
`;

const ForgotContainer = styled.View`
  align-items: center;
  justify-content: center;
  height: 80px;
`;
const ForgotText = styled.Text`
  color: #cccfd0;
  font-size: 13px;
  font-family: PlusJakartaSans_500Medium;
  text-decoration-line: underline;
`;

const ErrorContainer = styled.View`
  height: 50px;
  margin-bottom: 50px;
  align-items: center;
  justify-content: center;
`;
const ErrorBox = styled.View`
  flex-direction: row;
  background-color: #414142;
  width: 75%;
  height: 100%;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
`;
const ErrorText = styled.Text`
  margin-left: 7px;
  color: #ffffff;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
`;

const LoginButtonContainer = styled.TouchableOpacity`
  background-color: #02f59b;
  border-radius: 8px;
  height: 50px;
  opacity: ${(props) => (props.isFull ? 1 : 0.5)};
  align-items: center;
  justify-content: center;
`;
const LoginText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;
const CNAContainter = styled(ForgotContainer)`
  margin-bottom: 30px;
  height: 80px;
`;
const CNAText = styled(ForgotText)`
  color: #ffffff;
`;

const PasswordContainer = styled.View`
  background-color: #353637;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  margin-top: 5px;
`;

const PasswordInputBox = styled.TextInput`
  color: #ffffff;
  width: 85%;
  height: 50px;
  border-radius: 4px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const EyeIconBox = styled.View`
  background-color: #353637;
  border-radius: 4px;
  height: 50px;
  width: 15%;
  align-items: center;
  justify-content: center;
`;
