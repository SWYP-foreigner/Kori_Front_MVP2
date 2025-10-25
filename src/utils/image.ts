import { Image as RNImage } from 'react-native';

// 키 → 퍼블릭 URL 변환 (URL이 이미 들어오면 그대로 반환)
export const keyToUrl = (k?: string | null) => {
  if (!k) return undefined;
  if (/^https?:\/\//i.test(k)) return k;
  const base = process.env.EXPO_PUBLIC_NCP_PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_IMAGE_BASE_URL || '';
  return base ? `${base.replace(/\/+$/, '')}/${String(k).replace(/^\/+/, '')}` : undefined;
};

//커뮤니티 [id]에서 사용
export async function loadAspectRatios(urls: string[], fallback = 16 / 9): Promise<number[]> {
  const jobs = urls.map(
    (uri) =>
      new Promise<number>((resolve) => {
        RNImage.getSize(
          uri,
          (w, h) => resolve(w > 0 && h > 0 ? w / h : fallback),
          () => resolve(fallback),
        );
      }),
  );
  return Promise.all(jobs);
}
