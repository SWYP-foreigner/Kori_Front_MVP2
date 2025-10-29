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
      await authLocalCleanup(qc);
    },
  });
}
