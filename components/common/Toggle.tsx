import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/native';

interface ToggleProps {
  isPressed: boolean;
  onPress: (_value: boolean) => void;
  disabled?: boolean;
}

const Toggle = ({ isPressed, onPress, disabled = false }: ToggleProps) => {
  const offsetX = useRef(new Animated.Value(isPressed ? 20 : 0)).current;

  // TODO 애니메이션 적용 안되는 문제 해결 필요
  useEffect(() => {
    Animated.timing(offsetX, {
      toValue: isPressed ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isPressed]);

  return (
    <TouchableWithoutFeedback onPress={() => onPress(!isPressed)}>
      <Background isPressed={isPressed} disabled={disabled}>
        <AnimatedSwitch disabled={disabled} style={{ transform: [{ translateX: offsetX }] }} />
      </Background>
    </TouchableWithoutFeedback>
  );
};

const Background = styled.View<{ isPressed: boolean; disabled: boolean }>`
  justify-content: center;
  border-radius: 40px;
  width: 44px;
  height: 24px;
  padding: 2px;

  background-color: ${({ theme, isPressed, disabled }) =>
    disabled ? theme.colors.gray.darkGray_1 : isPressed ? theme.colors.primary.mint : theme.colors.gray.darkGray_2};
`;

const AnimatedSwitch = styled(Animated.View)<{ disabled: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 40px;
  background-color: ${({ theme, disabled }) => (disabled ? theme.colors.gray.darkGray_2 : theme.colors.primary.white)};
`;

export default Toggle;
