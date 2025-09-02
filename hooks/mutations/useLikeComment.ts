import { addCommentLike, removeCommentLike } from '@/api/community/commentLikes';
import type { Comment } from '@/components/CommentItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Vars = { commentId: number; liked: boolean };

export function useLikeComment(postId?: number) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, liked }: Vars) => {
            if (liked) {
                return removeCommentLike(commentId);
            }
            return addCommentLike(commentId);
        },

        onMutate: async ({ commentId, liked }) => {
            if (!postId) return;
            await qc.cancelQueries({ queryKey: ['postComments', postId] });

            const prevSnapshots = qc.getQueriesData<Comment[]>({
                queryKey: ['postComments', postId],
            });

            prevSnapshots.forEach(([key, prev]) => {
                if (!prev) return;
                const next = prev.map((c) =>
                    Number(c.id) === Number(commentId)
                        ? {
                            ...c,
                            likedByMe: !liked,
                            likes: Math.max(0, (c.likes ?? 0) + (liked ? -1 : +1)),
                        }
                        : c,
                );
                qc.setQueryData(key, next);
            });

            return { prevSnapshots };
        },

        onError: (_err, _vars, ctx) => {
            if (!postId || !ctx?.prevSnapshots) return;
            ctx.prevSnapshots.forEach(([key, prev]) => {
                qc.setQueryData(key, prev);
            });
        },

        onSettled: () => {
            if (!postId) return;
            qc.invalidateQueries({ queryKey: ['postComments', postId] });
        },
    });
}
