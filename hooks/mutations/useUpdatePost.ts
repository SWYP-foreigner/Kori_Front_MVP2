import { updatePost, type UpdatePostBody } from '@/api/community/my';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type Vars = { postId: number; body: UpdatePostBody };

export function useUpdatePost() {
  const qc = useQueryClient();

  return useMutation<boolean, AxiosError, Vars>({
    mutationFn: ({ postId, body }) => updatePost(postId, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['my-posts'] });
      qc.invalidateQueries({ queryKey: ['post', vars.postId] });
    },
  });
}
