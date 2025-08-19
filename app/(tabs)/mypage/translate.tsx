import CustomButton from '@/components/CustomButton';
import React, { useState } from 'react';
import styled from 'styled-components/native';

const OPTIONS = ['System Default', 'Korean (KO)', 'English (EN)', 'Japanese (JA)', 'Chinese (ZH)'];

export default function TranslateScreen() {
    const [selected, setSelected] = useState('System Default');

    return (
        <Safe>
            <Title>Chat Translation Language</Title>
            <Box>
                {OPTIONS.map(opt => (
                    <LangRow key={opt} onPress={() => setSelected(opt)}>
                        <LangText active={selected === opt}>{opt}</LangText>
                        <Radio>{selected === opt ? '●' : '○'}</Radio>
                    </LangRow>
                ))}
            </Box>

            <Footer>
                <CustomButton label="Save" tone="mint" filled onPress={() => { /* 저장 예정 */ }} />
            </Footer>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
    flex:1;
    background:#0f1011;
`;
const Title = styled.Text`
  padding: 12px 16px;
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const Box = styled.View`
    margin: 4px 16px;
    background:#121314;
    border-radius:12px;
    overflow:hidden;
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
  color: ${({ active }) => active ? '#30F59B' : '#e9ecef'};
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const Radio = styled.Text`
    color:#cfd4da;
    font-size:16px;
`;
const Footer = styled.View`
    padding: 16px;
`;
