import { deleteAccount } from '@/api/mypage/auth';
import { useMutation } from '@tanstack/react-query';

export function useDeleteAccount() {
    return useMutation({
        mutationFn: deleteAccount,
    });
}
