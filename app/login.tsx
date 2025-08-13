import React from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleSignInButton from '../components/AppleSignInButton';
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const TabsMoveButton = styled.TouchableOpacity`
  padding: 12px 24px;
  background-color: gray;
  border-radius: 8px;
  width : 250px;
  align-items:center;
`;

const TabsMoveText = styled.Text`
  color: white;
  font-weight: bold;
  font-size:17;
`;

const Login = () => {
    const router=useRouter();

    const goToTabs = () => {
    router.push('./(tabs)'); // tabs 폴더 index.tsx 로 이동
  };
  return (
    <Container>
      <GoogleSignInButton/>

      <AppleSignInButton/>

      <TabsMoveButton onPress={goToTabs}>
        <TabsMoveText>Tabs 화면으로 이동</TabsMoveText>
      </TabsMoveButton>
    </Container>
  );
};

export default Login;
