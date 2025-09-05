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
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator, Animated,
    Easing, FlatList, Keyboard, KeyboardAvoidingView, ListRenderItem, Platform,
    TextInput as RNTextInput,
    TextInputProps, ViewToken,
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

const StyledInput = styled(RNTextInput)`
  flex: 1;
  color: #e6e9ec;
  font-size: 16px;
  padding: 0;
`;
const SearchInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => (
    <StyledInput ref={ref} {...props} />
));
SearchInput.displayName = 'SearchInput';

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
        } catch { }
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

    const visible: PostEx[] = useMemo(() => {
        if (!items.length) return items;
        return items.map(it =>
            imagesById[it.postId]
                ? { ...it, images: imagesById[it.postId] }
                : it
        );
    }, [items, imagesById]);

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

    const [searchOpen, setSearchOpen] = useState(false);
    const [q, setQ] = useState('');
    const inputRef = useRef<RNTextInput>(null);
    const slideY = useRef(new Animated.Value(80)).current; // 헤더 아래에서 슬라이드
    const effectiveQ = useMemo(() => q.trim(), [q]);
    const canQuery = searchOpen && effectiveQ.length >= 2;

    const { data: results, isFetching: searching, refetch: refetchSearch } =
        useSearchPosts(effectiveQ, CATEGORY_TO_BOARD_ID[cat]);

    const openSearch = () => {
        setSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
        Animated.timing(slideY, {
            toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }).start();
    };
    const closeSearch = () => {
        Keyboard.dismiss();
        Animated.timing(slideY, {
            toValue: 80, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true,
        }).start(() => {
            setSearchOpen(false);
            setQ('');
        });
    };

    return (
        <Safe>
            <Header>
                <Left>
                    <Title>Community</Title>
                    <IconImage source={ICON} />
                </Left>
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
            </Header>

            <ChipsWrap>
                <CategoryChips value={cat} onChange={setCat} />
            </ChipsWrap>
            <SortWrap>
                <SortTabs value={sort} onChange={setSort} />
            </SortWrap>

            <List
                data={visible}
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

            {searchOpen && (
                <Overlay pointerEvents="box-none">
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                    >
                        <Animated.View style={{ transform: [{ translateY: slideY }] }}>
                            <SearchBar>
                                <Magnify>
                                    {searching ? <ActivityIndicator size="small" /> : <AntDesign name="search1" size={16} color="#9aa0a6" />}
                                </Magnify>
                                <SearchInput
                                    ref={inputRef}
                                    value={q}
                                    onChangeText={setQ}
                                    placeholder="Search Anything"
                                    placeholderTextColor="#9aa0a6"
                                    returnKeyType="search"
                                    onSubmitEditing={() => {
                                        if (canQuery) refetchSearch();
                                        else Keyboard.dismiss();
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {!!q && (
                                    <ClearBtn onPress={() => setQ('')}>
                                        <AntDesign name="close" size={14} color="#cfd4da" />
                                    </ClearBtn>
                                )}
                                <Cancel onPress={closeSearch}>
                                    <CancelText>Cancel</CancelText>
                                </Cancel>
                            </SearchBar>
                        </Animated.View>

                        {canQuery ? (
                            <FlatList<PostExFromSearch>
                                data={results ?? []}
                                keyExtractor={(it) => String(it.postId)}
                                renderItem={({ item }) => (
                                    <PostCard
                                        data={{ ...item, category: cat }}
                                        onPress={() => {
                                            closeSearch();
                                            router.push({ pathname: '/community/[id]', params: { id: String(item.postId) } });
                                        }}
                                        onToggleLike={() => { }}
                                        onToggleBookmark={() => { }}
                                    />
                                )}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
                                onRefresh={refetchSearch}
                                refreshing={false}
                                ListEmptyComponent={<Empty><EmptyText>No results.</EmptyText></Empty>}
                            />
                        ) : (
                            <DimBg onPress={closeSearch} />
                        )}
                    </KeyboardAvoidingView>
                </Overlay>
            )}
        </Safe>
    );
}

const Safe = styled.SafeAreaView`flex: 1; background: #1d1e1f;`;
const Header = styled.View`padding: 0 12px; margin-top: 12px; flex-direction: row; align-items: center; justify-content: space-between;`;
const Left = styled.View`flex-direction: row; align-items: center;`;
const Title = styled.Text`color: #ffffff; font-size: 32px; font-family: 'InstrumentSerif_400Regular'; letter-spacing: -0.2px;`;
const IconImage = styled.Image`margin-left: 4px; width: 20px; height: 20px; resize-mode: contain;`;
const Right = styled.View`flex-direction: row; align-items: center;`;
const IconBtn = styled.Pressable`padding: 6px; margin-left: 8px;`;
const ChipsWrap = styled.View`margin-top: 12px;`;
const SortWrap = styled.View`margin-top: 20px; margin-bottom: 14px;`;
const List = styled(FlatList as React.ComponentType<FlatListProps<PostEx>>)``;
const FooterLoading = styled.View`padding: 16px 0;`;

const Overlay = styled.View`
  ...StyleSheet.absoluteFillObject as any;
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
`;

const SearchBar = styled.View`
  margin: 10px 12px;
  height: 40px;
  background: #2a2b2c;
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  padding: 0 8px 0 12px;
`;

const Magnify = styled.View`width: 20px; align-items: center; margin-right: 8px;`;
const ClearBtn = styled.Pressable`width: 28px; height: 28px; align-items: center; justify-content: center;`;
const Cancel = styled.Pressable`padding: 6px 8px; margin-left: 4px;`;
const CancelText = styled.Text`color: #cfd4da; font-size: 14px;`;
const Empty = styled.View`padding: 40px 16px; align-items: center;`;
const EmptyText = styled.Text`color: #cfd4da;`;
const DimBg = styled.Pressable`flex: 1;`; 
