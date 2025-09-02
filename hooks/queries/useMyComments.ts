import {
    getMyComments,
    type MyCommentItem,
    type MyCommentsPage
} from '@/api/community/my';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * 내가 작성한 댓글 목록 (무한스크롤)
 * posts 훅과 동일한 사용성: items, fetchNextPage, hasNextPage 등 반환
 */
export function useMyComments(size = 20) {
    const query = useInfiniteQuery<MyCommentsPage, Error>({
        queryKey: ['myComments', size],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
            getMyComments({ size, cursor: pageParam ?? undefined }),
        getNextPageParam: (lastPage) =>
            lastPage.hasNext ? lastPage.nextCursor ?? null : null,
        select: (data) => {
            // useMyPosts와 동일하게 평탄화된 items 제공
            const flat: MyCommentItem[] = [];
            for (const p of data.pages) flat.push(...(p.items ?? []));
            // pages/pageParams는 그대로 유지 (필요 시 사용)
            return { ...data, items: flat } as typeof data & { items: MyCommentItem[] };
        },
    });

    return {
        // tanstack 원본 값들
        ...query,
        // 평탄화된 items 바로 사용
        items: (query.data as any)?.items as MyCommentItem[] | undefined,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: Boolean(query.hasNextPage),
        isFetchingNextPage: query.isFetchingNextPage,
    };
}
