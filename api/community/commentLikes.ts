import axiosInstance from '@/api/axiosInstance';

const path = (id: number) => `/api/v1/comments/${id}/likes/me`;

export async function addCommentLike(commentId: number): Promise<void> {
    await axiosInstance.put<void>(path(commentId));
}

export async function removeCommentLike(commentId: number): Promise<void> {
    await axiosInstance.delete<void>(path(commentId));
}
