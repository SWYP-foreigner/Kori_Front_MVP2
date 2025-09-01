import api from '@/api/axiosInstance';

export type BoardId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SortParam = 'LATEST' | 'POPULAR';

export function categoryToBoardId(cat: string): BoardId {
    switch (cat) {
        case 'All': return 1;
        case 'News': return 2;
        case 'Tip': return 3;
        case 'Q&A': return 4;
        case 'Event': return 5;
        case 'Free talk': return 6;
        case 'Activity': return 7;
        default: return 1;
    }
}

export type PostListItem = {
    postId: number;
    title?: string;
    contentPreview: string;
    authorName: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    score?: number;
};

export type PostsCursorPage = {
    items: PostListItem[];
    hasNext: boolean;
    nextCursor?: string | null;
};

type PostsListServerResp = { success: boolean; data: PostsCursorPage };

export async function getPostsPage(
    boardId: BoardId,
    params: { sort?: SortParam; size?: number; cursor?: string }
): Promise<PostsCursorPage> {
    const { sort = 'LATEST', size = 20, cursor } = params ?? {};
    const { data } = await api.get<PostsListServerResp>(`/api/v1/boards/${boardId}/posts`, {
        params: { sort, size, cursor },
    });
    return data.data;
}

export type PostDetail = {
    postId: number;
    content: string;
    userName: string | null;
    boardCategory: string;
    createdTime: number | string | null;
    link?: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    userImageUrl?: string | null;
    contentImageUrls?: string[];
    imageCount?: number;
};

type PostDetailServerResp = { message: string; data: PostDetail; timestamp?: string };

export async function getPostDetail(postId: number): Promise<PostDetail & { timestamp?: string }> {
    const { data } = await api.get<PostDetailServerResp | PostDetail>(`/api/v1/posts/${postId}`);
    if ((data as any).data) {
        return { ...(data as any).data, timestamp: (data as any).timestamp };
    }
    return data as PostDetail;
}

export type CreatePostBody = {
    content: string;
    isAnonymous: boolean;
    imageUrls?: string[];
};

export async function createPost(boardId: number, body: CreatePostBody) {
    const { data } = await api.post(`/api/v1/boards/${boardId}/posts`, body);
    return data as string;
}
