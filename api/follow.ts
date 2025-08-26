import api from '@/api/axiosInstance';

export type FollowResponse = {
    message: string;
    data: string;
    timestamp: string;
};

export async function postFollow(userId: number) {
    const { data } = await api.post<FollowResponse>(`/api/v1/follow/${userId}`, {});
    return data;
}
