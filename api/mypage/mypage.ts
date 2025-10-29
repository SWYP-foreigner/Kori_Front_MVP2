import api from '@/api/axiosInstance';

export type FollowStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type Profile = {
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  country?: string;
  introduction?: string;
  purpose?: string;
  language?: string[];
  hobby?: string[];
  imageKey?: string;
  email?: string;
};

export type FollowingRow = {
  id: number;
  username: string;
  nationality?: string;
  sex?: string;
};

export async function getMyProfile() {
  const { data } = await api.get<Profile | { data: Profile }>('/api/v1/member/profile/setting');
  return (data as any)?.data ?? (data as Profile);
}

export type ProfileEditBody = {
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  country?: string;
  introduction?: string;
  purpose?: string;
  language?: string[];
  hobby?: string[];
  imageKey?: string;
};

export async function patchMyProfile(body: ProfileEditBody) {
  const { data } = await api.patch('/api/v1/mypage/profile/edit', body);
  return data as Profile | { message?: string };
}

// 받은 팔로우 수락
export async function acceptFollow(fromUserId: number) {
  const { data } = await api.patch(`/api/v1/mypage/accept-follow/${fromUserId}`);
  return data as { message?: string; data?: unknown; timestamp?: string };
}

// 받은 팔로우 거절
export async function declineFollow(fromUserId: number) {
  const { data } = await api.delete(`/api/v1/mypage/decline-follow/${fromUserId}`);
  return data as { message?: string; data?: unknown; timestamp?: string };
}

// 팔로우 취소
export async function unfollowUser(friendId: number) {
  const { data } = await api.delete(`/api/v1/mypage/users/follow/${friendId}`);
  return data as { message?: string; data?: unknown; timestamp?: string };
}

export async function getFollowing(status: FollowStatus) {
  const { data } = await api.get<FollowingRow[]>('/api/v1/mypage/follows', {
    params: { status },
  });
  return data;
}
