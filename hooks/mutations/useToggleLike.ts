import { toggleLike } from '@/api/community/likes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export function useToggleLike() {
    const qc = useQueryClient();

    return useMutation<boolean, AxiosError, number>({
        mutationFn: (postId) => toggleLike(postId),
        onSuccess: (_ok, postId) => {
            qc.setQueryData(['post', postId], (old: any) => {
                if (!old) return old;
                const prev = Number(old.likeCount ?? 0);
                return {
                    ...old,
                    likeCount: prev + 1,
                    likedByMe: true,
                    isLike: true,
                    isLiked: true,
                };
            });

            qc.invalidateQueries({ queryKey: ['my-posts'] });
        },
    });
}
