import { getMyPosts, MyPostsPage } from '@/api/community/my';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMyPosts(size = 20) {
    const query = useInfiniteQuery({
        queryKey: ['my-posts', { size }],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
            getMyPosts({ size, cursor: pageParam }),
        getNextPageParam: (lastPage: MyPostsPage) =>
            lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined,
    });

    const items = query.data?.pages.flatMap((p) => p.items) ?? [];

    return { ...query, items };
}
