import { deleteComment } from '@/api/community/comments';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['myComments'] });
    },
  });
}
