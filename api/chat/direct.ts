import api from '@/api/axiosInstance';

export type DirectChatResponse = {
    userId: number;
    message: string;
    timestamp: string;
};

export async function postDirectMessage(userId: number, message: string) {
    const { data } = await api.post<DirectChatResponse>(
        `/api/v1/home/chat/${userId}`,
        null,
        { params: { message } }
    );
    return data;
}