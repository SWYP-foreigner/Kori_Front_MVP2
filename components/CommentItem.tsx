import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

const DEFAULT_AV = require('@/assets/images/character1.png');

export type Comment = {
  id: string | number;
  author: string;
  avatar: ImageSourcePropType;
  createdAt: string;          // ISO | 'YYYY-MM-DD...' | epoch string 등
  body: string;
  likes: number;
  likedByMe?: boolean;
  isChild?: boolean;
  hotScore: number;
  anonymous?: boolean;        // ★ 서버에서 내려주는 익명 여부
};

type Props = {
  data: Comment;
  onPressLike?: () => void;
  isFirst?: boolean;
};

export default function CommentItem({ data, onPressLike, isFirst }: Props) {
  const isChild = !!data.isChild;

  // ★ 익명 처리: 이름/아바타 대체
  const authorLabel = data.anonymous ? 'Anonymous' : data.author;
  const avatarSrc = data.anonymous ? DEFAULT_AV : data.avatar;

  // ★ 날짜 안전 포매팅
  const dateLabel = useMemo(() => {
    const raw = String(data.createdAt ?? '').trim();
    if (!raw) return '';
    // "YYYY-MM-DD..." → "MM/DD"
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(5, 10).replace('-', '/');
    // ISO "YYYY-MM-DDTHH:mm..." → "MM/DD"
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(5, 10).replace('-', '/');
    // epoch seconds/millis
    const n = Number(raw);
    if (Number.isFinite(n)) {
      const d = new Date(n > 1e12 ? n : n * 1000);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${mm}/${dd}`;
      }
    }
    // 기타 문자열은 그대로 표시(잘린 경우 방지)
    return raw;
  }, [data.createdAt]);

  return (
    <Wrap $child={isChild} $first={isFirst}>
      <Row>
        {isChild && (
          <ReplyIcon>
            <Feather name="corner-down-right" size={18} color="#9aa0a6" />
          </ReplyIcon>
        )}
        <Avatar source={avatarSrc} />
        <Meta>
          <Author>{authorLabel}</Author>
          <Sub>{dateLabel}</Sub>
        </Meta>
        <More>···</More>
      </Row>

      <Body>{data.body}</Body>

      <Footer>
        <Act
          onPress={onPressLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Like this comment"
        >
          <AntDesign
            name={data.likedByMe ? 'like1' : 'like2'}
            size={14}
            color={data.likedByMe ? '#30F59B' : '#cfd4da'}
          />
          <Count $active={!!data.likedByMe}>{data.likes}</Count>
        </Act>

        <Act disabled>
          <AntDesign name="message1" size={14} color="#cfd4da" />
          <Count>999</Count>
        </Act>
      </Footer>
    </Wrap>
  );
}

/* 스타일은 그대로 */
const Wrap = styled.View<{ $child: boolean; $first?: boolean }>`
  background: #171818;
  padding: 15px 17px 25px 20px;
  border-top-width: ${({ $child, $first }) => ($first || $child ? 0 : 1)}px;
  border-top-color: #222426;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;
const Row = styled.View`flex-direction: row; align-items: center;`;
const ReplyIcon = styled.View`width: 22px; align-items: center; justify-content: center; margin-right: 6px;`;
const Avatar = styled.Image`width: 28px; height: 28px; border-radius: 14px; background: #2a2b2c;`;
const Meta = styled.View`margin-left: 10px; flex: 1;`;
const Author = styled.Text`color: #fff; font-size: 13px; font-family: 'PlusJakartaSans_700Bold';`;
const Sub = styled.Text`color: #9aa0a6; font-size: 11px; margin-top: 2px;`;
const More = styled.Text`color: #9aa0a6; font-size: 18px; padding: 4px 6px;`;
const Body = styled.Text`color: #d9dcdf; font-size: 13px; line-height: 18px; margin-top: 6px;`;
const Footer = styled.View`margin-top: 6px; flex-direction: row; align-items: center;`;
const Act = styled.Pressable`flex-direction: row; align-items: center; margin-right: 16px;`;
const Count = styled.Text<{ $active?: boolean }>`color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')}; margin-left: 6px; font-size: 12px;`;
