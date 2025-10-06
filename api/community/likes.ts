import api from '@/api/axiosInstance';

export async function likePost(postId: number) {
  if (!Number.isFinite(postId)) throw new Error(`[likePost] invalid postId: ${postId}`);
  await api.put(`/api/v1/posts/${postId}/likes/me`);
  return true;
}

export async function unlikePost(postId: number) {
  if (!Number.isFinite(postId)) throw new Error(`[unlikePost] invalid postId: ${postId}`);
  await api.delete(`/api/v1/posts/${postId}/likes/me`);
  return true;
}

export async function toggleLike(postId: number, liked: boolean) {
  if (!Number.isFinite(postId)) throw new Error(`[toggleLike] invalid postId: ${postId}`);
  return liked ? unlikePost(postId) : likePost(postId);
}
