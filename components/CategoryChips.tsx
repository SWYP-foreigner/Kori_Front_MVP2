import React from 'react';
import styled from 'styled-components/native';

export type Category =
    | 'All' | 'News' | 'Tip' | 'Q&A' | 'Event' | 'Free talk' | 'Activity';

const CATS: Category[] = ['All', 'News', 'Tip', 'Q&A', 'Event', 'Free talk', 'Activity'];

type Props = { value: Category; onChange: (c: Category) => void };

export default function CategoryChips({ value, onChange }: Props) {
    return (
        <Row horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {CATS.map(c => {
                const active = c === value;
                return (
                    <Chip key={c} $active={active} onPress={() => onChange(c)}>
                        <ChipText $active={active}>{c}</ChipText>
                    </Chip>
                );
            })}
        </Row>
    );
}

const Row = styled.ScrollView`
  padding: 8px 12px 0 12px; /* ⬅︎ 마지막 0으로 (아래 여백 제거) */
  gap: 8px;
` as unknown as typeof import('react-native').ScrollView;

const Chip = styled.Pressable<{ $active?: boolean }>`
  padding: 6px 12px;   
  height: 32px;       
  border-radius: 10px;
  background: ${({ $active }) => ($active ? '#02F59B' : '#353637')};
  margin-right: 8px;
  align-items: center;      
  justify-content: center;
`;

const ChipText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#0f1011' : '#cfd4da')};
  font-size: 14px;
  line-height: 18px;
  font-family: 'PlusJakartaSans_600Light';
`;
