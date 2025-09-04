const BASE = 'https://kr.object.ncloudstorage.com/foreigner-bucket';

export function keyToUrl(keyOrUrl: string) {
    if (!keyOrUrl) return '';
    if (/^https?:\/\//i.test(keyOrUrl)) {
        try {
            const u = new URL(keyOrUrl);
            u.pathname = u.pathname
                .split('/')
                .map(seg => encodeURIComponent(decodeURIComponent(seg)))
                .join('/');
            return u.toString();
        } catch {
            return keyOrUrl;
        }
    }
    const clean = String(keyOrUrl).replace(/^\/+/, '');
    const encodedPath = clean
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
    return `${BASE}/${encodedPath}`;
}

export function keysToUrls(keys: (string | undefined | null)[]) {
    return (keys || [])
        .filter((k): k is string => typeof k === 'string' && !!k)
        .map(k => keyToUrl(k));
}
