import { getPostComments, RawComment } from '@/api/community/comments';
import { Comment } from '@/components/CommentItem';
import { useQuery } from '@tanstack/react-query';

function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function parseDateFlexible(v?: unknown): Date | null {
    if (v == null) return null;
    let s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return new Date(parseFloat(s) * 1000);
    if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}
function toYmd(raw?: unknown) {
    const d = parseDateFlexible(raw) ?? new Date();
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
            .format(d).replace(/-/g, '/');
    } catch {
        return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
    }
}

function mapRow(r: RawComment): Comment {
    return {
        id: String(r.commentId),
        author: r.userName ?? 'Unknown',
        avatar: r.userImageUrl ? { uri: r.userImageUrl } : require('@/assets/images/character1.png'),
        createdAt: toYmd(r.createdAt),
        body: r.content,
        likes: Number(r.likeCount ?? 0),
        isChild: Boolean(r.parentId),
        hotScore: 0,
        anonymous: false,
    };
}

export function usePostComments(postId?: number, sort: 'new' | 'hot' = 'new') {
    return useQuery({
        queryKey: ['postComments', postId, sort],
        enabled: Number.isFinite(postId),
        queryFn: async () => {
            if (!postId) return [] as Comment[];
            const res = await getPostComments(postId, sort);
            return (res.data.items ?? []).map(mapRow);
        },
    });
}
