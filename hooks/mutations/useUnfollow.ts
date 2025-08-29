import { unfollowUser } from '@/api/mypage/mypage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useUnfollow() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (friendId: number) => unfollowUser(friendId),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['friends', 'list'] }),
                qc.invalidateQueries({ queryKey: ['friends', 'following'] }),
                qc.invalidateQueries({ queryKey: ['home', 'recommendations'] }),
            ]);
        },
    });
}
