import api from '@/api/axiosInstance';
import CategoryChips, { Category } from '@/components/CategoryChips';
import PostCard, { Post } from '@/components/PostCard';
import SortTabs, { SortKey } from '@/components/SortTabs';
import WriteFab from '@/components/WriteFab';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, type FlatListProps } from 'react-native';
import styled from 'styled-components/native';

const ICON = require('@/assets/images/IsolationMode.png');
const AV = require('@/assets/images/character1.png');

type PostsListItem = {
    postId: number;
    title?: string;
    contentPreview?: string;
    content?: string;
    authorName?: string;
    createdAt?: string | number;
    createdTime?: string | number;
    likeCount?: number;
    commentCount?: number;
    viewCount?: number;
    score?: number;
};

type PostsListResp = {
    success: boolean;
    data: {
        items: PostsListItem[];
        hasNext: boolean;
        nextCursor?: string;
    };
    timestamp?: string;
};

function pad2(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

function parseDateFlexible(v?: unknown): Date | null {
    if (v == null) return null;
    let s = String(v).trim();

    if (/^\d+(\.\d+)?$/.test(s)) {
        const num = parseFloat(s);
        return new Date(num * 1000);
    }

    if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function toDateLabel(raw?: unknown, fallbackIso?: string): string {
    let d = parseDateFlexible(raw);
    if ((!d || isNaN(d.getTime())) && fallbackIso) {
        d = parseDateFlexible(fallbackIso);
    }
    if (!d) return '';
    try {
        const fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return fmt.format(d).replace(/-/g, '/');
    } catch {
        return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
    }
}


type PostEx = Post & { hotScore?: number; minutesAgo?: number; bookmarked?: boolean };

const mapItem = (row: PostsListItem, respTimestamp?: string): PostEx => {
    const createdRaw = row.createdAt ?? row.createdTime; // 작성 시각 우선
    return {
        id: String(row.postId),
        author: row.authorName || 'Unknown',
        avatar: AV,
        category: 'Free talk',
        createdAt: toDateLabel(createdRaw, respTimestamp),
        body: row.contentPreview ?? row.content ?? '',
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        images: undefined,
        hotScore: row.score,
    };
};

export default function CommunityScreen() {
    const [cat, setCat] = useState<Category>('All');
    const [sort, setSort] = useState<SortKey>('new');

    const [items, setItems] = useState<PostEx[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const sortParam = sort === 'new' ? 'LATEST' : 'POPULAR';
    const boardId = CATEGORY_TO_BOARD_ID[cat];

    useEffect(() => {
        refresh();
    }, [boardId, sortParam]);

    const fetchPage = async (after?: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await api.get<PostsListResp>(`/api/v1/boards/${boardId}/posts`, {
                params: {
                    sort: sortParam,
                    size: 20,
                    ...(after ? { cursor: after } : null),
                },
            });

            const respTimestamp = data?.timestamp;
            const list = (data?.data?.items ?? []).map(item => mapItem(item, respTimestamp));

            setItems(prev => (after ? [...prev, ...list] : list));
            setHasNext(Boolean(data?.data?.hasNext));
            setCursor(data?.data?.nextCursor);
        } catch (e) {
            console.log('[community:list] error', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refresh = () => {
        setRefreshing(true);
        setCursor(undefined);
        setHasNext(true);
        fetchPage(undefined);
    };

    const loadMore = () => {
        if (!hasNext || !cursor || loading) return;
        fetchPage(cursor);
    };

    const visible = useMemo(() => items, [items]);

    const toggleLike = (id: string) =>
        setItems(prev => prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));

    const toggleBookmark = (id: string) =>
        setItems(prev => prev.map(p => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));

    const renderPost: ListRenderItem<PostEx> = ({ item }) => (
        <PostCard
            data={{ ...item, category: cat }}
            onPress={() => router.push({ pathname: '/community/[id]', params: { id: String(item.id) } })}
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
                data={visible}
                keyExtractor={(it: PostEx) => String(it.id)}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.4}
                onEndReached={loadMore}
                refreshing={refreshing}
                onRefresh={refresh}
                ListFooterComponent={
                    loading ? (
                        <FooterLoading>
                            <ActivityIndicator />
                        </FooterLoading>
                    ) : null
                }
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

const List = styled(FlatList as React.ComponentType<FlatListProps<PostEx>>)``;

const FooterLoading = styled.View`
  padding: 16px 0;
`;
