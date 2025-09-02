import api from '@/api/axiosInstance';

export type RawComment = {
    commentId: number;
    parentId?: number | null;
    userName?: string;
    userImageUrl?: string | null;
    content: string;
    likeCount?: number;
    createdAt?: string | number;
};

export type ListResp<T> = {
    success: boolean;
    data: { items: T[]; hasNext: boolean; nextCursor?: string };
    timestamp?: string;
};

export async function getPostComments(postId: number, sort: 'new' | 'hot') {
    const sortParam = sort === 'new' ? 'LATEST' : 'POPULAR';
    const { data } = await api.get<ListResp<RawComment>>(
        `/api/v1/posts/${postId}/comments`,
        { params: { sort: sortParam, size: 100 } }
    );
    return data;
}

export async function createComment(
    postId: number,
    body: { comment: string; anonymous?: boolean; parentId?: number }
) {
    const { data } = await api.post<string>(
        `/api/v1/posts/${postId}/comments`,
        body
    );
    return data;
}

export async function deleteComment(commentId: number) {
    await api.delete(`/api/v1/comments/${commentId}`);
    return commentId;
}

export type UpdateCommentReq = { content: string };

export async function updateComment(commentId: number, body: UpdateCommentReq) {
    await api.patch(`/api/v1/comments/${commentId}`, body);
    return commentId;
}
