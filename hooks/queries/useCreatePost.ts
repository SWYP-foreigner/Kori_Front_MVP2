import { createPost, CreatePostBody } from '@/api/community/posts';
import { useMutation } from '@tanstack/react-query';

export default function useCreatePost(boardId: number) {
    return useMutation({
        mutationFn: (body: CreatePostBody) => createPost(boardId, body),
    });
}
