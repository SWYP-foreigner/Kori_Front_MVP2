import FriendCard from '@/components/FriendCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Dimensions } from 'react-native';
import styled from 'styled-components/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    const list = useMemo(() => friends, [friends]);

    const totalPages = list.length;
    const [page, setPage] = useState(1); // 1-based
    const listRef = useRef<import('react-native').FlatList>(null);

    const confirmUnfollow = (userId: number) => {
        Alert.alert(
            'Are you sure you want to cancel follow?',
            'If you cancel follow, This will be removed from your friends list.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Action',
                    style: 'destructive',
                    onPress: () => setFriends(prev => prev.filter(f => f.id !== userId)),
                },
            ],
        );
    };

    const goToIndex = (indexZeroBased: number) => {
        if (!listRef.current) return;
        const safeIndex = Math.max(0, Math.min(totalPages - 1, indexZeroBased));
        listRef.current.scrollToIndex({ index: safeIndex, animated: true });
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
                </IconRow>
            </Header>

            <HList
                ref={listRef}
                data={list}
                keyExtractor={(item) => String(item.id)}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH}
                snapToAlignment="start"
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const idx = Math.round(x / SCREEN_WIDTH);
                    setPage(idx + 1);
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <Page style={{ width: SCREEN_WIDTH }}>
                        <Inner>
                            <FriendCard
                                userId={item.id}
                                name={item.name}
                                country={item.country}
                                birth={item.birth}
                                purpose={item.purpose}
                                languages={item.languages}
                                personalities={item.personalities}
                                bio={item.bio}
                                isFollowed
                                onChat={() => { }}
                                onUnfollow={() => confirmUnfollow(item.id)}
                                collapsible={false}
                            />
                        </Inner>
                    </Page>
                )}
            />

            <Pager>
                <PagerBtn disabled={page <= 1} onPress={() => goToIndex(page - 2)}>
                    <PagerArrow>‹</PagerArrow>
                </PagerBtn>

                <PagerText>{` ${page} / ${totalPages} `}</PagerText>

                <PagerBtn disabled={page >= totalPages} onPress={() => goToIndex(page)}>
                    <PagerArrow>›</PagerArrow>
                </PagerBtn>
            </Pager>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
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

const HList = styled.FlatList`` as unknown as typeof import('react-native').FlatList;

const Page = styled.View`
  justify-content: center;
`;

const Inner = styled.View`
  padding: 0 16px;
  margin-top: -27px;
`;

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

const PagerArrow = styled.Text`
  color: #b7babd;
  font-size: 20px;
  padding: 0 4px;
`;

const PagerText = styled.Text`
  color: #b7babd;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
