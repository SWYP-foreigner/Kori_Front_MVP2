import api from '@/api/axiosInstance';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';


export type FollowStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type Tab = 'sent' | 'received';

export type RawFollowUser = {
    id?: number; userId?: number;
    username?: string; name?: string; email?: string;
    firstname?: string; lastname?: string;

    nationality?: string; country?: string;

    sex?: string; gender?: string;

    birth?: string; birthday?: string;

    purpose?: string;

    language?: string[]; languages?: string[];
    hobby?: string[]; hobbies?: string[];

    introduction?: string; bio?: string;

    imageKey?: string; imageUrl?: string; image_url?: string;

    [k: string]: any;
};

export type FollowUserItem = {
    userId: number;
    name: string;
    country?: string;
    gender?: string;
    birthYear?: number;
    purpose?: string;
    languages: string[];
    hobbies: string[];
    bio?: string;
    imageKey?: string;
    imageUrl?: string;
    raw: RawFollowUser;
};

const toYear = (v?: string): number | undefined => {
    const y = (v ?? '').toString().match(/^\d{4}/)?.[0];
    return y ? Number(y) : undefined;
};

const adapt = (u: RawFollowUser): FollowUserItem => {
    const userId = Number(u?.id ?? u?.userId);

    const first = (u?.firstname ?? '').trim();
    const last = (u?.lastname ?? '').trim();
    const full = [first, last].filter(Boolean).join(' ');
    const name = full || u?.username || u?.name || u?.email || 'Unknown';

    const country = u?.country ?? u?.nationality ?? '';
    const gender = u?.gender ?? u?.sex;
    const birthYear = toYear(u?.birthday ?? u?.birth);
    const purpose = u?.purpose ?? '';

    const languages = Array.isArray(u?.languages)
        ? u.languages
        : Array.isArray(u?.language)
            ? u.language
            : [];

    const hobbies = Array.isArray(u?.hobbies)
        ? u.hobbies
        : Array.isArray(u?.hobby)
            ? u.hobby
            : [];

    const bio = u?.introduction ?? u?.bio ?? '';
    const imageKey = u?.imageKey ?? undefined;
    const imageUrl = (u as any)?.imageUrl ?? (u as any)?.image_url ?? undefined;

    return {
        userId,
        name,
        country,
        gender,
        birthYear,
        purpose,
        languages,
        hobbies,
        bio,
        imageKey,
        imageUrl,
        raw: u,
    };
};

export function useSentFollowRequestsSet() {
    const q = useFollowList('PENDING', 'sent'); // 보낸 요청 목록
    const set = useMemo(
        () => new Set((q.data ?? []).map((u) => Number(u.userId)).filter(Number.isFinite)),
        [q.data]
    );
    return { ...q, set }; // q.set 으로 사용
}

export function useFollowList(status: FollowStatus, tab: Tab) {
    const isFollowers = tab === 'received';

    return useQuery<FollowUserItem[]>({
        queryKey: ['follow-list', status, tab] as const,
        queryFn: async () => {
            const params = { status, isFollowers: isFollowers ? 'true' : 'false' };
            console.log('[follow-list] ▶ request params:', params);

            const res = await api.get('/api/v1/mypage/follows', { params });
            const data = res?.data;
            console.log(
                '[follow-list] ◀ raw response:',
                Array.isArray(data) ? `Array(${data.length})` : data
            );

            const arr: unknown = Array.isArray(data) ? data : (data as any)?.data ?? [];
            if (!Array.isArray(arr)) {
                console.warn('[follow-list] ❗ Unexpected response shape:', data);
                return [];
            }

            const adapted = (arr as RawFollowUser[])
                .filter(x => x && (typeof x.id !== 'undefined' || typeof x.userId !== 'undefined'))
                .map(adapt);

            console.log('[follow-list] ✓ adapted length:', adapted.length);
            if (adapted[0]) console.log('[follow-list] ✓ adapted[0]:', adapted[0]);

            return adapted.filter(x => Number.isFinite(x.userId) && x.userId > 0);
        },
        staleTime: 15_000,
        placeholderData: keepPreviousData,
    });
}
