import api from '@/api/axiosInstance';

export type MyPostItem = {
    postId: number;
    title?: string;
    contentPreview: string;
    authorName: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    score?: number;
};

export type MyPostsPage = {
    items: MyPostItem[];
    hasNext: boolean;
    nextCursor?: string | null;
};

type MyPostsResp = { success: boolean; data: MyPostsPage };

export async function getMyPosts(params?: { size?: number; cursor?: string }) {
    const { size = 20, cursor } = params ?? {};
    const { data } = await api.get<MyPostsResp>('/api/v1/my/posts', {
        params: { size, ...(cursor ? { cursor } : null) },
    });
    return data.data;
}
