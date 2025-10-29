import React from 'react';
import styled from 'styled-components/native';
import { Pressable, PressableProps } from 'react-native';
import { ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = PressableProps & {
  loading?: boolean;
};

function AppleLogo() {
  return <FontAwesome name="apple" size={28} color="#ffffff" />;
}

export default function AppleSignInButton({ onPress, disabled, loading, ...props }: Props) {
  return (
    <AppleLoginButton onPress={onPress} disabled={disabled || loading} {...props}>
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator size="large" color="#02F59B" />
          ) : (
            <>
              <LogoWrapper>
                <AppleLogo />
              </LogoWrapper>
              <ButtonText style={{ opacity: pressed ? 0.7 : 1 }}>Continue with Apple</ButtonText>
            </>
          )}
        </>
      )}
    </AppleLoginButton>
  );
}

const AppleLoginButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border-color: #616262;
  border-width: 1px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
`;

const LogoWrapper = styled.View`
  margin: 7px 15px 7px 0px;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;

const LoadingText = styled.Text`
  color: #ffffff;
  font-size: 16px;
`;
