import { getRecommended, toFriendCard } from '@/api/home/recommend';
import { useQuery } from '@tanstack/react-query';

export default function useRecommendedFriends(limit = 20) {
    return useQuery({
        queryKey: ['home', 'recommended', limit],
        queryFn: async () => {
            const rows = await getRecommended(limit);
            return rows.map((r, i) => toFriendCard(r, i));
        },
        staleTime: 60_000,
    });
}
