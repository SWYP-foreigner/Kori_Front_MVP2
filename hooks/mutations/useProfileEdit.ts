import { patchMyProfile, ProfileEditBody } from '@/api/mypage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function useProfileEdit() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (body: ProfileEditBody) => patchMyProfile(body),
        onSuccess: () => {
            Toast.show({ type: 'success', text1: '프로필 저장 완료' });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
        onError: (err: any) => {
            Toast.show({
                type: 'error',
                text1: '저장 실패',
                text2: err?.response?.data?.message ?? '잠시 후 다시 시도해주세요.',
            });
        },
    });
}