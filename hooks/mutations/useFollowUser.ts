import { postFollow } from '@/api/home/follow';
import { useMutation } from '@tanstack/react-query';
import Toast from "react-native-toast-message";

export default function useFollowUser() {
    return useMutation({
        mutationFn: (userId: number) => postFollow(userId),
        onSuccess: (res) => {
            Toast.show({ type: 'success', text1: res.message || '팔로우 요청을 보냈어요.' });
        },
        onError: (err: any) => {
            Toast.show({ type: 'error', text1: '팔로우 실패', text2: err?.response?.data?.message ?? '잠시 후 다시 시도해주세요.' });
        },
    });
}