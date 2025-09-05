import api from '@/api/axiosInstance';
import type { Post } from '@/components/PostCard';
import { useQuery } from '@tanstack/react-query';

export type SearchPostItem = {
    postId: number;
    contentPreview?: string;
    content?: string;
    userName?: string;
    boardCategory?: string;
    createdAt?: string | number;
    likeCount?: number;
    commentCount?: number;
    viewCount?: number;
    score?: number;
    userImageUrl?: string;
    contentImageUrls?: string[];
    imageUrls?: string[];
    contentImageUrl?: string;
    imageUrl?: string;
    likedByMe?: boolean;
    isLike?: boolean;
    isLiked?: boolean;
};

export type SearchPostHit = {
    item: SearchPostItem;
    score?: number;
    highlight?: string;
};

export type PostExFromSearch = Post & {
    postId: number;
    likedByMe?: boolean;
    userImageUrl?: string;
    score?: number;
    highlight?: string;
    hotScore: number;
};

const AV = require('@/assets/images/character1.png');
const MAX_IMAGES = 5;

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function parseDateFlexible(v?: unknown): Date | null {
    if (v == null) return null;
    let s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return new Date(parseFloat(s) * 1000);
    if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}
function toDateLabel(raw?: unknown): string {
    const d = parseDateFlexible(raw);
    if (!d) return '';
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(d).replace(/-/g, '/');
    } catch {
        return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
    }
}

function mapHit(hit: SearchPostHit): PostExFromSearch {
    const row = hit.item;

    const liked =
        (row as any).likedByMe ??
        (row as any).isLike ??
        (row as any).isLiked ?? false;

    const images: string[] =
        row.contentImageUrls ??
        row.imageUrls ??
        (row.contentImageUrl ? [row.contentImageUrl]
            : row.imageUrl ? [row.imageUrl] : []);

    return {
        id: String(row.postId),
        postId: row.postId,
        author: row.userName || 'Unknown',
        avatar: AV,
        category: row.boardCategory ?? 'All',
        createdAt: toDateLabel(row.createdAt),
        body: row.contentPreview ?? row.content ?? '',
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        images: images.slice(0, MAX_IMAGES),

        hotScore: typeof row.score === 'number' ? row.score : 0,
        likedByMe: Boolean(liked),
        ...(row.userImageUrl ? { userImageUrl: row.userImageUrl } : {}),

        score: typeof hit.score === 'number' ? hit.score : row.score,
        highlight: hit.highlight,
    };
}

export async function fetchSearchPosts(q: string, boardId?: number) {
    const keyword = q.trim();
    if (!keyword || !Number.isFinite(boardId)) return [] as PostExFromSearch[];

    const url = `/api/v1/search/${encodeURIComponent(String(boardId))}/posts`;
    const { data } = await api.get<SearchPostHit[]>(url, { params: { q: keyword } });
    return (data ?? []).map(mapHit);
}

export function useSearchPosts(q: string, boardId?: number) {
    return useQuery<PostExFromSearch[]>({
        queryKey: ['searchPosts', q, boardId],
        queryFn: () => fetchSearchPosts(q, boardId),
        enabled: Boolean(q && q.trim().length > 0 && Number.isFinite(boardId)),
    });
}

