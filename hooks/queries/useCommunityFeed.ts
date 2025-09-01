import { BoardId, getPostsPage, SortParam } from '@/api/community/posts';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCommunityFeed(boardId: BoardId, sortKey: 'new' | 'hot') {
    const sort: SortParam = sortKey === 'hot' ? 'POPULAR' : 'LATEST';

    return useInfiniteQuery({
        queryKey: ['communityFeed', boardId, sort],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
            getPostsPage(boardId, { sort, size: 20, cursor: pageParam }),
        getNextPageParam: (last) => (last.hasNext ? last.nextCursor ?? undefined : undefined),
        staleTime: 60_000,
    });
}
