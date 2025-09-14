import api from '@/api/axiosInstance';
import { addBookmark, removeBookmark } from '@/api/community/bookmarks';
import CategoryChips, { Category } from '@/components/CategoryChips';
import PostCard, { Post } from '@/components/PostCard';
import SortTabs from '@/components/SortTabs';
import WriteFab from '@/components/WriteFab';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';
import { usePostUI } from '@/src/store/usePostUI';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem, type FlatListProps
} from 'react-native';
import styled from 'styled-components/native';


const isMeaningfulName = (v?: any) => {
    const s = String(v ?? '').trim();
    if (!s) return false;
    const lower = s.toLowerCase();
    return !['unknown', 'null', 'undefined', '-', '—'].includes(lower);
};

const pickNonEmpty = (...vals: any[]) => {
    for (const v of vals) {
        const s = String(v ?? '').trim();
        if (s) return s;
    }
    return '';
};

const ICON = require('@/assets/images/IsolationMode.png');
const AV = require('@/assets/images/character1.png');

const MAX_IMAGES = 5;

type PostsListItem = {
    postId: number;
    title?: string;
    contentPreview?: string;
    content?: string;

    authorName?: string;
    userName?: string | null;
    nickname?: string;
    memberName?: string;
    writerName?: string;

    createdAt?: string | number;
    createdTime?: string | number;
    likeCount?: number;
    commentCount?: number;
    viewCount?: number;
    score?: number;
    likedByMe?: boolean;
    isLike?: boolean;
    isLiked?: boolean;

    contentImageUrls?: string[];
    imageUrls?: string[];
    contentImageUrl?: string | null;
    imageUrl?: string | null;

    userImageUrl?: string;
    boardCategory: Category | string;
    isAnonymous?: boolean;
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

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function parseDateFlexible(v?: unknown): Date | null {
    if (v == null) return null;
    let s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return new Date(parseFloat(s) * 1000);
    if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}
function toDateLabel(raw?: unknown, fallbackIso?: string): string {
    let d = parseDateFlexible(raw);
    if ((!d || isNaN(d.getTime())) && fallbackIso) d = parseDateFlexible(fallbackIso);
    if (!d) return '';
    try {
        const fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
        });
        return fmt.format(d).replace(/-/g, '/');
    } catch {
        return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
    }
}

type PostEx = Post & {
    postId: number;
    authorName?: string;
    hotScore?: number;
    minutesAgo?: number;
    bookmarked?: boolean;
    likedByMe?: boolean;
    userImageUrl?: string;
    isAnonymous?: boolean;
};

const mapItem = (row: PostsListItem, respTimestamp?: string): PostEx => {
    const isAnon =
        (row as any)?.isAnonymous ??
        (row as any)?.anonymous ??
        false;

    const createdRaw = row.createdAt ?? row.createdTime;
    const liked =
        (row as any).likedByMe ??
        (row as any).isLike ??
        (row as any).isLiked ?? false;

    const imageKeys: string[] =
        row.contentImageUrls ??
        row.imageUrls ??
        (row.contentImageUrl ? [row.contentImageUrl] :
            row.imageUrl ? [row.imageUrl] : []);

    const pickedRaw = pickNonEmpty(
        row.authorName,
        row.userName,
        row.nickname,
        row.memberName,
        row.writerName
    );
    const display = isMeaningfulName(pickedRaw) ? pickedRaw : (isAnon ? 'Anonymous' : '—');

    const niceCategory =
        (row.boardCategory && typeof row.boardCategory === 'string')
            ? (row.boardCategory[0] + row.boardCategory.slice(1).toLowerCase()) as Category
            : ('Free talk' as Category);

    return {
        id: String(row.postId),
        postId: row.postId,
        author: display,
        authorName: display,
        isAnonymous: Boolean(isAnon),
        avatar: AV,
        category: niceCategory,
        createdAt: toDateLabel(createdRaw, respTimestamp),
        body: row.contentPreview ?? row.content ?? '',
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        images: (imageKeys || []).filter(Boolean).slice(0, MAX_IMAGES),
        hotScore: typeof row.score === 'number' ? row.score : 0,
        likedByMe: Boolean(liked),
        viewCount: Number(row.viewCount ?? 0),
        ...(row.userImageUrl ? { userImageUrl: row.userImageUrl } : {}),
    };
};

export default function CommunityScreen() {
    const [cat, setCat] = useState<Category>('All');
    const [sort, setSort] = useState<'new' | 'hot'>('new');

    const [items, setItems] = useState<PostEx[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const sortServer = sort === 'new' ? 'LATEST' : 'POPULAR';
    const boardId = Number(CATEGORY_TO_BOARD_ID[cat]);

    const likeMutation = useToggleLike();

    const {
        bookmarked, toggleBookmarked, setBookmarked,
        liked, likeCount, setLiked, toggleLiked, setLikeCount, bumpLike, hydrateLikeFromServer
    } = usePostUI();

    const hasAnyBookmark = Object.values(bookmarked).some(Boolean);

    useEffect(() => { refresh(); }, [boardId, sort]);

    const fetchPage = async (after?: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const params = { sort: sortServer, size: 20, ...(after ? { cursor: after } : {}) };
            console.log('[community:list] GET', `/api/v1/boards/${boardId}/posts`, params);
            const { data } = await api.get<PostsListResp>(`/api/v1/boards/${boardId}/posts`, { params });
            const respTimestamp = data?.timestamp;
            const list = (data?.data?.items ?? []).map(item => mapItem(item, respTimestamp));


            setItems(prev => {
                if (!after) {
                    return list.map(p => ({
                        ...p,
                        bookmarked: bookmarked[p.postId] ?? p.bookmarked ?? false,
                        likedByMe: liked[p.postId] ?? p.likedByMe ?? false,
                        likes: (likeCount[p.postId] ?? p.likes ?? 0),

                    }));
                } else {
                    const seen = new Set(prev.map(p => p.postId));
                    const appended = list.filter(p => !seen.has(p.postId));
                    const merged = [...prev, ...appended];

                    return merged.map(p => ({
                        ...p,
                        bookmarked: bookmarked[p.postId] ?? p.bookmarked ?? false,
                    }));
                }
            });

            setHasNext(Boolean(data?.data?.hasNext));
            setCursor(data?.data?.nextCursor ?? undefined);
        } catch (e) {
            console.log('[community:list] error', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refresh = () => {
        setRefreshing(true);
        setItems([]);
        setCursor(undefined);
        setHasNext(true);
        fetchPage(undefined);
    };

    const onEndCalledRef = useRef(false);

    const loadMore = () => {
        if (loading || onEndCalledRef.current || !hasNext || !cursor) return;
        onEndCalledRef.current = true;
        fetchPage(cursor).finally(() => {

        });
    };

    const handleToggleLike = async (postId: number) => {
        const target = items.find(p => p.postId === postId);
        const prevLiked = Boolean(target?.likedByMe);
        const prevCount = (likeCount[postId] ?? target?.likes ?? 0);
        const nextLiked = !prevLiked;
        const delta = prevLiked ? -1 : +1;
        const nextCount = Math.max(0, prevCount + delta);

        toggleLiked(postId);
        setLikeCount(postId, nextCount);

        setItems(prev =>
            prev.map(p =>
                p.postId === postId
                    ? { ...p, likedByMe: nextLiked, likes: nextCount }
                    : p
            )
        );

        try {
            await likeMutation.mutateAsync({ postId, liked: prevLiked });
        } catch (e) {
            setLiked(postId, prevLiked);
            setLikeCount(postId, prevCount);
            setItems(prev =>
                prev.map(p =>
                    p.postId === postId
                        ? { ...p, likedByMe: prevLiked, likes: prevCount }
                        : p
                )
            );
            console.log('[like:list] error', e);
        }
    };

    const bmBusyRef = useRef<Record<number, boolean>>({});

    const handleToggleBookmark = async (postId: number) => {
        if (bmBusyRef.current[postId]) return;
        bmBusyRef.current[postId] = true;

        const before = items.find(p => p.postId === postId)?.bookmarked ?? false;
        const next = !before;

        toggleBookmarked(postId);
        setItems(prev =>
            prev.map(p => (p.postId === postId ? { ...p, bookmarked: next } : p)),
        );

        try {
            if (next) {
                await addBookmark(postId);
            } else {
                await removeBookmark(postId);
            }
        } catch (e) {
            setBookmarked(postId, before);
            setItems(prev =>
                prev.map(p => (p.postId === postId ? { ...p, bookmarked: before } : p)),
            );
            console.log('[bookmark:list] error', e);
        } finally {
            bmBusyRef.current[postId] = false;
        }
    };


    const renderPost: ListRenderItem<PostEx> = ({ item }) => (
        <PostCard
            data={{ ...item, category: cat === 'All' ? item.category : cat }}
            onPress={() =>
                router.push({ pathname: '/community/[id]', params: { id: String(item.postId) } })
            }
            onToggleLike={() => handleToggleLike(item.postId)}
            onToggleBookmark={() => handleToggleBookmark(item.postId)}
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
                    <IconBtn
                        onPress={() => {
                            const qs = `?boardId=${encodeURIComponent(String(boardId))}&cat=${encodeURIComponent(cat)}`;
                            router.push(`/community/SearchScreen${qs}`);
                        }}
                    >
                        <AntDesign name="search1" size={18} color="#cfd4da" />
                    </IconBtn>

                    <IconBtn
                        onPress={() => {
                            router.push('/community/bookmarks');
                        }}
                    >
                        <MaterialIcons
                            name='bookmark-border'
                            size={20}
                            color='#cfd4da'
                        />
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
                data={items}
                keyExtractor={(it: PostEx) => String(it.postId)}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.4}
                onEndReached={loadMore}
                onMomentumScrollBegin={() => {
                    onEndCalledRef.current = false;
                }}
                refreshing={refreshing}
                onRefresh={refresh}
                ListFooterComponent={loading ? <FooterLoading><ActivityIndicator /></FooterLoading> : null}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <WriteFab onPress={() => router.push('/community/write')} />
        </Safe>
    );
}

const Safe = styled.SafeAreaView`flex: 1; background: #1d1e1f;`;
const Header = styled.View`
  padding: 0 12px; margin-top: 12px;
  flex-direction: row; align-items: center; justify-content: space-between;
`;
const Left = styled.View`flex-direction: row; align-items: center;`;
const Title = styled.Text`
  color: #ffffff; font-size: 32px; font-family: 'InstrumentSerif_400Regular'; letter-spacing: -0.2px;
`;
const IconImage = styled.Image`margin-left: 4px; width: 20px; height: 20px; resize-mode: contain;`;
const Right = styled.View`flex-direction: row; align-items: center;`;
const IconBtn = styled.Pressable`padding: 6px; margin-left: 8px;`;
const ChipsWrap = styled.View`margin-top: 12px;`;
const SortWrap = styled.View`margin-top: 20px; margin-bottom: 14px;`;
const List = styled(FlatList as React.ComponentType<FlatListProps<PostEx>>)``;
const FooterLoading = styled.View`padding: 16px 0;`;
