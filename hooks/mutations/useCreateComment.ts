import { createComment } from '@/api/community/comments';
import { Comment } from '@/components/CommentItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AV = require('@/assets/images/character1.png');

export function useCreateComment(postId?: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { comment: string; anonymous?: boolean; parentId?: number }) => {
      if (!postId) throw new Error('postId required');
      return createComment(postId, vars);
    },
    onMutate: async (vars) => {
      if (!postId) return;
      await qc.cancelQueries({ queryKey: ['postComments', postId] });
      const prev = qc.getQueryData<Comment[]>(['postComments', postId]) ?? [];

      const temp: Comment = {
        id: `temp-${Date.now()}`,
        author: vars.anonymous ? 'Anonymous' : 'You',
        avatar: AV,
        createdAt: new Date().toISOString().slice(0, 10),
        body: vars.comment,
        likes: 0,
        isChild: !!vars.parentId,
        hotScore: 0,
        anonymous: !!vars.anonymous,
      };

      qc.setQueryData<Comment[]>(['postComments', postId], [temp, ...prev]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (postId && ctx?.prev) {
        qc.setQueryData(['postComments', postId], ctx.prev);
      }
    },
    onSettled: () => {
      if (postId) qc.invalidateQueries({ queryKey: ['postComments', postId] });
    },
  });
}
