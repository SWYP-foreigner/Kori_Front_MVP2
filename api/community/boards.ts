import api from '@/api/axiosInstance';

export type BoardWriteOptions = {
  boardId: number;
  anonymousWritable: boolean;
};

export async function getBoardWriteOptions(boardId: number): Promise<BoardWriteOptions> {
  if (!boardId && boardId !== 0) throw new Error('boardId is required');

  const { data } = await api.get<{ success?: boolean; data?: BoardWriteOptions }>(
    `/api/v1/boards/${boardId}/write-options`,
  );

  const payload = (data as any)?.data ?? (data as any);
  return {
    boardId: Number(payload.boardId),
    anonymousWritable: Boolean(payload.anonymousWritable),
  };
}
