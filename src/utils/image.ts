// 키 → 퍼블릭 URL 변환 (URL이 이미 들어오면 그대로 반환)
export const keyToUrl = (k?: string | null) => {
    if (!k) return undefined;
    if (/^https?:\/\//i.test(k)) return k;
    const base =
        process.env.EXPO_PUBLIC_NCP_PUBLIC_BASE_URL ||
        process.env.EXPO_PUBLIC_IMAGE_BASE_URL ||
        '';
    return base ? `${base.replace(/\/+$/, '')}/${String(k).replace(/^\/+/, '')}` : undefined;
};
