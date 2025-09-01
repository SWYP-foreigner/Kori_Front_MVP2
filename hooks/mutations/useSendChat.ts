import { postDirectMessage } from '@/api/chat/direct';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

type Vars = { userId: number; message: string };

export default function useSendChat() {
    return useMutation({
        mutationFn: ({ userId, message }: Vars) => postDirectMessage(userId, message),
        onSuccess: (res) => {
            Toast.show({ type: 'success', text1: '메시지를 보냈어요.' });
            // 필요하면 res.data(예: roomId)로 채팅방 이동 처리 가능
        },
        onError: (err: any) => {
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ??
                (status ? `status ${status}` : '잠시 후 다시 시도해주세요.');
            Toast.show({ type: 'error', text1: '메시지 전송 실패', text2: msg });
            console.log('[sendChat:error]', status, err?.response?.data || err?.message);
        },
    });
}
