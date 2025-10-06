import { acceptFollow } from '@/api/mypage/mypage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useAcceptFollow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (fromUserId: number) => acceptFollow(fromUserId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['follow', 'received'] }),
        qc.invalidateQueries({ queryKey: ['friends', 'list'] }),
      ]);
    },
  });
}
