import FriendCard from '@/components/FriendCard';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';

/** 서버에서 친구 목록 가져오기(임시) */
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

    return (
        <Safe>
            {/* 헤더 */}
            <Header>
                <Back onPress={() => router.back()}>{'‹'}</Back>
                <HeaderTitle>Friends List</HeaderTitle>
                <IconRow>
                    <Icon>⌕</Icon>
                    <Icon style={{ marginLeft: 14 }}>⋯</Icon>
                </IconRow>
            </Header>

            {/* 이미 친구들만 카드로 표시 (FriendCard 기본 버튼: Following / Chat) */}
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
                    />
                )}
            />

            {/* 하단 페이지 인디케이터 (시안: < 1 / 3 >) */}
            <Pager>
                <PagerBtn disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>{'‹'}</PagerBtn>
                <PagerText>{` ${page} / ${totalPages} `}</PagerText>
                <PagerBtn disabled={page >= totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>{'›'}</PagerBtn>
            </Pager>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
    flex:1;
    background:#0f1011;
`;
const Header = styled.View`
    height: 48px;
    padding: 0 12px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;
const Back = styled.Pressable`
    width:40px;
    align-items:flex-start;
`;
const HeaderTitle = styled.Text`
    color:#fff;
    font-size:16px;
    font-family:'PlusJakartaSans_700Bold';
`;
const IconRow = styled.View`
    flex-direction:row;
    align-items:center;
`;
const Icon = styled.Text`
    color:#cfd4da;
    font-size:16px;
`;

const List = styled.FlatList`
` as unknown as typeof import('react-native').FlatList;

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
    color:#b7babd;
    font-size:12px;
    font-family:'PlusJakartaSans_400Regular';
`;
