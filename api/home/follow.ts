import api from '@/api/axiosInstance';

export type FollowResponse = {
  message: string;
  data: string;
  timestamp: string;
};

const TEST_TARGETS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function mapDummyToReal(userId: number) {
  if (__DEV__ && userId >= 100000 && userId < 200000) {
    const mapped = TEST_TARGETS[(userId - 100000) % TEST_TARGETS.length];
    return mapped;
  }
  return userId;
}

export async function postFollow(userId: number) {
  const targetId = mapDummyToReal(userId);
  const { data } = await api.post<FollowResponse>(`/api/v1/home/follow/${targetId}`, {});
  return data;
}
