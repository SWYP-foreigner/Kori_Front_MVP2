import FriendCard from '@/components/FriendCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';

const MOCK_FRIENDS = [
    {
        id: 201,
        name: 'Alice Kori, Kim',
        country: 'United States',
        birth: 2025,
        purpose: 'Business',
        languages: ['EN', 'KO'],
        personalities: ['Exploring Cafés', 'Board Games', 'Doing Nothing', 'K-Food Lover', 'K-Drama Lover'],
        bio: 'Hello~ I came to Korea from the U.S. as an exchange student',
    },
    {
        id: 202,
        name: 'Mina Park',
        country: 'Korea',
        birth: 2025,
        purpose: 'Education',
        languages: ['KO', 'EN'],
        personalities: ['Exploring Cafés', 'Board Games', 'Doing Nothing', 'K-Food Lover', 'K-Drama Lover'],
        bio: 'Nice to meet you!',
    },
];

export default function FriendsOnlyScreen() {
    const [friends, setFriends] = useState(MOCK_FRIENDS);
    const totalPages = 3;
    const [page, setPage] = useState(1);

    const list = useMemo(() => friends, [friends]);

    const confirmUnfollow = (userId: number) => {
        Alert.alert(
            'Are you sure you want to cancel follow?',
            'If you cancel follow, This will be removed from your friends list.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Action',
                    style: 'destructive',
                    onPress: () => {
                        setFriends(prev => prev.filter(f => f.id !== userId));
                    },
                },
            ],
        );
    };

    return (
        <Safe>
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

            <List
                data={list}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10, paddingBottom: 56 }}
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
                        isFollowed={true}
                        onChat={() => { }}
                        onUnfollow={() => confirmUnfollow(item.id)}
                    />
                )}
            />

            <Pager>
                <PagerBtn disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
                    {'‹'}
                </PagerBtn>
                <PagerText>{` ${page} / ${totalPages} `}</PagerText>
                <PagerBtn disabled={page >= totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    {'›'}
                </PagerBtn>
            </Pager>
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

const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const List = styled.FlatList`` as unknown as typeof import('react-native').FlatList;

const Pager = styled.View`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const PagerBtn = styled.Pressable<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  padding: 6px 10px;
`;

const PagerText = styled.Text`
  color: #b7babd;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
