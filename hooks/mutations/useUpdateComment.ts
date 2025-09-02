import { updateComment } from '@/api/community/comments';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Vars = { commentId: number; content: string };

export function useUpdateComment() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }: Vars) =>
            updateComment(commentId, { content }),

        onSuccess: (_, { commentId }) => {
            qc.invalidateQueries({ queryKey: ['myComments'] });
            qc.invalidateQueries({ queryKey: ['postComments'] }); // 게시글 상세 댓글 리스트 키 사용 중이면
        },
    });
}
