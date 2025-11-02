import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import styled from 'styled-components/native';

export default function WriteFab({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Fab onPress={onPress} disabled={disabled} opacity={disabled ? 0.6 : 1}>
      <AntDesign name="edit" size={22} color="#0f1011" />
    </Fab>
  );
}

const Fab = styled.Pressable`
  position: absolute;
  right: 16px;
  bottom: 26px;
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 10px;
  shadow-offset: 0px 6px;
  elevation: 6;
`;
