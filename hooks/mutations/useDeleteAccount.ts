// 1. api를 import 합니다.
import api from '@/api/axiosInstance';
import { authLocalCleanup, blockTokenRefresh } from '@/src/lib/auth/session';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function extractIsApple(res: any): boolean {
  return Boolean(res?.data?.data?.isApple ?? res?.data?.isApple ?? res?.isApple ?? false);
}

async function deleteAccount(): Promise<boolean> {
  const res = await api.delete('/api/v1/member/withdraw');
  return extractIsApple(res);
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation<boolean, unknown, void>({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      blockTokenRefresh();
      // 2. authLocalCleanup에 'api'를 첫 번째 인자로 전달합니다.
      await authLocalCleanup(api, qc);
    },
  });
}