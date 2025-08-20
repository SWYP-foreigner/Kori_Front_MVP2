import React from 'react';
import styled from 'styled-components/native';
import Svg, { Path } from 'react-native-svg';
import { Pressable, PressableProps } from 'react-native';

type Props = PressableProps & {
  loading?: boolean;
};

function AppleLogo() {
  return (
    <Svg width={30} height={33} viewBox="0 0 24 28" fill="none">
      <Path
        fill="#FFFFFF"
        d="M19.665 20.565c-.596 1.35-1.27 2.65-2.095 3.8-1.027 1.42-2.136 2.85-3.562 2.85-1.37 0-1.772-.88-3.3-.88-1.53 0-2.01.86-3.3.9-1.38.04-2.67-1.34-3.7-2.77-2-2.83-3.51-7.95-1.44-11.37 1.023-1.74 2.83-2.85 4.81-2.85 1.34 0 2.6.9 3.3.9.68 0 2.61-1.09 4.44-1.06.75.02 2.88.3 4.25 2.42-3.27 1.87-2.69 6.22-.77 8.27zm-1.25-12.32c.65-.79 1.1-1.9.98-3.02-1.13.04-2.5.76-3.31 1.55-.73.7-1.36 1.85-1.19 2.94 1.26.1 2.57-.64 3.52-.97z"
      />
    </Svg>
  );
}

export default function AppleSignInButton({ onPress, disabled, loading, ...props }: Props) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {({ pressed }) => (
        <>
          <LogoWrapper>
            <AppleLogo />
          </LogoWrapper>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : (
            <ButtonText style={{ opacity: pressed ? 0.7 : 1 }}>
              Sign in with Apple
            </ButtonText>
          )}
        </>
      )}
    </Button>
  );
}

const Button = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  
  background-color: #000000;
  width:250px;
  height: 48px;
  border-radius: 8px;
  border-color:#ffffff;
  border-width:1px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
`;

const LogoWrapper = styled.View`
  margin : 0px 28px 7px -3px;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
`;

const LoadingText = styled.Text`
  color: #ffffff;
  font-size: 16px;
`;
