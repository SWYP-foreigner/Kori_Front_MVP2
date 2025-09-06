import api from '@/api/axiosInstance';
import { keepPreviousData, useQuery } from '@tanstack/react-query'; // ✅ 헬퍼 import

export type FollowStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
type Tab = 'sent' | 'received';

export type RawFollowUser = {
    id: number;
    username?: string;
    nationality?: string;
    sex?: string;
    birth?: string;
    purpose?: string;
    language?: string[];
    hobby?: string[];
    introduction?: string;
    [k: string]: any;
};

export type FollowUserItem = {
    userId: number;
    name: string;
    country?: string;
    gender?: string;
    birth?: string;
    purpose?: string;
    languages?: string[];
    hobbies?: string[];
    bio?: string;
    raw: RawFollowUser;
};

function adapt(u: RawFollowUser): FollowUserItem {
    return {
        userId: Number(u.id),
        name: u.username ?? 'Unknown',
        country: u.nationality,
        gender: u.sex,
        birth: u.birth,
        purpose: u.purpose,
        languages: u.language,
        hobbies: u.hobby,
        bio: u.introduction,
        raw: u,
    };
}

export function useFollowList(status: FollowStatus, tab: Tab) {
    const isFollowers = tab === 'received';

    return useQuery<FollowUserItem[]>({
        queryKey: ['follow-list', status, tab] as const,
        queryFn: async () => {
            const { data } = await api.get('/api/v1/mypage/follows', {
                params: { status, isFollowers },
            });
            const arr: unknown = Array.isArray(data) ? data : (data?.data ?? []);
            if (!Array.isArray(arr)) {
                console.warn('[useFollowList] Unexpected API response:', data);
                return [];
            }
            return (arr as RawFollowUser[])
                .filter(x => x && typeof x.id !== 'undefined')
                .map(adapt);
        },

        staleTime: 15_000,
        placeholderData: keepPreviousData,
    });
}
