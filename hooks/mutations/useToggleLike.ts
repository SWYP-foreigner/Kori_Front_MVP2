import { toggleLike } from '@/api/community/likes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export function useToggleLike() {
    const qc = useQueryClient();

    return useMutation<boolean, AxiosError, number>({
        mutationFn: (postId) => toggleLike(postId),
        onSuccess: (_ok, postId) => {
            qc.invalidateQueries({ queryKey: ['my-posts'] });
            qc.invalidateQueries({ queryKey: ['post', postId] });
        },
    });
}