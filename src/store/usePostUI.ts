import { create } from 'zustand';

type PostUIState = {
    bookmarked: Record<number, boolean>;
    setBookmarked: (postId: number, value: boolean) => void;
    toggleBookmarked: (postId: number) => void;
    hydrateFromServer: (postId: number, value?: boolean) => void;
};

export const usePostUI = create<PostUIState>((set, get) => ({
    bookmarked: {},
    setBookmarked: (postId, value) =>
        set((s) => ({ bookmarked: { ...s.bookmarked, [postId]: value } })),
    toggleBookmarked: (postId) => {
        const cur = get().bookmarked[postId] ?? false;
        set((s) => ({ bookmarked: { ...s.bookmarked, [postId]: !cur } }));
    },
    hydrateFromServer: (postId, value) => {
        if (typeof value !== 'boolean') return;
        const cur = get().bookmarked[postId];
        if (cur === undefined) {
            set((s) => ({ bookmarked: { ...s.bookmarked, [postId]: value } }));
        }
    },
}));
