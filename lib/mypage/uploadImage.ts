import api from '@/api/axiosInstance';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

type UploadResp = { imageKey?: string; key?: string; url?: string };


const TARGET_BYTES = 800 * 1024;
const MAX_WIDTH = 720;
const MIN_WIDTH = 320;
const MIN_QUALITY = 0.55;

async function getFileSize(uri: string): Promise<number> {
    const res = await fetch(uri);
    const blob = await res.blob();
    return blob.size;
}

async function compressUntilBelow(uri: string): Promise<string> {
    let currentUri = uri;
    let width = MAX_WIDTH;
    let quality = 0.82;

    let manipulated = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    currentUri = manipulated.uri;

    for (let i = 0; i < 4; i++) {
        const size = await getFileSize(currentUri);
        if (size <= TARGET_BYTES) return currentUri;

        width = Math.max(Math.floor(width * 0.8), MIN_WIDTH);
        quality = Math.max(quality - 0.1, MIN_QUALITY);

        manipulated = await ImageManipulator.manipulateAsync(
            currentUri,
            [{ resize: { width } }],
            { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        currentUri = manipulated.uri;
    }
    return currentUri;
}

export async function uploadImageAndGetKey(uri: string): Promise<string> {
    const compactUri = await compressUntilBelow(uri);

    const name = compactUri.split('/').pop() || `avatar_${Date.now()}.jpg`;
    const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const form = new FormData();
    form.append('file', {
        uri: Platform.OS === 'ios' ? compactUri : compactUri,
        name,
        type,
    } as any);

    const { data } = await api.patch<UploadResp>('/api/v1/member/profile/setup', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const key = data?.imageKey || data?.key;
    if (!key) throw new Error('Upload succeeded but no imageKey returned');
    return key;
}

export async function uploadBundledAvatarAndGetKey(moduleId: number): Promise<string> {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const localUri = asset.localUri || asset.uri;
    if (!localUri) throw new Error('Failed to resolve bundled asset uri');
    return uploadImageAndGetKey(localUri);
}