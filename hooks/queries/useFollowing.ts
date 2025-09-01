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
export const useAcceptedFollowing = () => useFollowing('ACCEPTED');
export const useRejectedFollowing = () => useFollowing('REJECTED');
