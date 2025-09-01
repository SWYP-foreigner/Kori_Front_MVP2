import { declineFollow } from '@/api/mypage/mypage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useDeclineFollow() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (fromUserId: number) => declineFollow(fromUserId),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['follow', 'received'] });
        },
    });
}
