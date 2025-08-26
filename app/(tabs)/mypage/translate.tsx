import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import styled from 'styled-components/native';

type Lang = {
  label: string;
  code: string;
};

const OPTIONS: Lang[] = [
  { label: 'English', code: 'EN' },
  { label: 'Spanish', code: 'ES' },
  { label: 'French', code: 'FR' },
  { label: 'Vietnamese', code: 'VI' },
  { label: 'Italian', code: 'IT' },
  { label: 'Chinese', code: 'ZH' },
  { label: 'Japanese', code: 'JP' },
];

export default function TranslateScreen() {
  const [selected, setSelected] = useState<string>('EN');

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()} hitSlop={HIT}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>

        <HeaderCenter>
          <Title>Chat Translation Language</Title>
        </HeaderCenter>

        <RightSlot />
      </Header>

      <Body>
        {OPTIONS.map(({ label, code }) => {
          const active = selected === code;
          return (
            <Row
              key={code}
              onPress={() => setSelected(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              hitSlop={HIT}
              active={active}
            >
              <RowText active={active}>
                {label} ({code})
              </RowText>

              {active && (
                <CheckWrap>
                  <MaterialIcons name="check" size={18} color="#30F59B" />
                </CheckWrap>
              )}
            </Row>
          );
        })}
      </Body>
    </Safe>
  );
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1D1E1F;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
`;

const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;

const HeaderCenter = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const RightSlot = styled.View`
  width: 40px; /* 우측 균형용 빈 슬롯 */
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const Body = styled.ScrollView`
  padding: 12px 16px;
`;

const Row = styled.Pressable<{ active: boolean }>`
  height: 48px;
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 10px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background: ${({ active }) => (active ? '#2A2B2C' : 'transparent')};
`;

const RowText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#EDEFF1' : '#E1E3E6')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const CheckWrap = styled.View`
  margin-left: 10px;
`;
