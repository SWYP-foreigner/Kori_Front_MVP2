import React from 'react';
import styled from 'styled-components/native';
import { Pressable, PressableProps } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

type Props = PressableProps & {
  loading?: boolean;
};



export default function EmailSignButton({ onPress, disabled, loading, ...props }: Props) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {({ pressed }) => (
        <>
          <LogoWrapper>
           <Feather name="mail" size={28} color="#ffffff" style={{ marginRight: 8,  marginTop:8}}  />
          </LogoWrapper>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : (
            <ButtonText style={{ opacity: pressed ? 0.7 : 1 }}>
              Continue with Email
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
  justify-content:center;
  width:100%;
  height: 48px;
  border-radius: 8px;
  border-color:#616262;
  border-width:1px;
  padding-horizontal: 16px;
  margin-bottom: 12px;
`;

const LogoWrapper = styled.View`
  margin : 0px 8px 7px -3px;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-family:PlusJakartaSans_500Medium;
`;

const LoadingText = styled.Text`
  color: #ffffff;
  font-size: 16px;
`;
