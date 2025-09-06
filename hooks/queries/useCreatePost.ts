import { createPost, CreatePostBody } from '@/api/community/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export default function useCreatePost(boardId?: number) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreatePostBody) => {
            if (!boardId) throw new Error('boardId is required');
            return createPost(boardId, body);
        },
        onSuccess: () => {
            if (!boardId) return;
            qc.invalidateQueries({ queryKey: ['community-list', boardId] });
            qc.invalidateQueries({ queryKey: ['board', boardId, 'posts'] });
            qc.invalidateQueries({ queryKey: ['community-feed'] });
        },
    });
}
