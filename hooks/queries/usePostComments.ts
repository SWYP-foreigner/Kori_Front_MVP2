import { getPostComments, RawComment } from '@/api/community/comments';
import { Comment } from '@/components/CommentItem';
import { useQuery } from '@tanstack/react-query';

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
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
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(d)
      .replace(/-/g, '/');
  } catch {
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
  }
}

function isAnonRow(r: RawComment): boolean {
  const yn =
    (typeof (r as any).anonymousYn === 'string' && (r as any).anonymousYn.toUpperCase() === 'Y') ||
    (r as any).anonymous ||
    (r as any).isAnonymous ||
    (r as any).isAnonymousWriter ||
    (r as any).writerAnonymous;

  const label = (r as any).authorName ?? (r as any).userName ?? (r as any).nickname ?? (r as any).writerName ?? '';
  const lab = String(label).trim().toLowerCase();

  return Boolean(yn || lab === '익명' || lab === 'anonymous' || !String(label).trim());
}

function mapRow(r: RawComment): Comment {
  const anon = isAnonRow(r);

  const authorLabel =
    (r as any).authorName ?? (r as any).userName ?? (r as any).nickname ?? (r as any).writerName ?? '익명';

  const avatarUrl = (r as any).userImage ?? (r as any).userImageUrl ?? (r as any).avatarUrl;

  return {
    id: String((r as any).commentId ?? (r as any).id),
    author: authorLabel,
    avatar: avatarUrl ? { uri: avatarUrl } : require('@/assets/images/character1.png'),
    createdAt: toYmd((r as any).createdAt),
    body: String((r as any).content ?? (r as any).comment ?? ''),
    likes: Number((r as any).likeCount ?? (r as any).likes ?? 0),
    likedByMe: Boolean((r as any).likedByMe ?? (r as any).isLiked ?? (r as any).isLike ?? false),
    isChild: Boolean((r as any).parentId ?? (r as any).isChild),
    hotScore: 0,
    anonymous: anon,
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
