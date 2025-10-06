import * as FileSystem from 'expo-file-system';

export type PresignedInfo = {
  putUrl: string;
  key: string;
  headers?: Record<string, string>;
};

export async function uploadImageToPresignedUrl(p: PresignedInfo & { fileUri: string }) {
  const headers = {
    ...(p.headers ?? {}),
    'x-amz-acl': p.headers?.['x-amz-acl'] ?? 'public-read',
    'Content-Type': p.headers?.['Content-Type'] ?? 'image/jpeg',
  };

  const res = await FileSystem.uploadAsync(p.putUrl, p.fileUri, {
    httpMethod: 'PUT',
    headers,
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (res.status !== 200) {
    throw new Error(`[NCP PUT] failed: ${res.status} ${res.body ?? ''}`);
  }
  return p.key;
}
