import axiosInstance from '@/api/axiosInstance';

export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete('/api/v1/member/withdraw');
}
