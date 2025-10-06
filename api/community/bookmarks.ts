import api from '@/api/axiosInstance';

export async function addBookmark(postId: number) {
  return api.put(`/api/v1/posts/${postId}/bookmarks/me`);
}

export async function removeBookmark(postId: number) {
  return api.delete(`/api/v1/posts/${postId}/bookmarks/me`);
}
