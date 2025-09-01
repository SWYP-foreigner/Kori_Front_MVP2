import { toggleLike } from '@/api/community/likes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type Vars = { postId: number; liked: boolean };

export function useToggleLike() {
    const qc = useQueryClient();

    return useMutation<boolean, AxiosError, Vars>({
        mutationFn: ({ postId, liked }) => toggleLike(postId, liked),
        onSuccess: (_ok, { postId, liked }) => {
            const delta = liked ? -1 : +1;

            qc.setQueryData(['post', postId], (old: any) => {
                if (!old) return old;
                const prev = Number(old.likeCount ?? 0);
                return {
                    ...old,
                    likeCount: Math.max(0, prev + delta),
                    likedByMe: !liked,
                    isLike: !liked,
                    isLiked: !liked,
                };
            });

            qc.invalidateQueries({ queryKey: ['my-posts'] });
        },
    });
}
