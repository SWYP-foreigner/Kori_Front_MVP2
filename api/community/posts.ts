// src/lib/community/api.ts
import api from '@/api/axiosInstance';
import type { Category } from '@/components/CategoryChips';

/** ---- boards / sort ---- */
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

/** ---- name helpers (목록/상세 공통) ---- */
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

/** ---- 목록 타입 ---- */
export type PostListItem = {
    postId: number;

    // 텍스트/메타
    title?: string | null;
    contentPreview?: string | null;
    content?: string | null;

    // 작성자 이름 후보들 (optional + null 허용)
    authorName?: string | null;
    userName?: string | null;
    nickname?: string | null;
    memberName?: string | null;
    writerName?: string | null;

    // 작성자/익명/아바타
    isAnonymous?: boolean;
    userImageUrl?: string | null;

    // 카테고리/시간/지표
    boardCategory?: string | Category;
    categoryId?: number;
    createdAt?: string | number | null;
    createdTime?: string | number | null;
    likeCount?: number | null;
    commentCount?: number | null;
    viewCount?: number | null;
    score?: number | null;

    // 좋아요 상태
    likedByMe?: boolean;
    isLike?: boolean;
    isLiked?: boolean;

    // 이미지
    contentImageUrls?: string[] | null;
    imageUrls?: string[] | null;
    contentImageUrl?: string | null;
    imageUrl?: string | null;

    // (서버가 줄 수도 있는) 기타
    imageCount?: number | null;
};

export type PostsCursorPage = {
    items: PostListItem[];
    hasNext: boolean;
    nextCursor?: string | null;
};

type PostsListServerResp = { success: boolean; data: PostsCursorPage; timestamp?: string };

/** 목록 페이지 API (원본 그대로 전달) */
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

/** ---- 상세 타입 ---- */
export type PostDetail = {
    postId: number;

    // 본문/링크
    content: string;
    link?: string | null;

    // 작성자 식별자 + 이름 후보들
    authorId?: string | number | null;
    userId?: string | number | null;
    memberId?: string | number | null;
    writerId?: string | number | null;
    authorName?: string | null;
    userName?: string | null;
    nickname?: string | null;
    memberName?: string | null;
    writerName?: string | null;

    // 표시용
    userImageUrl?: string | null;
    isAnonymous?: boolean;

    // 카테고리/시간
    boardCategory?: string;
    createdTime: number | string | null; // 서버가 epoch(초/밀리초) 또는 ISO 문자열 줄 수 있음

    // 지표
    likeCount: number;
    commentCount: number;
    viewCount: number;

    // 이미지
    contentImageUrls?: string[] | null;
    imageUrls?: string[] | null;
    contentImageUrl?: string | null;
    imageCount?: number | null;
};

type PostDetailServerResp = { message?: string; data: PostDetail; timestamp?: string };

/** 상세 API (래퍼: data.data 또는 data 형태 모두 수용) */
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

/** 작성 API */
export type CreatePostBody = {
    content: string;
    isAnonymous: boolean;
    imageUrls?: string[];
};

export async function createPost(boardId: number, body: CreatePostBody) {
    const { data } = await api.post(`/api/v1/boards/${boardId}/posts`, body);
    return data as string;
}
