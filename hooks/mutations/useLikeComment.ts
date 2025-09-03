import { addCommentLike, removeCommentLike } from '@/api/community/commentLikes';
import type { SortKey } from '@/components/SortTabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type Vars = { commentId: number; liked: boolean };

function getLiked(c: any): boolean {
    return Boolean(c?.likedByMe ?? c?.isLiked ?? false);
}
function getLikeCount(c: any): number {
    return Number(c?.likes ?? c?.likeCount ?? 0);
}
function setLiked(c: any, v: boolean) {
    return { ...c, likedByMe: v, isLiked: v };
}
function setLikeCount(c: any, n: number) {
    return { ...c, likes: n, likeCount: n };
}

export function useLikeComment(postId?: number, sort?: SortKey) {
    const qc = useQueryClient();
    const queryKey =
        Number.isFinite(postId) ? (['postComments', postId as number, sort] as const) : undefined;

    return useMutation({
        mutationFn: async ({ commentId, liked }: Vars) => {
            try {
                if (liked) {
                    await removeCommentLike(commentId);
                } else {
                    await addCommentLike(commentId);
                }
            } catch (e) {
                if (axios.isAxiosError(e) && e.response) {
                    const s = e.response.status;
                    if (!liked && s === 409) {
                        await removeCommentLike(commentId);
                        return;
                    }
                    if (liked && (s === 404 || s === 409)) {
                        await addCommentLike(commentId);
                        return;
                    }
                }
                throw e;
            }
        },

        onMutate: async ({ commentId, liked }) => {
            if (!queryKey) return;
            await qc.cancelQueries({ queryKey });
            const prevData = qc.getQueryData(queryKey);

            const applySmartOptimistic = (data: unknown): unknown => {
                const patch = (c: any) => {
                    const id = Number(c?.id ?? c?.commentId);
                    if (id !== Number(commentId)) return c;

                    const prevLiked = getLiked(c);
                    const prevCount = getLikeCount(c);

                    if (liked) {
                        const nextLiked = false;
                        const nextCount = Math.max(0, prevCount - 1);
                        return setLikeCount(setLiked(c, nextLiked), nextCount);
                    } else {
                        const nextLiked = true;
                        const nextCount = prevCount;
                        return setLikeCount(setLiked(c, nextLiked), nextCount);
                    }
                };

                if (Array.isArray(data)) return (data as any[]).map(patch);

                if (data && typeof data === 'object' && Array.isArray((data as any).pages)) {
                    const copy =
                        typeof structuredClone === 'function'
                            ? structuredClone(data)
                            : JSON.parse(JSON.stringify(data));
                    copy.pages = copy.pages.map((p: any) => {
                        if (Array.isArray(p)) return p.map(patch);
                        if (Array.isArray(p?.items)) return { ...p, items: p.items.map(patch) };
                        return p;
                    });
                    return copy;
                }

                return data;
            };

            qc.setQueryData(queryKey, applySmartOptimistic);
            return { prevData };
        },

        onError: (_err, _vars, ctx) => {
            if (!queryKey) return;
            if (ctx?.prevData !== undefined) qc.setQueryData(queryKey, ctx.prevData);
        },

        onSuccess: () => {
            if (!queryKey) return;
            qc.invalidateQueries({ queryKey });
        },
    });
}
