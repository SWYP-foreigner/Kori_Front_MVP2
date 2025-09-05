import api from '@/api/axiosInstance';
import { Asset } from 'expo-asset';

type PresignResp = {
    uploadUrl: string;
    key: string;
    headers?: Record<string, string>;
};

async function getPresignedForProfile(params: {
    filename: string;
    contentType: string;
}): Promise<PresignResp> {
    const { data } = await api.post<PresignResp>(
        '/api/v1/member/profile/image/presign',
        { filename: params.filename, contentType: params.contentType }
    );
    return data;
}

export async function uploadLocalImageAndGetKey(uri: string): Promise<string> {
    const name = (uri.split('/').pop() || `avatar_${Date.now()}.jpg`).toLowerCase();
    const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const presign = await getPresignedForProfile({ filename: name, contentType: type });
    console.log('[presign]', presign);
    const { uploadUrl, key, headers } = presign;
    if (!uploadUrl || !key) throw new Error('Failed to get presigned URL.');

    const fileRes = await fetch(uri);
    const blob = await fileRes.blob();

    const finalHeaders: Record<string, string> = {};
    if (headers && Object.keys(headers).length > 0) Object.assign(finalHeaders, headers);

    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: finalHeaders,
        body: blob,
    });

    const putText = await putRes.text().catch(() => '');
    console.log('[presign:put]', putRes.status, putRes.statusText, putText?.slice(0, 400));

    if (!putRes.ok) {
        throw new Error(`PUT ${putRes.status} ${putRes.statusText}\n${putText}`);
    }

    return key;
}

export async function uploadBundledAvatarAndGetKey(moduleId: number): Promise<string> {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const localUri = asset.localUri || asset.uri;
    if (!localUri) throw new Error('Failed to resolve bundled asset uri');
    return uploadLocalImageAndGetKey(localUri);
}
