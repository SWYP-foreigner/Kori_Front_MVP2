import api from '@/api/axiosInstance';
import type { Category } from '@/components/CategoryChips';

export type BoardId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SortParam = 'LATEST' | 'POPULAR';

export function categoryToBoardId(cat: string): BoardId {
    switch (cat) {
        case 'All': return 1;
        case 'News': return 2;
        case 'Tip': return 3;
        case 'Q&A': return 4;
        case 'Event': return 5;
        case 'Free talk': return 6;
        case 'Activity': return 7;
        default: return 1;
    }
}

export function categoryIdToCategory(id: number): Category {
    switch (id) {
        case 10: return 'News';
        case 11: return 'Free talk';
        case 12: return 'Q&A';
        case 13: return 'Tip';
        case 14: return 'Event';
        case 15: return 'Activity';
        default: return 'Free talk';
    }
}

export function pickDisplayName(row: any): string | undefined {
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
        .map((v) => (v == null ? undefined : String(v).trim()))
        .filter(Boolean) as string[];

    if (isAnon) return candidates[0] || 'Anonymous';
    return candidates[0];
}

export function pickAuthorId(row: any): string | undefined {
    const id =
        row?.authorId ??
        row?.userId ??
        row?.memberId ??
        row?.writerId ??
        row?.ownerId ??
        row?.creatorId ??
        row?.author?.id ??
        row?.user?.id;
    return id != null ? String(id) : undefined;
}

export type PostListItem = {
    postId: number;

    title?: string | null;
    contentPreview?: string | null;
    content?: string | null;

    authorName?: string | null;
    userName?: string | null;
    nickname?: string | null;
    memberName?: string | null;
    writerName?: string | null;

    isAnonymous?: boolean;
    userImageUrl?: string | null;

    boardCategory?: string | Category;
    categoryId?: number;
    createdAt?: string | number | null;
    createdTime?: string | number | null;
    likeCount?: number | null;
    commentCount?: number | null;
    viewCount?: number | null;
    score?: number | null;

    likedByMe?: boolean;
    isLike?: boolean;
    isLiked?: boolean;

    contentImageUrls?: string[] | null;
    imageUrls?: string[] | null;
    contentImageUrl?: string | null;
    imageUrl?: string | null;

    imageCount?: number | null;
};

export type PostsCursorPage = {
    items: PostListItem[];
    hasNext: boolean;
    nextCursor?: string | null;
};

type PostsListServerResp = { success: boolean; data: PostsCursorPage; timestamp?: string };

export async function getPostsPage(
    boardId: BoardId,
    params: { sort?: SortParam; size?: number; cursor?: string }
): Promise<PostsCursorPage> {
    const { sort = 'LATEST', size = 20, cursor } = params ?? {};
    const { data } = await api.get<PostsListServerResp>(`/api/v1/boards/${boardId}/posts`, {
        params: { sort, size, cursor },
    });
    return data.data;
}

export type PostDetail = {
    postId: number;

    content: string;
    link?: string | null;

    authorId?: string | number | null;
    userId?: string | number | null;
    memberId?: string | number | null;
    writerId?: string | number | null;
    authorName?: string | null;
    userName?: string | null;
    nickname?: string | null;
    memberName?: string | null;
    writerName?: string | null;

    userImageUrl?: string | null;
    isAnonymous?: boolean;

    boardCategory?: string;
    createdTime: number | string | null; // 서버가 epoch(초/밀리초) 또는 ISO 문자열 줄 수 있음

    likeCount: number;
    commentCount: number;
    viewCount: number;

    contentImageUrls?: string[] | null;
    imageUrls?: string[] | null;
    contentImageUrl?: string | null;
    imageCount?: number | null;
};

type PostDetailServerResp = { message?: string; data: PostDetail; timestamp?: string };

export async function getPostDetail(
    postId: number
): Promise<PostDetail & { timestamp?: string }> {
    const { data } = await api.get<PostDetailServerResp | (PostDetail & { timestamp?: string })>(
        `/api/v1/posts/${postId}`
    );

    // 백엔드가 { data, timestamp } 래핑해서 주는 경우
    if ((data as any)?.data) {
        const boxed = data as PostDetailServerResp;
        return { ...boxed.data, timestamp: boxed.timestamp };
    }

    // 평면 객체로 직접 주는 경우
    return data as PostDetail & { timestamp?: string };
}

export type CreatePostBody = {
    content: string;
    isAnonymous: boolean;
    imageUrls?: string[];
};

export async function createPost(boardId: number, body: CreatePostBody) {
    const { data } = await api.post(`/api/v1/boards/${boardId}/posts`, body);
    return data as string;
}
