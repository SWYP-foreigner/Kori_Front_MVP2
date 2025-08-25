import FriendCard from '@/components/FriendCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';

type Tab = 'received' | 'sent';

type FriendItem = {
  id: number;
  name: string;
  country: string;
  birth?: number;
  purpose: string;
  languages: string[];
  personalities: string[];
  bio?: string;
};

const MOCK_RECEIVED: FriendItem[] = [
  {
    id: 101,
    name: 'Jenny',
    country: 'United States',
    birth: 2025,
    purpose: 'Business',
    languages: ['EN', 'KO'],
    personalities: ['Exploring Cafés', 'Board Games', 'Doing Nothing', 'K-Food Lover', 'K-Drama Lover'],
    bio: 'Hi there!',
  },
];

const MOCK_SENT: FriendItem[] = [
  {
    id: 201,
    name: 'Tom',
    country: 'France',
    birth: 2025,
    purpose: 'Travel',
    languages: ['EN'],
    personalities: ['Board Games', 'K-Food Lover'],
    bio: 'Bonjour!',
  },
];

export default function FollowListScreen() {
  const [tab, setTab] = useState<Tab>('received');

  const list = useMemo(
    () => (tab === 'received' ? MOCK_RECEIVED : MOCK_SENT),
    [tab],
  );

  const handleAccept = (userId: number) => {
    console.log('accept', userId);
  };

  const handleCancelRequest = (userId: number) => {
    console.log('cancel request', userId);
  };

  return (
    <Safe>
      {/* Header */}
      <Header>
        <BackBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>
        <Title>Friends List</Title>
        <IconRow>
          <AntDesign name="search1" size={18} color="#cfd4da" />
          <AntDesign name="ellipsis1" size={18} color="#cfd4da" style={{ marginLeft: 14 }} />
        </IconRow>
      </Header>

      {/* Tabs */}
      <TabsWrap>
        <TabsRow>
          <TabItem active={tab === 'received'} onPress={() => setTab('received')}>
            <TabText active={tab === 'received'}>Received</TabText>
          </TabItem>
          <TabItem active={tab === 'sent'} onPress={() => setTab('sent')}>
            <TabText active={tab === 'sent'}>Sent</TabText>
          </TabItem>
        </TabsRow>
        <TabsBottomLine />
      </TabsWrap>

      {/* List */}
      <List
        data={list}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 56, paddingHorizontal: 16, gap: 16 }}
        renderItem={({ item }) => (
          <FriendCard
            userId={item.id}
            name={item.name}
            country={item.country}
            birth={item.birth}
            purpose={item.purpose}
            languages={item.languages}
            personalities={item.personalities}
            bio={item.bio}
            collapsible={false}
            mode={tab === 'received' ? 'received' : 'sent'}
            onAccept={handleAccept}
            onCancel={handleCancelRequest}
            onChat={() => { }}
            isFollowed={false}
          />
        )}
      />
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1D1E1F;
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
  font-size: 20px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TabsWrap = styled.View`
  position: relative;
  padding: 0 16px;
  margin-top: 4px;
`;
const TabsRow = styled.View`
  flex-direction: row;
`;
const TabItem = styled.Pressable<{ active: boolean }>`
  flex: 1;
  align-items: center;
  padding: 12px 6px;
  border-bottom-width: 2px;
  border-bottom-color: ${({ active }) => (active ? '#30F59B' : 'transparent')};
`;
const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#cfcfcf')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const TabsBottomLine = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: #212325;
`;

const List = styled.FlatList`` as unknown as typeof import('react-native').FlatList;
