import CustomButton from '@/components/CustomButton';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useState } from 'react';
import styled from 'styled-components/native';

const OPTIONS = ['System Default', 'Korean (KO)', 'English (EN)', 'Japanese (JA)', 'Chinese (ZH)'];

export default function TranslateScreen() {
    const [selected, setSelected] = useState('System Default');

    return (
        <Safe>
            {/* 헤더 */}
            <Header>
                <BackBtn onPress={() => router.back()}>
                    <AntDesign name="left" size={20} color="#fff" />
                </BackBtn>
                <Title>Chat Translation</Title>
                <Spacer /> {/* 오른쪽 빈공간 정렬용 */}
            </Header>

            {/* 언어 선택 */}
            <Box>
                {OPTIONS.map(opt => (
                    <LangRow key={opt} onPress={() => setSelected(opt)}>
                        <LangText active={selected === opt}>{opt}</LangText>
                        <Radio>{selected === opt ? '●' : '○'}</Radio>
                    </LangRow>
                ))}
            </Box>

            {/* Save 버튼 */}
            <Footer>
                <CustomButton label="Save" tone="mint" filled onPress={() => { /* 저장 예정 */ }} />
            </Footer>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #0f1011;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
`;
const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;
const Title = styled.Text`
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const Spacer = styled.View`
  width: 40px;
`;

const Box = styled.View`
  margin: 4px 16px;
  background: #121314;
  border-radius: 12px;
  overflow: hidden;
`;
const LangRow = styled.Pressable`
  padding: 14px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const LangText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#e9ecef')};
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const Radio = styled.Text`
  color: #cfd4da;
  font-size: 16px;
`;

const Footer = styled.View`
  padding: 16px;
`;
