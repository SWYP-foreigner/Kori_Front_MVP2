import { postFollow } from '@/api/home/follow';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function useFollowUser() {
  return useMutation({
    mutationFn: (userId: number) => postFollow(userId),
    onSuccess: (res) => {
      Toast.show({ type: 'success', text1: res.message });
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: 'Follow failed' });
    },
  });
}
