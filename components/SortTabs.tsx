import React from 'react';
import styled from 'styled-components/native';

export type SortKey = 'new' | 'hot';

type Props = {
    value: SortKey;
    onChange: (v: SortKey) => void;
};

export default function SortTabs({ value, onChange }: Props) {
    return (
        <Bar>
            <SortBy>Sort by</SortBy>
            <Tab $active={value === 'new'} onPress={() => onChange('new')}>
                <TabText $active={value === 'new'}>New</TabText>
            </Tab>
            <Tab $active={value === 'hot'} onPress={() => onChange('hot')}>
                <TabText $active={value === 'hot'}>Hot</TabText>
            </Tab>
        </Bar>
    )
}

const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
`;
const SortBy = styled.Text`
  color:#848687;
  font-size:13px;
  font-family:'PlusJakartaSans_Regular';
`;
const Tab = styled.Pressable<{ $active?: boolean }>`
`;
const TabText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => $active ? '#E9E9E9' : '#848687'};
  font-size: 13px;
  font-family:'PlusJakartaSans_Regular';
`;
