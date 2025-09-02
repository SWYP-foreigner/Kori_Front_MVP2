import api from '@/api/axiosInstance';

const path = (id: number) => `/api/v1/comments/${id}/likes/me`;

// 댓글 좋아요 추가
export async function addCommentLike(commentId: number) {
    await api.put(path(commentId));
}

// 댓글 좋아요 취소
export async function removeCommentLike(commentId: number) {
    await api.delete(path(commentId));
}
