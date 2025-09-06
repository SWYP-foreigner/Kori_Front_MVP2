import api from '@/api/axiosInstance';
import { keyToUrl } from '@/utils/image';

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
    imageKey?: string | null;   // 서버에서 오는 키 또는 완전 URL
};

export type FriendCardData = {
    id: number | string;
    name: string;
    country?: string;
    birth?: number;
    gender?: 'male' | 'female' | 'unspecified';
    purpose?: string;
    languages: string[];
    personalities: string[];
    bio?: string;
    imageUrl?: string;          // 최종 URL (화면에서 이걸 사용)
    imageKey?: string | null;   // 원본 키(옵션)
};

const mapGender = (g?: string | null): FriendCardData['gender'] => {
    const v = (g || '').toLowerCase();
    if (v.startsWith('male') || v === 'm') return 'male';
    if (v.startsWith('female') || v === 'f') return 'female';
    return 'unspecified';
};

export function toFriendCard(dto: RecommendedFriendDto, idx: number): FriendCardData {
    const name = [dto.firstname, dto.lastname].filter(Boolean).join(' ').trim() || 'Unknown';
    const year = dto.birthday?.match(/^\d{4}/)?.[0];
    const id = dto.userId ?? dto.memberId ?? `rec-${idx}`;

    return {
        id,
        name,
        country: dto.country ?? '-',
        birth: year ? Number(year) : undefined,
        gender: mapGender(dto.gender),
        purpose: dto.purpose ?? '-',
        languages: dto.language ?? [],
        personalities: dto.hobby ?? [],
        bio: dto.introduction ?? '',
        imageKey: dto.imageKey ?? null,
        imageUrl: dto.imageKey ? keyToUrl(dto.imageKey) : undefined,
    };
}

export async function getRecommended(limit = 20): Promise<RecommendedFriendDto[]> {
    const { data } = await api.get('/api/v1/commend/content-based', { params: { limit } });
    return data ?? [];
}
