import api from '@/api/axiosInstance';

export async function toggleLike(postId: number) {
    await api.put(`/api/v1/posts/${postId}/likes/me`);
    return true;
}