import api from "@/api/axiosInstance";

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
}

export async function patchMyProfile(body: ProfileEditBody) {
    const { data } = await api.patch('/api/v1/mypage/profile/edit', body);
    return data;
}