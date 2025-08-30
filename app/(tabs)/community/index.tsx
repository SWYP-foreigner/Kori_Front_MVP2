import CategoryChips, { Category } from '@/components/CategoryChips';
import PostCard, { Post } from '@/components/PostCard';
import SortTabs, { SortKey } from '@/components/SortTabs';
import WriteFab from '@/components/WriteFab';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, type FlatListProps } from 'react-native';
import styled from 'styled-components/native';

const AV = require('@/assets/images/character1.png');
const IMG = require('@/assets/images/img.png');
const ICON = require('@/assets/images/IsolationMode.png');

type PostEx = Post & {
    hotScore: number;
    minutesAgo?: number;
    bookmarked?: boolean;
};

const MOCK: PostEx[] = [
    {
        id: 'p1',
        author: 'Shotaro',
        avatar: AV,
        category: 'Free talk',
        minutesAgo: 23,
        createdAt: '2025-08-14',
        body:
            "Hi! I came to Korea on a working holiday and I'm currently learning Korean at Yonsei Univ.",
        images: [IMG],
        likes: 999,
        comments: 999,
        hotScore: 1200,
    },
    {
        id: 'p2',
        author: 'Shotaro',
        avatar: AV,
        category: 'Event',
        createdAt: '2025-08-14',
        body: 'Second post without image.',
        likes: 999,
        comments: 999,
        hotScore: 1001,
    },
];

export default function CommunityScreen() {
    const [cat, setCat] = useState<Category>('All');
    const [sort, setSort] = useState<SortKey>('new');
    const [items, setItems] = useState<PostEx[]>(MOCK);

    const filtered = useMemo(() => {
        let arr = items.filter((p) => cat === 'All' || p.category === cat);
        if (sort === 'new') {
            arr = arr
                .slice()
                .sort(
                    (a, b) =>
                        (b.minutesAgo ?? 1e9) - (a.minutesAgo ?? 1e9) ||
                        b.createdAt.localeCompare(a.createdAt),
                );
        } else {
            arr = arr.slice().sort((a, b) => b.hotScore - a.hotScore);
        }
        return arr;
    }, [items, cat, sort]);

    const toggleLike = (id: string) => {
        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
        );
    };

    const toggleBookmark = (id: string) => {
        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)),
        );
    };

    const renderPost: ListRenderItem<PostEx> = ({ item }) => (
        <PostCard
            data={item}
            onPress={() =>
                router.push({ pathname: '/community/[id]', params: { id: String(item.id) } })
            }
            onToggleLike={() => toggleLike(String(item.id))}
            onToggleBookmark={() => toggleBookmark(String(item.id))}
        />
    );

    return (
        <Safe>
            <Header>
                <Left>
                    <Title>Community</Title>
                    <IconImage source={ICON} />
                </Left>

                <Right>
                    <IconBtn onPress={() => router.push('/community/search')}>
                        <AntDesign name="search1" size={18} color="#cfd4da" />
                    </IconBtn>

                    <IconBtn onPress={() => router.push('/community/bookmarks')}>
                        <MaterialIcons name="bookmark-border" size={20} color="#cfd4da" />
                    </IconBtn>

                    <IconBtn onPress={() => router.push('/community/my-history')}>
                        <AntDesign name="user" size={18} color="#cfd4da" />
                    </IconBtn>
                </Right>
            </Header>

            <ChipsWrap>
                <CategoryChips value={cat} onChange={setCat} />
            </ChipsWrap>

            <SortWrap>
                <SortTabs value={sort} onChange={setSort} />
            </SortWrap>

            <List
                data={filtered}
                keyExtractor={(it: PostEx) => String(it.id)}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <WriteFab onPress={() => router.push('/community/write')} />
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;

const Header = styled.View`
  padding: 0 12px;
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 32px;
  font-family: 'InstrumentSerif_400Regular';
  letter-spacing: -0.2px;
`;

const IconImage = styled.Image`
  margin-left: 4px;
  width: 20px;
  height: 20px;
  resize-mode: contain;
`;

const Right = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconBtn = styled.Pressable`
  padding: 6px;
  margin-left: 8px;
`;

const ChipsWrap = styled.View`
  margin-top: 12px;
`;

const SortWrap = styled.View`
  margin-top: 20px;
  margin-bottom: 14px;
`;

const List = styled(
    FlatList as React.ComponentType<FlatListProps<PostEx>>
)``;
