import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { FlatList, Modal } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  value?: string;
  onClose: () => void;
  onSelect: (purpose: string) => void;
};
const INPUT_BORDER = '#FFFFFF';
const ERROR_COLOR = '#FF6B6B';
const GENDER_OPTIONS = ['Female', 'Male', 'Prefer not to say'];

export default function GenderPicker({ visible, value, onClose, onSelect }: Props) {
  const renderItem = ({ item }: { item: string }) => {
    const selected = value === item;
    return (
      <Row onPress={() => onSelect(item)}>
        <RowText>{item}</RowText>
        {selected && <AntDesign name="check" size={20} color="#02F59B" />}
      </Row>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Overlay activeOpacity={1} onPress={onClose}>
        <Sheet onStartShouldSetResponder={() => true}>
          <HandleWrap>
            <Handle />
          </HandleWrap>
          <List
            data={GENDER_OPTIONS}
            keyExtractor={(it, idx) => `${it}-${idx}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </Sheet>
      </Overlay>
    </Modal>
  );
}



export const GenderDropdownButton = styled.TouchableOpacity<{ selected?: boolean; error?: boolean }>`
width: 100%;
height: 50px;
border-radius: 8px;
background-color: #353637;
flex-direction: row;
align-items: center;
justify-content: space-between;
padding: 0 16px;
border-width: 1px;
border-color: ${({ error }: { error?: boolean }) => (error ? ERROR_COLOR : INPUT_BORDER)}; 
`;

export const GenderDropdownText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const Overlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const Sheet = styled.View`
  background-color: #353637;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 70%;
  padding-bottom: 20px;
`;

const HandleWrap = styled.View`
  align-items: center;
  padding: 20px 20px 10px 20px;
`;
const Handle = styled.View`
  width: 40px;
  height: 4px;
  background-color: #949899;
  border-radius: 2px;
`;

const List = styled(FlatList as new () => FlatList<string>)``;

const Row = styled.TouchableOpacity<{ selected?: boolean }>`
  padding: 16px 0;
  border-bottom-width: 0.5px;
  border-bottom-color: #4a4b4c;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RowText = styled.Text`
  color: #ededed;
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;
