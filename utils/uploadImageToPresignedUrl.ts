import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

type UploadArgs = {
  putUrl: string;
  headers: Record<string, string>;
  fileUri: string;
};

export async function uploadImageToPresignedUrl({ putUrl, headers, fileUri }: UploadArgs) {
  try {
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const blob = Buffer.from(fileBase64, 'base64');

    const res = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': headers['Content-Type'] || 'image/jpeg', // fallback
      },
      body: blob,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
  } catch (err) {
    console.error('[upload:fail]', err);
    throw err;
  }
}
