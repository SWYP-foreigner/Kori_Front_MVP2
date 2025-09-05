import api from '@/api/axiosInstance';

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
    userImageUrl?: string;
    contentImageUrls?: string[];
    imageUrls?: string[];
    contentImageUrl?: string;
    imageUrl?: string;
    isLiked?: boolean;
    likedByMe?: boolean;
    isLike?: boolean;
    score?: number;
};

export type SearchPostHit = {
    item: SearchPostItem;
    highlight?: string;
    score?: number;
};

export type SearchPostsPage =
    | {
        items: SearchPostHit[];
        hasNext: boolean;
        nextCursor?: string | null;
        timestamp?: string;
    }
    | SearchPostHit[];

export async function getSearchPosts(params: {
    boardId: number;
    q: string;
    size?: number;
    cursor?: string | null;
}) {
    const { boardId, q, size, cursor } = params;
    const res = await api.get<SearchPostsPage>(`/api/v1/search/${boardId}/posts`, {
        params: { q, ...(size ? { size } : {}), ...(cursor ? { cursor } : {}) },
    });
    return res.data;
}
