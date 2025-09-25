import type { Category } from '@/components/CategoryChips';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';

export const LOCAL_ALLOW_ANON = new Set<Category>(['Free talk', 'Q&A']);

const BOARD_ID_TO_CATEGORY: Record<number, Category> = Object.fromEntries(
    Object.entries(CATEGORY_TO_BOARD_ID).map(([cat, id]) => [Number(id), cat as Category]),
) as Record<number, Category>;

const TEXT_MAP: Record<string, Category> = {
    'all': 'All',
    'news': 'News',
    'tip': 'Tip',
    'q&a': 'Q&A',
    'qna': 'Q&A',
    'qa': 'Q&A',
    'event': 'Event',
    'free talk': 'Free talk',
    'activity': 'Activity',
};

function norm(v?: any) {
    if (typeof v !== 'string') return '';
    return v
        .normalize('NFKC')
        .trim()
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*&\s*/g, '&');
}

export function resolvePostCategory(post?: any): Category | undefined {
    if (!post) return;

    const primaryName = norm(post?.boardCategory);
    if (primaryName && TEXT_MAP[primaryName]) return TEXT_MAP[primaryName];

    const idCands = [
        post?.boardId, post?.categoryId, post?.board?.id, post?.category?.id,
        post?.postCategoryId, post?.postTypeId,
    ].map(Number).filter(Number.isFinite) as number[];

    for (const id of idCands) {
        const cat = BOARD_ID_TO_CATEGORY[id];
        if (cat) return cat;
    }

    const nameCands = [
        post?.categoryName, post?.boardName, post?.board?.name, post?.category?.name,
        post?.category, post?.postCategory, post?.postType, post?.type, post?.kind,
    ].filter(Boolean);

    for (const raw of nameCands) {
        const key = norm(raw);
        if (TEXT_MAP[key]) return TEXT_MAP[key];
        if (key.includes('free')) return 'Free talk';
        if (key.includes('q&a') || key.includes('qna') || key === 'qa') return 'Q&A';
        if (key.includes('event')) return 'Event';
        if (key.includes('news')) return 'News';
        if (key.includes('tip')) return 'Tip';
        if (key.includes('activity')) return 'Activity';
    }

    return undefined;
}
