import { getRecommended, toFriendCard } from '@/api/home/recommend';
import { useQuery } from '@tanstack/react-query';

export type FriendCardItem = {
    id: number;
    name: string;
    country?: string;
    birth?: number | string;
    gender?: 'male' | 'female' | 'unspecified';
    purpose?: string;
    languages: string[];
    personalities: string[];
    bio?: string;
};

export default function useRecommendedFriends(limit = 20) {
    return useQuery<FriendCardItem[]>({
        queryKey: ['home', 'recommend', limit],
        queryFn: async () => {
            const rows = await getRecommended(limit);

            const mapped = (rows ?? []).map((r: any, i: number) => toFriendCard(r, i));

            return mapped.map((raw: any, i: number): FriendCardItem => {
                const n = Number(raw?.id);
                const id = Number.isFinite(n) && n > 0 ? n : 100000 + i;

                return {
                    id,
                    name: raw?.name || 'Unknown',
                    country: raw?.country ?? '-',
                    birth: raw?.birth ?? raw?.birthday ?? undefined,
                    gender: (raw?.gender as FriendCardItem['gender']) ?? 'unspecified',
                    purpose: raw?.purpose ?? '-',
                    languages: Array.isArray(raw?.languages) ? raw.languages : [],
                    personalities: Array.isArray(raw?.personalities) ? raw.personalities : [],
                    bio: raw?.bio ?? raw?.introduction ?? '',
                };
            });
        },
        staleTime: 60_000,
    });
}
