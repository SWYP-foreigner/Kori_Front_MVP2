import { getAcceptedFollowing, type AcceptedFriendRow } from '@/api/mypage/following';
import { FollowingRow, FollowStatus, getFollowing } from '@/api/mypage/mypage';
import { useQuery } from '@tanstack/react-query';

export function useFollowing(status: FollowStatus) {
  return useQuery<FollowingRow[], Error>({
    queryKey: ['following', status],
    queryFn: () => getFollowing(status),
    staleTime: 60_000,
    retry: 1,
  });
}

export const usePendingFollowing = () => useFollowing('PENDING');
export const useRejectedFollowing = () => useFollowing('REJECTED');

export const useAcceptedFollowing = () =>
  useQuery<AcceptedFriendRow[], Error>({
    queryKey: ['following', 'ACCEPTED'],
    queryFn: getAcceptedFollowing,
    staleTime: 60_000,
    retry: 1,
  });
