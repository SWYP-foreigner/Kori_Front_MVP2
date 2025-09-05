import api from '@/api/axiosInstance';
import CategoryChips, { Category } from '@/components/CategoryChips';
import PostCard, { Post } from '@/components/PostCard';
import SortTabs, { SortKey } from '@/components/SortTabs';
import WriteFab from '@/components/WriteFab';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { useSearchPosts, type PostExFromSearch } from '@/hooks/queries/useSearchPosts';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';

import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    TextInput as RNTextInput,
    ViewToken,
    type FlatListProps
} from 'react-native';
import styled from 'styled-components/native';

const ICON = require('@/assets/images/IsolationMode.png');
const AV = require('@/assets/images/character1.png');

const MAX_IMAGES = 5;

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
    likedByMe?: boolean;
    isLike?: boolean;
    isLiked?: boolean;

    contentImageUrls?: string[];
    imageUrls?: string[];
    contentImageUrl?: string;
    imageUrl?: string;

    userImageUrl?: string;
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
    hotScore?: number;
    minutesAgo?: number;
    bookmarked?: boolean;
    likedByMe?: boolean;
    userImageUrl?: string;
};

const mapItem = (row: PostsListItem, respTimestamp?: string): PostEx => {
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

    return {
        id: String(row.postId),
        postId: row.postId,
        author: row.authorName || 'Unknown',
        avatar: AV,
        category: 'Free talk',
        createdAt: toDateLabel(createdRaw, respTimestamp),
        body: row.contentPreview ?? row.content ?? '',
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        images: imageKeys.slice(0, MAX_IMAGES),
        hotScore: typeof row.score === 'number' ? row.score : 0,
        likedByMe: Boolean(liked),
        ...(row.userImageUrl ? { userImageUrl: row.userImageUrl } : {}),
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

    const [imagesById, setImagesById] = useState<Record<number, string[]>>({});
    const fetchedRef = useRef<Set<number>>(new Set());

    const sortParam = sort === 'new' ? 'LATEST' : 'POPULAR';
    const boardId = CATEGORY_TO_BOARD_ID[cat];

    const likeMutation = useToggleLike();

    const [searchOpen, setSearchOpen] = useState(false);
    const [q, setQ] = useState('');
    const inputRef = useRef<RNTextInput>(null);
    const effectiveQ = useMemo(() => q.trim(), [q]);
    const canQuery = effectiveQ.length >= 2;

    const { data: remoteHits = [], isFetching: searching } = useSearchPosts(effectiveQ, boardId);

    const localMatches = useMemo(() => {
        if (!canQuery) return [];
        const kw = effectiveQ.toLowerCase();
        return items.filter((p) => {
            const hay = `${p.author ?? ''} ${p.body ?? ''} ${(p as any).category ?? ''}`.toLowerCase();
            return hay.includes(kw);
        });
    }, [items, canQuery, effectiveQ]);

    const [visible, setVisible] = useState<PostEx[]>([]);
    useEffect(() => {
        setVisible(
            items.map(it => (imagesById[it.postId] ? { ...it, images: imagesById[it.postId] } : it))
        );
    }, [items, imagesById]);

    const composed: PostEx[] = useMemo(() => {
        if (!canQuery) return visible;

        const normalize = (x: PostEx | PostExFromSearch): PostEx => ({
            ...x,
            postId: Number(x.postId),
            id: String(x.postId),
        });

        const primary = [
            ...remoteHits.map(normalize),
            ...localMatches.map(normalize),
        ];

        const seen = new Set<number>();
        const out: PostEx[] = [];
        const pushUnique = (arr: PostEx[]) => {
            for (const p of arr) {
                if (!seen.has(p.postId)) {
                    seen.add(p.postId);
                    out.push(p);
                }
            }
        };

        pushUnique(primary);
        pushUnique(visible);
        return out;
    }, [canQuery, remoteHits, localMatches, visible]);

    const openSearch = () => {
        setSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
    };
    const closeSearch = () => {
        setQ('');
        setSearchOpen(false);
    };

    useEffect(() => { refresh(); }, [boardId, sortParam]);

    const fetchPage = async (after?: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await api.get<PostsListResp>(`/api/v1/boards/${boardId}/posts`, {
                params: { sort: sortParam, size: 20, ...(after ? { cursor: after } : null) },
            });
            const respTimestamp = data?.timestamp;
            const list = (data?.data?.items ?? []).map(item => mapItem(item, respTimestamp));
            setItems(prev => (after ? [...prev, ...list] : list));
            setHasNext(Boolean(data?.data?.hasNext));
            setCursor(data?.data?.nextCursor);
            setImagesById({});
            fetchedRef.current.clear();
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

    const hydrateImages = useCallback(async (postId: number) => {
        if (fetchedRef.current.has(postId)) return;
        fetchedRef.current.add(postId);
        try {
            const { data } = await api.get(`/api/v1/posts/${postId}`);
            const rawKeys: string[] =
                (data?.contentImageUrls as string[] | undefined) ??
                (data?.imageUrls as string[] | undefined) ??
                (data?.contentImageUrl ? [String(data.contentImageUrl)] :
                    data?.imageUrl ? [String(data.imageUrl)] : []);
            if (rawKeys && rawKeys.length > 0) {
                setImagesById(prev => ({ ...prev, [postId]: rawKeys.slice(0, MAX_IMAGES) }));
            }
        } catch (e) { }
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        for (const v of viewableItems) {
            const it = v.item as PostEx | undefined;
            if (!it) continue;
            const hasEnough = Array.isArray(it.images) && it.images.length >= 2;
            if (!hasEnough) hydrateImages(it.postId);
        }
    }).current;
    const viewConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

    const handleToggleLike = async (postId: number) => {
        const target = items.find(p => p.postId === postId);
        const prevLiked = Boolean(target?.likedByMe);
        const delta = prevLiked ? -1 : +1;

        setItems(prev =>
            prev.map(p =>
                p.postId === postId
                    ? { ...p, likes: Math.max(0, (p.likes ?? 0) + delta), likedByMe: !prevLiked }
                    : p
            )
        );

        try {
            await likeMutation.mutateAsync({ postId, liked: prevLiked });
        } catch (e) {
            setItems(prev =>
                prev.map(p =>
                    p.postId === postId
                        ? { ...p, likes: Math.max(0, (p.likes ?? 0) - delta), likedByMe: prevLiked }
                        : p
                )
            );
            console.log('[like:list] error', e);
        }
    };

    const toggleBookmark = (postId: number) =>
        setItems(prev =>
            prev.map(p => (p.postId === postId ? { ...p, bookmarked: !p.bookmarked } : p))
        );

    const renderPost: ListRenderItem<PostEx> = ({ item }) => (
        <PostCard
            data={{ ...item, category: cat }}
            onPress={() =>
                router.push({ pathname: '/community/[id]', params: { id: String(item.postId) } })
            }
            onToggleLike={() => handleToggleLike(item.postId)}
            onToggleBookmark={() => toggleBookmark(item.postId)}
        />
    );

    return (
        <Safe>
            <Header>
                <Left style={{ flex: 1 }}>
                    {!searchOpen ? (
                        <>
                            <Title>Community</Title>
                            <IconImage source={ICON} />
                        </>
                    ) : (
                        <SearchBox>
                            <Icon>
                                {searching ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <AntDesign name="search1" size={16} color="#9aa0a6" />
                                )}
                            </Icon>
                            <RNTextInput
                                ref={inputRef}
                                value={q}
                                onChangeText={setQ}
                                placeholder="Search Anything"
                                placeholderTextColor="#9aa0a6"
                                returnKeyType="search"
                                onSubmitEditing={() => { }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{ flex: 1, color: '#e6e9ec', padding: 0 }}
                            />
                            {!!q && (
                                <ClearBtn onPress={() => setQ('')}>
                                    <AntDesign name="close" size={14} color="#cfd4da" />
                                </ClearBtn>
                            )}
                            <CancelBtn onPress={closeSearch}>
                                <CancelText>Cancel</CancelText>
                            </CancelBtn>
                        </SearchBox>
                    )}
                </Left>

                {!searchOpen && (
                    <Right>
                        <IconBtn onPress={openSearch}>
                            <AntDesign name="search1" size={18} color="#cfd4da" />
                        </IconBtn>
                        <IconBtn onPress={() => router.push('/community/bookmarks')}>
                            <MaterialIcons name="bookmark-border" size={20} color="#cfd4da" />
                        </IconBtn>
                        <IconBtn onPress={() => router.push('/community/my-history')}>
                            <AntDesign name="user" size={18} color="#cfd4da" />
                        </IconBtn>
                    </Right>
                )}
            </Header>

            <ChipsWrap>
                <CategoryChips value={cat} onChange={setCat} />
            </ChipsWrap>

            <SortWrap>
                <SortTabs value={sort} onChange={setSort} />
            </SortWrap>

            <List
                data={canQuery ? composed : visible} // ✅ 검색 중이면 composed, 아니면 기존 visible
                keyExtractor={(it: PostEx) => String(it.postId)}
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
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfig}
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
const IconImage = styled.Image.attrs({ resizeMode: 'contain' })`
  margin-left: 4px;
  width: 20px;
  height: 20px;
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
const FooterLoading = styled.View`padding: 16px 0;`;

const SearchBox = styled.View`
  flex: 1;
  height: 40px;
  background: #2a2b2c;
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  padding: 0 6px 0 12px;
  margin-right: 8px;
`;
const Icon = styled.View`
  width: 20px;
  align-items: center;
  margin-right: 8px;
`;
const ClearBtn = styled.Pressable`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;
const CancelBtn = styled.Pressable`
  padding: 6px 8px;
`;
const CancelText = styled.Text`
  color: #cfd4da;
`;
