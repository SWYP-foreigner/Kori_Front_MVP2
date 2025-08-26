import { patchMyProfile, type ProfileEditBody } from '@/api/mypage/mypage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useProfileEdit() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: ProfileEditBody) => patchMyProfile(body),

        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['mypage', 'profile'] });
        },

        onError: (err: any) => {
            console.log('[useProfileEdit] error', err?.response?.status, err?.message);
        },
    });
}
