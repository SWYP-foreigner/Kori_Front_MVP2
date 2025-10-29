import { getMyComments, type MyCommentItem, type MyCommentsPage } from '@/api/community/my';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

export function useMyComments(size = 20) {
  const query = useInfiniteQuery<
    MyCommentsPage,
    Error,
    InfiniteData<MyCommentsPage>,
    [string, number],
    string | undefined
  >({
    queryKey: ['myComments', size],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => getMyComments({ size, cursor: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });

  const items: MyCommentItem[] = (query.data?.pages ?? []).flatMap((p: MyCommentsPage) => p.items ?? []);

  return {
    ...query,
    items,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
