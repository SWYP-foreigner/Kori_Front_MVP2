import api from '@/api/axiosInstance';
import CategoryChips, { Category } from '@/components/CategoryChips';
import PostCard, { Post } from '@/components/PostCard';
import SortTabs, { SortKey } from '@/components/SortTabs';
import WriteFab from '@/components/WriteFab';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';
import { keyToUrl } from '@/utils/image';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
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
    boardCategory: Category;
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

/* ===== date utils ===== */
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

/* ===== name helper ===== */
function pickDisplayName(row: any): string | undefined {
    const isAnon = row?.isAnonymous ?? row?.anonymous ?? false;

    const candidates = [
        row?.authorName,
        row?.memberName,
        row?.nickname,
        row?.userName,
        row?.writerName,
        row?.displayName,
        row?.name,
    ]
        .map(v => (v == null ? undefined : String(v).trim()))
        .filter(Boolean) as string[];

    if (isAnon) return candidates[0] || 'Anonymous';
    return candidates[0];
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

    // 목록 디버그
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[LIST:sample]', {
            postId: row.postId,
            authorName: row.authorName,
            userName: row.userName ?? null,
            nickname: row.nickname,
            memberName: row.memberName,
            isAnonymous: row.isAnonymous,
        });
        if (!row.authorName && !row.nickname && !row.memberName && !row.userName) {
            console.warn('[LIST] authorName missing', {
                postId: row.postId,
                isAnon: Boolean(row.isAnonymous),
                keys: Object.keys(row || {}),
            });
        }
    }

    // 이름 결정: 상세에서 머지되기 전 1차 표시
    // - isAnonymous → Anonymous
    // - userName === null → 탈퇴한 회원 (백엔드가 deactivated를 이렇게 표현하는 패턴 대응)
    // - 완전 공란 → Unknown
    let resolvedAuthor =
        pickDisplayName(row) ??
        (row.isAnonymous ? 'Anonymous' :
            (row.userName === null ? '탈퇴한 회원' : 'Unknown'));

    const niceCategory =
        (row.boardCategory && typeof row.boardCategory === 'string')
            ? (row.boardCategory[0] + row.boardCategory.slice(1).toLowerCase()) as Category
            : ('Free talk' as Category);

    return {
        id: String(row.postId),
        postId: row.postId,
        author: resolvedAuthor,
        avatar: AV,
        category: niceCategory,
        createdAt: toDateLabel(createdRaw, respTimestamp),
        body: row.contentPreview ?? row.content ?? '',
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        images: imageKeys.slice(0, MAX_IMAGES),
        hotScore: typeof row.score === 'number' ? row.score : 0,
        likedByMe: Boolean(liked),
        ...(row.userImageUrl ? { userImageUrl: row.userImageUrl } : {}),
        viewCount: Number(row.viewCount ?? 0),
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
            const { data: detail } = await api.get(`/api/v1/posts/${postId}`);

            // 상세에서 받은 이름/아바타를 목록 아이템에 병합 (여기서 이름도 교정)
            const detailName = pickDisplayName(detail);
            console.log('[hydrate:name]', {
                postId,
                detailName,
                isAnonymous: detail?.isAnonymous ?? detail?.anonymous,
                userImageUrl: detail?.userImageUrl,
            });

            const mergedAvatarUrl =
                detail?.userImageUrl ? keyToUrl(detail.userImageUrl) : undefined;

            const rawKeys: string[] =
                (detail?.contentImageUrls as string[] | undefined) ??
                (detail?.imageUrls as string[] | undefined) ??
                (detail?.contentImageUrl ? [String(detail.contentImageUrl)] :
                    detail?.imageUrl ? [String(detail.imageUrl)] : []);

            setItems(prev =>
                prev.map(p =>
                    p.postId === postId
                        ? {
                            ...p,
                            // 이미지 업데이트
                            ...(rawKeys && rawKeys.length > 0 ? { images: rawKeys.slice(0, MAX_IMAGES) } : {}),
                            // 이름/아바타 업데이트
                            ...(detailName ? { author: detailName } :
                                (detail?.isAnonymous ? { author: 'Anonymous' } :
                                    (detail?.userName === null ? { author: '탈퇴한 회원' } : {}))),
                            ...(mergedAvatarUrl ? { avatar: { uri: mergedAvatarUrl } } : {}),
                            ...(detail?.userImageUrl ? { userImageUrl: detail.userImageUrl } : {}),
                        }
                        : p
                )
            );

            if (rawKeys && rawKeys.length > 0) {
                setImagesById(prev => ({ ...prev, [postId]: rawKeys.slice(0, MAX_IMAGES) }));
            }
        } catch (e: any) {
            // 409/403 등은 접근 제한 → 그냥 스킵
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
                console.log('[hydrate:error]', postId, e?.response?.status, e?.response?.data);
            }
        }
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
            // 롤백
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
            data={{ ...item, category: cat === 'All' ? item.category : cat }}
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
                ListFooterComponent={loading ? <FooterLoading><ActivityIndicator /></FooterLoading> : null}
                contentContainerStyle={{ paddingBottom: 80 }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfig}
            />

            <WriteFab onPress={() => router.push('/community/write')} />
        </Safe>
    );
}

/* ===== styles ===== */
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
