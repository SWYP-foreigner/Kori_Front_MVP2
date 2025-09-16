import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import React, { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

const DEFAULT_AV = require('@/assets/images/character1.png');

export type Comment = {
  id: string | number;
  author?: string;
  avatar?: ImageSourcePropType;
  createdAt: string;
  body: string;
  likes: number;
  likedByMe?: boolean;
  isChild?: boolean;
  hotScore?: number;
  anonymous?: boolean;
};

type Props = {
  data: Comment | any;
  onPressLike?: () => void;
  isFirst?: boolean;
};

function isAnon(row: any): boolean {
  const explicit =
    row?.anonymous ??
    row?.isAnonymous ??
    row?.isAnonymousWriter ??
    row?.writerAnonymous ??
    (typeof row?.anonymousYn === 'string' &&
      row.anonymousYn.toUpperCase() === 'Y');

  const label =
    row?.author ??
    row?.authorName ??
    row?.nickname ??
    row?.userName ??
    row?.writerName ??
    '';
  const labelAnon =
    String(label).trim().toLowerCase() === '익명' ||
    String(label).trim().toLowerCase() === 'anonymous';

  const hasAnyName =
    [row?.author, row?.authorName, row?.nickname, row?.userName, row?.writerName]
      .filter((v) => !!String(v ?? '').trim()).length > 0;

  return Boolean(explicit || labelAnon || !hasAnyName);
}

function resolveAuthor(row: any): string {
  const cands = [
    row?.author,
    row?.authorName,
    row?.memberName,
    row?.nickname,
    row?.userName,
    row?.writerName,
  ]
    .map((v) => (v == null ? undefined : String(v).trim()))
    .filter(Boolean) as string[];
  return cands[0] ?? '익명';
}

function resolveAvatar(row: any): ImageSourcePropType | undefined {
  const url =
    row?.userImage ??
    row?.userImageUrl ??
    row?.avatarUrl ??
    (typeof row?.avatar === 'string' ? row?.avatar : undefined);
  if (typeof url === 'string' && url.trim()) return { uri: url };
  if (row?.avatar) return row.avatar as ImageSourcePropType;
  return undefined;
}

function resolveBody(row: any): string {
  return String(row?.body ?? row?.content ?? row?.comment ?? '').trim();
}

function resolveLikes(row: any): number {
  const n = Number(row?.likes ?? row?.likeCount ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function resolveLikedByMe(row: any): boolean {
  return Boolean(row?.likedByMe ?? row?.isLiked ?? row?.isLike ?? false);
}

function formatDate(rawIn: any): string {
  const raw = String(rawIn ?? '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}(?!T)/.test(raw)) return raw.slice(5, 10).replace('-', '/');
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(5, 10).replace('-', '/');
  const n = Number(raw);
  if (Number.isFinite(n)) {
    const d = new Date(n > 1e12 ? n : n * 1000);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${mm}/${dd}`;
    }
  }
  return raw;
}

export default function CommentItem({ data, onPressLike, isFirst }: Props) {
  const child = !!data?.isChild;
  const anon = isAnon(data);

  const authorLabel = resolveAuthor(data);
  const avatarResolved = resolveAvatar(data);
  const avatarSrc = anon ? DEFAULT_AV : (avatarResolved || DEFAULT_AV);
  const dateLabel = useMemo(() => formatDate(data?.createdAt), [data?.createdAt]);

  const bodyText = resolveBody(data);
  const likeCount = resolveLikes(data);
  const likedByMe = resolveLikedByMe(data);

  return (
    <Wrap $child={child} $first={isFirst}>
      <Row>
        {child && (
          <ReplyIcon>
            <Feather name="corner-down-right" size={18} color="#9aa0a6" />
          </ReplyIcon>
        )}
        <Avatar source={avatarSrc} />
        <Meta>
          <Author>
            {anon ? <AnonBadge>익명</AnonBadge> : null}
            {authorLabel}
          </Author>
          <Sub>{dateLabel}</Sub>
        </Meta>
      </Row>

      {!!bodyText && <Body>{bodyText}</Body>}

      <Footer>
        <Act
          onPress={onPressLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Like this comment"
        >
          <AntDesign
            name={likedByMe ? 'like1' : 'like2'}
            size={14}
            color={likedByMe ? '#30F59B' : '#cfd4da'}
          />
          <Count $active={likedByMe}>{likeCount}</Count>
        </Act>

      </Footer>
    </Wrap>
  );
}

/* ---------- 스타일 ---------- */
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
const Count = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')};
  margin-left: 6px; font-size: 12px;
`;
const AnonBadge = styled.Text`
  color: #000; background: #30f59b; border-radius: 4px;
  padding: 1px 6px; margin-right: 6px; font-size: 10px;
`;
