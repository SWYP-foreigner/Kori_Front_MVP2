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

// 작성한 게시글 조회
export async function getMyPosts(params?: { size?: number; cursor?: string }) {
    const { size = 20, cursor } = params ?? {};
    const { data } = await api.get<MyPostsResp>('/api/v1/my/posts', {
        params: { size, ...(cursor ? { cursor } : null) },
    });
    return data.data;
}

// 게시글 삭제
export async function deletePost(postId: number) {
    await api.delete(`/api/v1/posts/${postId}`);
    return true;
}

// 게시글 수정
export type UpdatePostBody = {
    content: string;
    images?: string[];
    removedImages?: string[];
};

export async function updatePost(postId: number, body: UpdatePostBody) {
    await api.put(`/api/v1/posts/${postId}`, body);
    return true;
}

export type MyCommentItem = {
    commentId: number;
    postContent: string;
    commentContent: string;
    createdAt: string;
};

export type MyCommentsPage = {
    items: MyCommentItem[];
    hasNext: boolean;
    nextCursor?: string | null;
};

type MyCommentsResp = { success: boolean; data: MyCommentsPage };

// 내가 작성한 댓글 조회
export async function getMyComments(params?: { size?: number; cursor?: string }) {
    const { size = 20, cursor } = params ?? {};
    const { data } = await api.get<MyCommentsResp>('/api/v1/my/comments', {
        params: { size, ...(cursor ? { cursor } : null) },
    });
    return data.data;
}
