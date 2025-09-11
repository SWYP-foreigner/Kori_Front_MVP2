import api from '@/api/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export type CommentWriteOptions = {
    isAnonymousAvailable?: boolean;
    isAnonymousAvaliable?: boolean;
};

async function getCommentWriteOptions(postId: number): Promise<CommentWriteOptions> {
    const { data } = await api.get(`/api/v1/posts/${postId}/write-options`);
    const payload = (data?.data ?? data) as any;
    return payload ?? {};
}

export function useCommentWriteOptions(postId?: number) {
    return useQuery({
        queryKey: ['post', postId, 'comment-write-options'],
        queryFn: () => getCommentWriteOptions(postId as number),
        enabled: typeof postId === 'number' && Number.isFinite(postId),
        staleTime: 5 * 60 * 1000,
    });
}
