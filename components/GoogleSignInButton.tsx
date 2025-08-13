import React from 'react';
import styled from 'styled-components/native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

function GoogleIcon() {
  // 구글 공식 G 로고 벡터
  return (
    <Svg width={28} height={28} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.2 36 24 36 
           16.8 36 11 30.2 11 23s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6
           C34.8 4.4 29.7 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22
           c11 0 21-8 21-22 0-1.2-.1-2.3-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12 24 12
           c3.3 0 6.3 1.2 8.6 3.2l6-6C34.8 4.4 29.7 2 24 2
           15 2 7.4 7.2 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 46c5 0 9.7-1.9 13.2-5l-6.1-5.1
           C29 37.1 26.7 38 24 38c-5.1 0-9.5-3.5-11-8.2l-6.6 5.1
           C7.4 40.8 15 46 24 46z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3
           c-1.3 3.7-4.8 6-8.3 6
           -5.1 0-9.5-3.5-11-8.2l-6.6 5.1
           C10.4 37.8 16.7 42 24 42
           c11 0 21-8 21-22
           0-1.2-.1-2.3-.4-3.5z"
      />
    </Svg>
  );
}

export default function GoogleSignInButton({ onPress, loading, disabled }: Props) {
  return (
    <GoogleLoginButton
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.6 }
      ]}
    >
      <IconWrapper>
        <GoogleIcon />
      </IconWrapper>
      {loading ? (
        <StyledActivityIndicator size="small" color="#000" />
      ) : (
        <ButtonText>Sign in with Google</ButtonText>
      )}
    </GoogleLoginButton>
  );
}

// styled-components 정의
const GoogleLoginButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  width : 250px;
  height: 50px;
  background-color: #ffffff;
  border-radius: 8px;
  border-width: 1px;
  border-color: #dadce0;
  padding-horizontal: 12px;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  shadow-offset: 0px 1px;
  margin-bottom: 12px;
`;

const IconWrapper = styled.View`
  margin-right: 30px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: #3c4043;
  font-weight: 500;
`;

const StyledActivityIndicator = styled.ActivityIndicator``;
