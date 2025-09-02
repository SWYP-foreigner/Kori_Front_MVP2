import {
    getMyComments,
    type MyCommentItem,
    type MyCommentsPage
} from '@/api/community/my';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useMyComments(size = 20) {
    const query = useInfiniteQuery<MyCommentsPage, Error>({
        queryKey: ['myComments', size],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
            getMyComments({ size, cursor: pageParam ?? undefined }),
        getNextPageParam: (lastPage) =>
            lastPage.hasNext ? lastPage.nextCursor ?? null : null,
        select: (data) => {
            const flat: MyCommentItem[] = [];
            for (const p of data.pages) flat.push(...(p.items ?? []));
            return { ...data, items: flat } as typeof data & { items: MyCommentItem[] };
        },
    });

    return {
        ...query,
        items: (query.data as any)?.items as MyCommentItem[] | undefined,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: Boolean(query.hasNextPage),
        isFetchingNextPage: query.isFetchingNextPage,
    };
}
