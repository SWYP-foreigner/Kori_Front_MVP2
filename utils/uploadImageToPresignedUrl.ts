import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

type UploadArgs = {
    putUrl: string;
    headers: Record<string, string>;
    fileUri: string;
};

export async function uploadImageToPresignedUrl({
    putUrl,
    headers,
    fileUri,
}: UploadArgs) {
    try {
        console.log('[upload:start] fileUri:', fileUri);

        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log('[upload:base64] length:', fileBase64.length);

        const blob = Buffer.from(fileBase64, 'base64');

        console.log('[upload:put] putUrl:', putUrl);
        console.log('[upload:put] headers:', headers);

        const res = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': headers['Content-Type'] || 'image/jpeg', // fallback
            },
            body: blob,
        });

        if (!res.ok) {
            console.log('[upload:error] status:', res.status);
            throw new Error(`Upload failed with status ${res.status}`);
        }

        console.log('[upload:success] Upload complete');

    } catch (err) {
        console.error('[upload:fail]', err);
        throw err;
    }
}
