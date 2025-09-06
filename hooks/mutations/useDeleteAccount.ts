import api from '@/api/axiosInstance';
import { authLocalCleanup, blockTokenRefresh } from '@/src/lib/auth/session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

async function deleteAccount(): Promise<void> {
    await api.delete('/api/v1/member/withdraw');
}

export function useDeleteAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: async () => {
            blockTokenRefresh();
            await authLocalCleanup(qc);
            router.replace('/login');
        },
    });
}
