import { getRecommended, toFriendCard } from '@/api/home/recommend';
import { useQuery } from '@tanstack/react-query';

export type FriendCardItem = {
    id: string;
    otherUserId?: number;
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
            const mapped = (rows ?? []).map((r, i) => toFriendCard(r as any, i));

            const result = mapped.map((raw, i): FriendCardItem => {
                const parsed = Number(raw?.id);
                const otherUserId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

                const item: FriendCardItem = {
                    id: String(raw?.id ?? `rec-${i}`),
                    otherUserId,
                    name: raw?.name || 'Unknown',
                    country: raw?.country ?? '-',
                    birth: (raw as any)?.birth ?? (raw as any)?.birthday ?? undefined,
                    gender: (raw?.gender as FriendCardItem['gender']) ?? 'unspecified',
                    purpose: raw?.purpose ?? '-',
                    languages: Array.isArray(raw?.languages) ? raw.languages : [],
                    personalities: Array.isArray(raw?.personalities) ? raw.personalities : [],
                    bio: (raw as any)?.bio ?? (raw as any)?.introduction ?? '',
                };
                return item;
            });

            console.log('✅[recommend:list]', result);
            return result;
        },
        staleTime: 60_000,
    });
}
