import api from '@/api/axiosInstance';

export type RecommendedFriendDto = {
    userId?: number | string;
    memberId?: number | string;
    firstname?: string | null;
    lastname?: string | null;
    gender?: string | null;
    birthday?: string | null;
    country?: string | null;
    introduction?: string | null;
    purpose?: string | null;
    language?: string[] | null;
    hobby?: string[] | null;
    imageKey?: string | null;
};

export async function getRecommended(limit = 20) {
    const { data } = await api.get<RecommendedFriendDto[]>(
        '/api/v1/commend/content-based',
        { params: { limit } }
    );
    console.log('🪵[step1] 추천 백엔드 응답:', JSON.stringify(data, null, 2));
    return data;
}

export type FriendCardData = {
    id: number | string;
    name: string;
    country: string;
    birth?: number;
    gender?: 'male' | 'female' | 'unspecified';
    purpose: string;
    languages: string[];
    personalities: string[];
    bio?: string;
};

function mapGender(g?: string | null): FriendCardData['gender'] {
    const v = (g || '').toLowerCase();
    if (v.startsWith('male') || v === 'm') return 'male';
    if (v.startsWith('female') || v === 'f') return 'female';
    return 'unspecified';
}

export function toFriendCard(dto: RecommendedFriendDto, idx: number): FriendCardData {
    const name = [dto.firstname, dto.lastname].filter(Boolean).join(' ').trim() || 'Unknown';
    const year = dto.birthday?.match(/^\d{4}/)?.[0];

    const id = (dto.userId ?? dto.memberId ?? `rec-${idx}`);
    const mapped: FriendCardData = {
        id,
        name,
        country: dto.country ?? '-',
        birth: year ? Number(year) : undefined,
        gender: mapGender(dto.gender || undefined),
        purpose: dto.purpose ?? '-',
        languages: dto.language ?? [],
        personalities: dto.hobby ?? [],
        bio: dto.introduction ?? '',
    };
    console.log(`🪵[step2] toFriendCard(${idx}):`, mapped);
    return mapped;
}
