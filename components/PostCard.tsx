import { keysToUrls, keyToUrl } from '@/utils/image';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Image, LayoutChangeEvent, ViewabilityConfig, ViewToken } from 'react-native';
import styled from 'styled-components/native';

const MAX_IMAGES = 5;

export type Post = {
  id: string;
  author: string;
  isAnonymous?: boolean;
  avatar?: any;
  category: string;
  createdAt: string;
  minutesAgo?: number;
  title?: string;
  body: string;
  images?: any[];
  likes: number;
  comments: number;
  bookmarked?: boolean;
  hotScore: number;
  viewCount?: number;
};

type Props = {
  data: Post;
  onPress?: () => void;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
};

const AV = require('@/assets/images/character1.png'); // 기본 아바타

export default function PostCard({ data, onPress, onToggleLike, onToggleBookmark }: Props) {
  const isAnon =
    Boolean((data as any).isAnonymous) ||
    String((data as any).authorName || (data as any).author || '').trim() === '익명';
  const showUnit = typeof data.minutesAgo === 'number';
  const timeLabel = showUnit
    ? data.minutesAgo! < 60
      ? `${data.minutesAgo} min ago`
      : `${Math.floor(data.minutesAgo! / 60)} hours ago`
    : data.createdAt.slice(5, 10).replace('-', '/');

  const viewCount = data.viewCount ?? 0;
  const ANON_LABEL = '익명';

  const avatarUrl = isAnon
    ? undefined
    : ((data as any).avatarUrl ??
      (data as any).userImageUrl ??
      (typeof data.avatar === 'string' ? data.avatar : undefined));

  const avatarSource = isAnon
    ? AV
    : typeof avatarUrl === 'string' && avatarUrl
      ? { uri: keyToUrl(avatarUrl) }
      : (data.avatar as any) || AV;

  const displayAuthor = isAnon
    ? ANON_LABEL
    : String((data as any).author ?? (data as any).authorName ?? (data as any).userName ?? '').trim() || '—';
  const rawImageKeysArr: string[] = Array.isArray(
    (data as any).contentImageUrls ?? (data as any).imageUrls ?? data.images,
  )
    ? ((data as any).contentImageUrls ?? (data as any).imageUrls ?? (data.images as any[]))
    : [];

  const totalImages = (data as any).imageCount != null ? Number((data as any).imageCount) : rawImageKeysArr.length;

  const imageUrls: string[] = useMemo(() => keysToUrls(rawImageKeysArr).slice(0, MAX_IMAGES), [rawImageKeysArr]);

  const [boxW, setBoxW] = useState(0);
  const onBoxLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w && w !== boxW) setBoxW(w);
  };

  const [imgHeights, setImgHeights] = useState<Record<string, number>>({});
  const ensureSize = (uri: string) => {
    if (!uri || !boxW || imgHeights[uri]) return;
    Image.getSize(
      uri,
      (w, h) => {
        if (!w || !h) return;
        const height = Math.max(1, Math.round((boxW * h) / w));
        setImgHeights((prev) => (prev[uri] ? prev : { ...prev, [uri]: height }));
      },
      () => {
        const fallback = Math.round((boxW * 9) / 16);
        setImgHeights((prev) => (prev[uri] ? prev : { ...prev, [uri]: fallback }));
      },
    );
  };

  const [imgIndex, setImgIndex] = useState(0);
  const viewConfig = useRef<ViewabilityConfig>({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems?.length) {
      const i = viewableItems[0].index ?? 0;
      setImgIndex(i);
    }
  }).current;

  const liked = Boolean((data as any).likedByMe ?? (data as any).isLiked ?? (data as any).liked ?? false);

  return (
    <Wrap onPress={onPress}>
      <HeaderRow>
        {/* 익명이면 회색 원만 보이도록 source 생략 */}
        <Avatar source={avatarSource} />

        <Meta>
          <Author>{displayAuthor}</Author>
          <SubRow>
            <TimeText>{timeLabel}</TimeText>
            <CatBadge>
              <CatText>{String(data.category)}</CatText>
            </CatBadge>
            <Dot>•</Dot>
            <AntDesign name="eyeo" size={12} color="#9aa0a6" />
            <SmallCount>{viewCount}</SmallCount>
          </SubRow>
        </Meta>

        <BookBtn onPress={onToggleBookmark} hitSlop={8}>
          <MaterialIcons
            name={data.bookmarked ? 'bookmark' : 'bookmark-border'}
            size={20}
            color={data.bookmarked ? '#30F59B' : '#8a8a8a'}
          />
        </BookBtn>
      </HeaderRow>

      {imageUrls.length > 0 ? (
        <CarouselBox onLayout={onBoxLayout}>
          {boxW > 0 ? (
            <FlatList
              data={imageUrls}
              keyExtractor={(u, i) => `${u}#${i}`}
              renderItem={({ item }) => {
                ensureSize(item);
                const h = imgHeights[item] ?? Math.round((boxW * 9) / 16);
                return (
                  <Slide style={{ width: boxW }}>
                    <Image
                      source={{ uri: item }}
                      style={{ width: '100%', height: h, borderRadius: 12 }}
                      resizeMode="contain"
                      onError={(e) => console.log('[PostCard:image:error]', item, e.nativeEvent?.error)}
                    />
                  </Slide>
                );
              }}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={boxW}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewConfig}
            />
          ) : (
            <Slide>
              <Image
                source={{ uri: imageUrls[0] }}
                style={{ width: '100%', height: 180, borderRadius: 12 }}
                resizeMode="contain"
              />
            </Slide>
          )}
        </CarouselBox>
      ) : null}

      {!!data.title && <Title numberOfLines={1}>{data.title}</Title>}
      <Body numberOfLines={3}>{data.body}</Body>

      <FooterRow>
        <IconBtn onPress={onToggleLike} hitSlop={8}>
          <AntDesign name="like2" size={16} color={liked ? '#02F59B' : '#CCCFD0'} />
          <Count>{data.likes}</Count>
        </IconBtn>

        <IconBtn hitSlop={8}>
          <AntDesign name="message1" size={16} color="#cfd4da" />
          <Count>{data.comments}</Count>
        </IconBtn>

        <More>···</More>
      </FooterRow>
    </Wrap>
  );
}

const Wrap = styled.Pressable`
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
  gap: 8px;
`;
const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
`;
const Avatar = styled.Image`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background: #2a2b2c;
`;
const Meta = styled.View`
  margin-left: 10px;
  flex: 1;
`;
const Author = styled.Text`
  color: #fff;
  font-size: 13px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const SubRow = styled.View`
  margin-top: 2px;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;
const TimeText = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
`;
const CatBadge = styled.View`
  padding: 3px 8px;
  border-radius: 4px;
  background: #184b3f;
`;
const CatText = styled.Text`
  color: #e9e9e9;
  font-size: 11px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const Dot = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
`;
const SmallCount = styled.Text`
  color: #cfd4da;
  font-size: 11px;
  margin-left: 4px;
`;
const BookBtn = styled.Pressable`
  padding: 6px;
`;

const CarouselBox = styled.View`
  margin-top: 8px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;
const Slide = styled.View``;

const Counter = styled.Text`
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 15px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const Body = styled.Text`
  color: #d9dcdf;
  font-size: 13px;
  line-height: 18px;
`;
const FooterRow = styled.View`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
`;
const IconBtn = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`;
const Count = styled.Text`
  color: #cfd4da;
  margin-left: 6px;
  font-size: 12px;
`;
const More = styled.Text`
  margin-left: auto;
  color: #9aa0a6;
  font-size: 18px;
  padding: 4px 6px;
`;
