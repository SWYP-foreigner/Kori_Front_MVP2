import api from '@/api/axiosInstance';

export type AcceptedFriendRow = {
  id?: number;
  userId?: number;
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  country?: string;
  introduction?: string;
  purpose?: string;
  email?: string;
  language?: string[];
  hobby?: string[];
  imageKey?: string | null;
};

export async function getAcceptedFollowing(): Promise<AcceptedFriendRow[]> {
  const { data } = await api.get<AcceptedFriendRow[]>('/api/v1/mypage/follows/accepted');
  return Array.isArray(data) ? data : [];
}

export async function unfollowAccepted(friendId: number) {
  const { data } = await api.delete(`/api/v1/mypage/users/follow/accepted/${friendId}`);
  return data as { message?: string; data?: unknown; timestamp?: string };
}
