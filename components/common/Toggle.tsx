import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/native';

interface ToggleProps {
  isPressed: boolean;
  onPress: (value: boolean) => void;
}

const Toggle = ({ isPressed, onPress }: ToggleProps) => {
  const offsetX = useRef(new Animated.Value(isPressed ? 20 : 0)).current;

  useEffect(() => {
    Animated.timing(offsetX, {
      toValue: isPressed ? 20 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isPressed]);

  return (
    <TouchableWithoutFeedback onPress={() => onPress(!isPressed)}>
      <Background isPressed={isPressed}>
        <AnimatedSwitch style={{ transform: [{ translateX: offsetX }] }} />
      </Background>
    </TouchableWithoutFeedback>
  );
};

const Background = styled.View<{ isPressed: boolean }>`
  justify-content: center;
  border-radius: 40px;
  width: 44px;
  height: 24px;
  padding: 2px;
  background-color: ${({ theme, isPressed }) => (isPressed ? theme.colors.primary.mint : theme.colors.gray.darkGray_2)};
`;

const AnimatedSwitch = styled(Animated.View)`
  width: 20px;
  height: 20px;
  border-radius: 40px;
  background-color: ${({ theme }) => theme.colors.primary.white};
`;

export default Toggle;
