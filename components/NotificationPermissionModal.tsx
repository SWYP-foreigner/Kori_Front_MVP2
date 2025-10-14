import React from 'react';
import styled from 'styled-components/native';
import CustomButton from './CustomButton';
import { Text, Modal } from 'react-native';
import Icon from './Icon';

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onYesPress: () => void;
  onLaterPress: () => void;
}

const NotificationPermissionModal = ({ visible, onClose, onYesPress }: NotificationPermissionModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <ModalBackground>
        <ModalArea>
          {/* <Icon type="alarmOn" size="20px" /> */}
          <ModalTitle>
            <Text>Turn on notifications?</Text>
          </ModalTitle>
          <ModalContent>
            <Text>{`Enable notifications\nso you won’t miss new messages,\nfollower requests, or community posts.`}</Text>
          </ModalContent>
          <CustomButton label={`Let's do it`} onPress={onYesPress} />
        </ModalArea>
        <TextButton onPress={onClose}>
          <Text>Maybe later</Text>
        </TextButton>
      </ModalBackground>
    </Modal>
  );
};

export default NotificationPermissionModal;

const ModalBackground = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
`;

const ModalArea = styled.View`
  display: flex;
  flex-direction: column;
  width: 344px;
  height: 220px;
  border-radius: 12px;
  display: flex;
  padding: 20px;
  background-color: white;
`;

const ModalTitle = styled.Text`
  font-family: PlusJakartaSans_700Bold;
  font-size: 20px;
  text-align: center;
  color: #171818;
  padding-top: 8px;
  padding-bottom: 20px;
`;

const ModalContent = styled.Text`
  font-family: PlusJakartaSans_400Regular;
  font-size: 14px;
  text-align: center;
  color: #616262;
  padding-bottom: 24px;
`;

const TextButton = styled.Text`
  font-family: PlusJakartaSans_500Medium;
  font-size: 15px;
  color: #cccfd0;
  padding-top: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #cccfd0;
  padding-bottom: 1px;
`;
