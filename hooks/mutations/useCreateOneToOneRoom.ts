import api from '@/api/axiosInstance';
import { useMutation } from '@tanstack/react-query';

type Vars = { otherUserId: number | string };
type ChatRoom = { id: string | number; isGroup?: boolean; createdAt?: string; participants?: any[] };

export function useCreateOneToOneRoom() {
  return useMutation<string, Error, Vars>({
    mutationFn: async ({ otherUserId }) => {
      const { data } = await api.post('/api/v1/chat/rooms/oneTone', { otherUserId });
      const room = (data?.data ?? data) as ChatRoom | undefined;
      const roomId = room?.id ?? (room as any)?.roomId;
      if (!roomId) throw new Error('roomId가 응답에 없습니다.');
      return String(roomId);
    },
  });
}
