import { getPostDetail } from '@/api/community/posts';
import { useQuery } from '@tanstack/react-query';

export function usePostDetail(postId?: number) {
    return useQuery({
        queryKey: ['post-detail', postId],
        queryFn: () => getPostDetail(postId!),
        enabled: !!postId,
    });
}
