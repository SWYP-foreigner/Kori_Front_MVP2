import { unfollowAccepted } from '@/api/mypage/following';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useUnfollowAccepted() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (friendId: number) => unfollowAccepted(friendId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following', 'ACCEPTED'] });
      qc.invalidateQueries({ queryKey: ['accepted-following'] });
    },
  });
}
