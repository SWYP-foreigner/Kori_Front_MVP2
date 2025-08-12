import React from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const GoogleLoginButton = styled.TouchableOpacity`
  margin-bottom: 16px;
  padding: 12px 24px;
  background-color: #4285F4;
  border-radius: 8px;
`;

const GoogleLoginText = styled.Text`
  color: white;
  font-weight: bold;
`;

const AppleLoginButton = styled.TouchableOpacity`
  margin-bottom: 16px;
  padding: 12px 24px;
  background-color: black;
  border-radius: 8px;
`;

const AppleLoginText = styled.Text`
  color: white;
  font-weight: bold;
`;

const TabsMoveButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: gray;
  border-radius: 8px;
`;

const TabsMoveText = styled.Text`
  color: white;
  font-weight: bold;
`;

const Login = () => {
    const router=useRouter();

    const goToTabs = () => {
    router.push('./tabs'); // tabs 폴더 index.tsx 로 이동
  };
  return (
    <Container>
      <GoogleLoginButton>
        <GoogleLoginText>Google 로그인</GoogleLoginText>
      </GoogleLoginButton>

      <AppleLoginButton>
        <AppleLoginText>Apple 로그인</AppleLoginText>
      </AppleLoginButton>

      <TabsMoveButton onPress={goToTabs}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>
    </Container>
  );
};

export default Login;
