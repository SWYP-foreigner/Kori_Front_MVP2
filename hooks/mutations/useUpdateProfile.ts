import api from '@/api/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UpdateProfilePayload = Partial<{
    firstname: string;
    lastname: string;
    gender: string;
    birthday: string;
    country: string;
    introduction: string;
    purpose: string;
    email: string;
    language: string[];
    hobby: string[];
    imageKey: string;
}>;

export function useUpdateProfile() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateProfilePayload) => {
            const { data } = await api.patch('/api/v1/member/profile/setup', payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['myProfile'] });
        },
    });
}
