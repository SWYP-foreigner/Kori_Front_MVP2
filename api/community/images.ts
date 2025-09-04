import axiosInstance from '@/api/axiosInstance';

export type ImageType = 'POST' | 'COMMENT';

export type PresignRequest = {
    imageType: ImageType;
    uploadSessionId: string;
    files: {
        filename: string;
        contentType: string;
    }[];
};

export type PresignResponse = {
    message: string;
    data: {
        key: string;
        putUrl: string;
        method: string;
        headers: Record<string, string>;
    }[];
    timestamp: string;
};

export const getPresignedUrls = async (body: PresignRequest) => {
    const res = await axiosInstance.post<PresignResponse>('/api/v1/images/presign', body);
    return res.data.data;
};
