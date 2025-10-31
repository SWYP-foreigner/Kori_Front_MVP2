import React, { forwardRef, memo } from 'react';
import {
  ImageSourcePropType,
  ImageStyle,
  Image as RNImage,
  ImageProps as RNImageProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

export type ProfileImageProps = RNImageProps & {
  /** 투명 SVG 대비용 배경색 */
  bg?: string;
};

function resolveSvg(source?: ImageSourcePropType): { uri?: string; isSvg: boolean } {
  if (!source) return { isSvg: false };

  if (typeof source === 'number') {
    const res = RNImage.resolveAssetSource(source);
    const uri = res?.uri;
    return { uri, isSvg: !!uri && /\.svg(\?|#|$)/i.test(uri) };
  }

  if (typeof source === 'object' && 'uri' in source && typeof (source as any).uri === 'string') {
    const uri = (source as any).uri as string;
    return { uri, isSvg: /\.svg(\?|#|$)/i.test(uri) };
  }

  return { isSvg: false };
}

/** 디폴트 아바타 SVG URL인지 판별 */
function isDefaultAvatarSvg(uri?: string) {
  if (!uri) return false;
  // 예: https://cdn.ko-ri.cloud/default/character_01.svg
  return /\/default\/character_\d+\.svg(\?|#|$)/i.test(uri);
}

/** 디폴트 아바타 SVG → 로컬 PNG 매핑 */
function mapDefaultAvatarToLocal(uri?: string) {
  if (!uri) return null;
  const m = uri.match(/\/default\/character_(\d+)\.svg/i);
  if (!m) return null;

  const num = m[1]; // "01", "03" 등
  // ✅ 프로젝트에 존재하는 PNG로 매핑하세요.
  //   필요에 따라 케이스 추가/수정
  const MAP: Record<string, any> = {
    '01': require('@/assets/images/character1.png'),
    '02': require('@/assets/images/character2.png'),
    '03': require('@/assets/images/character3.png'),
  };

  return MAP[num] ?? null;
}

/** ProfileImage
 * - 디폴트 아바타 SVG: 로컬 PNG로 대체 (네트워크 실패/404 무관, 깔끔)
 * - 그 외 SVG: SvgUri + preserveAspectRatio="xMinYMin slice"
 * - 비-SVG: RN <Image>
 */
const ProfileImage = forwardRef<RNImage, ProfileImageProps>(function ProfileImage(
  { source, style, resizeMode = 'cover', bg = 'transparent', ...rest },
  ref
) {
  const { uri, isSvg } = resolveSvg(source);

  // 1) 디폴트 아바타 SVG면 → 로컬 PNG로 대체
  if (isSvg && uri && isDefaultAvatarSvg(uri)) {
    const localFallback = mapDefaultAvatarToLocal(uri);
    if (localFallback) {
      return <RNImage ref={ref} source={localFallback} style={style} resizeMode={resizeMode} {...rest} />;
    }
    // 매핑이 없으면 그냥 SvgUri로 처리 (안전망)
  }

  // 2) 일반 SVG면 SvgUri 사용
  if (isSvg && uri) {
    const containerStyle = style as StyleProp<ViewStyle | ImageStyle>;
    return (
      <View style={[{ overflow: 'hidden', backgroundColor: bg }, containerStyle]}>
        <SvgUri uri={uri} width="100%" height="100%" preserveAspectRatio="xMinYMin slice" {...rest as any} />
      </View>
    );
  }

  // 3) 나머지는 RN Image
  return <RNImage ref={ref} source={source} style={style} resizeMode={resizeMode} {...rest} />;
});

export default memo(ProfileImage);
