import api from '@/api/axiosInstance';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

async function cancelFollowRequest(friendId: number) {
    const { data } = await api.delete(`/api/v1/mypage/users/follow/${friendId}`);
    return data;
}

export default function useCancelFollowRequest(
    options?: UseMutationOptions<unknown, unknown, number>
) {
    const qc = useQueryClient();

    return useMutation<unknown, unknown, number>({
        mutationFn: cancelFollowRequest,
        onSuccess: (res, friendId, ctx) => {
            qc.setQueryData<any[]>(['follow-list', 'PENDING', 'sent'], (old) =>
                Array.isArray(old) ? old.filter(u => Number(u.userId ?? u.id) !== friendId) : old
            );

            qc.invalidateQueries({ queryKey: ['follow-list', 'PENDING', 'sent'] });

            options?.onSuccess?.(res, friendId, ctx);
        },
        onError: options?.onError,
    });
}
