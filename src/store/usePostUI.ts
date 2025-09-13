import { create, type StateCreator } from 'zustand';

type PostUIState = {
    bookmarked: Record<number, boolean>;
    setBookmarked: (postId: number, value: boolean) => void;
    toggleBookmarked: (postId: number) => void;
    hydrateFromServer: (postId: number, value?: boolean) => void;

    liked: Record<number, boolean>;
    likeCount: Record<number, number>;
    setLiked: (postId: number, liked: boolean) => void;
    toggleLiked: (postId: number) => void;
    setLikeCount: (postId: number, count: number) => void;
    bumpLike: (postId: number, delta: number) => void;
    hydrateLikeFromServer: (postId: number, liked?: boolean, count?: number) => void;
};

const creator: StateCreator<PostUIState> = (set, get) => ({
    bookmarked: {},
    setBookmarked: (postId: number, value: boolean) =>
        set(s => ({ bookmarked: { ...s.bookmarked, [postId]: value } })),
    toggleBookmarked: (postId: number) => {
        const cur = get().bookmarked[postId] ?? false;
        set(s => ({ bookmarked: { ...s.bookmarked, [postId]: !cur } }));
    },
    hydrateFromServer: (postId: number, value?: boolean) => {
        if (typeof value !== 'boolean') return;
        if (get().bookmarked[postId] === undefined) {
            set(s => ({ bookmarked: { ...s.bookmarked, [postId]: value } }));
        }
    },

    liked: {},
    likeCount: {},
    setLiked: (postId: number, liked: boolean) =>
        set(s => ({ liked: { ...s.liked, [postId]: liked } })),
    toggleLiked: (postId: number) => {
        const cur = get().liked[postId] ?? false;
        set(s => ({ liked: { ...s.liked, [postId]: !cur } }));
    },
    setLikeCount: (postId: number, count: number) =>
        set(s => ({ likeCount: { ...s.likeCount, [postId]: Math.max(0, count) } })),
    bumpLike: (postId: number, delta: number) => {
        const cur = get().likeCount[postId] ?? 0;
        set(s => ({ likeCount: { ...s.likeCount, [postId]: Math.max(0, cur + delta) } }));
    },
    hydrateLikeFromServer: (postId: number, liked?: boolean, count?: number) => {
        const next: Partial<PostUIState> = {};
        if (typeof liked === 'boolean' && get().liked[postId] === undefined) {
            (next as any).liked = { ...get().liked, [postId]: liked };
        }
        if (typeof count === 'number' && get().likeCount[postId] === undefined) {
            (next as any).likeCount = { ...get().likeCount, [postId]: count };
        }
        if (Object.keys(next).length) set(next as any);
    },
});

export const usePostUI = create<PostUIState>(creator);
