import api from '@/api/axiosInstance';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';

export type SearchPostHit = {
    item: {
        postId: number;
        contentPreview?: string;
        content?: string;
        userName?: string;
        boardCategory?: string;
        createdAt?: string;
        likeCount?: number;
        commentCount?: number;
        viewCount?: number;
        isLiked?: boolean;

        userImageUrl?: string;
        contentImageUrl?: string;
        imageUrl?: string;
        contentImageUrls?: string[];
        imageUrls?: string[];
        score?: number;
    };
    highlight?: string;
    score?: number | null;
};

export async function fetchSearchPosts(
    q: string,
    boardId: number
): Promise<SearchPostHit[]> {
    const { data } = await api.get<SearchPostHit[]>(
        `/api/v1/search/${boardId}/posts`,
        { params: { q } }
    );
    return Array.isArray(data) ? data : [];
}

export function getBoardIdByCategory(
    cat: keyof typeof CATEGORY_TO_BOARD_ID | 'All'
): number {
    return CATEGORY_TO_BOARD_ID[cat as keyof typeof CATEGORY_TO_BOARD_ID] ??
        CATEGORY_TO_BOARD_ID.All;
}
