import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import UserCard from './user-cards/UserCard';

const MOCK_RECEIVED = [
    { id: 1, name: 'Jenny', country: 'United States', bio: 'Hi there!' },
    { id: 2, name: 'Tom', country: 'France', bio: 'Bonjour!' },
];
const MOCK_SENT = [
    { id: 3, name: 'Mina', country: 'Korea', bio: 'Let’s be friends!' },
];

const TABS = ['received', 'sent'] as const;
type Tab = typeof TABS[number];

export default function FollowsScreen() {
    const { tab } = useLocalSearchParams<{ tab?: Tab }>();
    const [active, setActive] = useState<Tab>((tab as Tab) || 'received');

    const list = useMemo(() => (active === 'received' ? MOCK_RECEIVED : MOCK_SENT), [active]);

    return (
        <Safe>
            <TabsBar>
                {TABS.map(t => (
                    <TabBtn key={t} active={active === t} onPress={() => setActive(t)}>
                        <TabText active={active === t}>{t === 'received' ? 'Received' : 'Sent'}</TabText>
                    </TabBtn>
                ))}
            </TabsBar>

            <List
                data={list}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                renderItem={({ item }) => (
                    <UserCard
                        user={item}
                        variant={active === 'received' ? 'received' : 'sent'}
                        onAccept={() => { }}
                        onReject={() => { }}
                        onChat={() => { }}
                    />
                )}
            />
        </Safe>
    );
}

const Safe = styled.SafeAreaView`flex:1;background:#0f1011;`;
const TabsBar = styled.View`flex-direction:row;padding:10px;gap:8px;`;
const TabBtn = styled.Pressable<{ active: boolean }>`
  flex:1;padding:10px;border-radius:12px;align-items:center;
  background-color: ${({ active }) => active ? '#121314' : '#0b0c0c'};
  border: 1px solid #2a2b2c;
`;
const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => active ? '#30F59B' : '#cfcfcf'};
  font-family:'PlusJakartaSans_600SemiBold';
`;

const List = styled.FlatList`` as unknown as typeof import('react-native').FlatList;
