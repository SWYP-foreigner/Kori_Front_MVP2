import React from 'react';
import styled from 'styled-components/native';
import CustomButton from './CustomButton';
import { View, Text } from 'react-native';

const NotificationPermissionModal = () => {
  return (
    <View>
      <ModalArea>
        <CustomButton label={`Let's do it`} />
      </ModalArea>
      <TextButton>
        <Text>'asdf'</Text>
      </TextButton>
    </View>
  );
};

export default NotificationPermissionModal;

const ModalArea = styled.View`
  display: flex;
  flex-direction: column;
  padding: 20;
  background-color: white;
`;

const TextButton = styled.Text``;
