import api from '@/api/axiosInstance';

export type Profile = {
    firstname?: string;
    lastname?: string;
    gender?: string;
    birthday?: string;
    country?: string;
    introduction?: string;
    purpose?: string;
    language?: string[];
    hobby?: string[];
    imageKey?: string;
    email?: string;
};

export async function getMyProfile() {                 // 🔥 변경 (추가)
    const { data } = await api.get<Profile | { data: Profile }>(
        '/api/v1/member/profile/setting'
    );
    return (data as any)?.data ?? (data as Profile);
}

export type ProfileEditBody = {
    firstname?: string;
    lastname?: string;
    gender?: string;
    birthday?: string;
    country?: string;
    introduction?: string;
    purpose?: string;
    language?: string[];
    hobby?: string[];
    imageKey?: string;
};

export async function patchMyProfile(body: ProfileEditBody) {
    const { data } = await api.patch('/api/v1/mypage/profile/edit', body);
    return data as Profile | { message?: string };
}
