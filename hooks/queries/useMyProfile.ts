import { getMyProfile } from '@/api/mypage/mypage';
import { useQuery } from '@tanstack/react-query';

export default function useMyProfile() {
    return useQuery({
        queryKey: ['mypage', 'profile'],
        queryFn: getMyProfile,
        staleTime: 60_000,
    })
}