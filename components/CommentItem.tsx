import api from '@/api/axiosInstance';
import { formatShortDate } from '@/src/utils/dateUtils';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import ProfileModal from './ProfileModal';

const DEFAULT_AV = require('@/assets/images/character1.png');

export type Comment = {
  id: string | number;
  author?: string;
  authorId?: number;
  avatar?: ImageSourcePropType;
  createdAt: string;
  body: string;
  likes: number;
  likedByMe?: boolean;
  isChild?: boolean;
  hotScore?: number;
  anonymous?: boolean;
  userId?: number;
};

type Props = {
  data: Comment | any;
  onPressLike?: () => void;
  isFirst?: boolean;
  onPressMore?: (c: Comment) => void;
  onPressProfile?: (userId: number) => void;
};

function isAnon(row: any): boolean {
  const explicit =
    row?.anonymous ??
    row?.isAnonymous ??
    row?.isAnonymousWriter ??
    row?.writerAnonymous ??
    (typeof row?.anonymousYn === 'string' && row.anonymousYn.toUpperCase() === 'Y');

  const label = row?.author ?? row?.authorName ?? row?.nickname ?? row?.userName ?? row?.writerName ?? '';
  const labelAnon = String(label).trim().toLowerCase() === '익명' || String(label).trim().toLowerCase() === 'anonymous';

  const hasAnyName =
    [row?.author, row?.authorName, row?.nickname, row?.userName, row?.writerName].filter(
      (v) => !!String(v ?? '').trim(),
    ).length > 0;

  return Boolean(explicit || labelAnon || !hasAnyName);
}

function resolveAuthor(row: any): string {
  const cands = [row?.author, row?.authorName, row?.memberName, row?.nickname, row?.userName, row?.writerName]
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

function resolveUserId(row: any): number | undefined {
  const id = row?.userId ?? row?.authorId ?? row?.memberId ?? row?.writerId ?? row?.ownerId;
  const num = Number(id);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export default function CommentItem({ data, onPressLike, isFirst, onPressMore, onPressProfile }: Props) {
  const child = !!data?.isChild;
  const anon = isAnon(data);
  const authorLabel = resolveAuthor(data);
  const avatarResolved = resolveAvatar(data);
  const avatarSrc = anon ? DEFAULT_AV : avatarResolved || DEFAULT_AV;
  const dateLabel = useMemo(() => formatShortDate(data?.createdAt), [data?.createdAt]);
  const bodyText = resolveBody(data);
  const likeCount = resolveLikes(data);
  const likedByMe = resolveLikedByMe(data);
  const userId = resolveUserId(data);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handlePressProfile = async () => {
    if (anon || !userId) {
      return;
    }
    if (onPressProfile) {
      onPressProfile(userId);
      return;
    }

    try {
      setIsLoadingProfile(true);
      const res = await api.get(`/api/v1/member/${userId}/info`);
      setSelectedUser(res.data);
      setIsProfileVisible(true);
    } catch (err) {
      console.error('[Profile] fetch error:', err);
      Alert.alert('Error', 'try again');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // 🔹 채팅 핸들러
  const handleStartChat = async () => {
    if (isChatLoading || !selectedUser) return;

    const otherUserId = (selectedUser as any)?.id ?? (selectedUser as any)?.userId;

    if (!otherUserId) {
      Alert.alert('Error', 'Could not find user ID to start chat.');
      return;
    }

    setIsChatLoading(true);

    try {
      const response = await api.post('/api/v1/chat/rooms/oneTone', {
        otherUserId: Number(otherUserId),
      });

      const newRoom = response.data.data;
      const roomId = newRoom?.id;

      if (!roomId) {
        throw new Error('Chat room ID not found in API response.');
      }

      setIsProfileVisible(false);

      router.push({
        pathname: '/chat/ChattingRoomScreen',
        params: { roomId: roomId },
      });
    } catch (err: any) {
      console.error('[Chat] Failed to create chat room:', err);
      const status = err.response?.status;

      if (status === 428) {
        Alert.alert('Profile Setup Required', 'Please complete your profile setup before starting a chat.', [
          {
            text: 'Go to Setup',
            onPress: () => {
              setIsProfileVisible(false);
              router.push('/(tabs)/mypage/edit' as any);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }

      const msg =
        status === 400 ? 'Invalid request.' : status === 401 ? 'Please log in to chat.' : 'Failed to start chat.';
      Alert.alert('Chat Error', msg);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 🔹 팔로우 핸들러
  const handleFollow = async () => {
    if (isFollowLoading || !selectedUser) return;

    const targetUserId = (selectedUser as any)?.userId;
    const currentStatus = (selectedUser as any)?.followStatus;

    if (!targetUserId || currentStatus !== 'NOT_FOLLOWING') return;

    setIsFollowLoading(true);

    try {
      await api.post(`/api/v1/home/follow/${targetUserId}`);
      setSelectedUser((prevUser) => ({
        ...(prevUser as any),
        followStatus: 'PENDING',
      }));
      Alert.alert('Follow', 'Follow request sent!');
    } catch (err: any) {
      console.error('[Follow] Failed to send follow request:', err);
      const status = err.response?.status;

      // 428 에러 처리
      if (status === 428) {
        Alert.alert('Profile Setup Required', 'Please complete your profile before following.', [
          {
            text: 'Go to Setup',
            onPress: () => {
              setIsProfileVisible(false);
              router.push('/(tabs)/mypage/edit' as any);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }

      const errorCode = err.response?.data?.code;
      let msg = 'Failed to send follow request.';
      if (errorCode === 'PROFILE_SET_NOT_COMPLETED') {
        msg = 'You must complete your own profile before you can follow others.';
      } else if (errorCode === 'FOLLOW_ALREADY_EXISTS') {
        msg = 'You have already sent a request or are already following this user.';
        setSelectedUser((prevUser) => ({
          ...(prevUser as any),
          followStatus: 'PENDING',
        }));
      } else if (errorCode === 'CANNOT_FOLLOW_YOURSELF') {
        msg = 'You cannot follow yourself.';
      }
      Alert.alert('Follow Error', msg);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Wrap $child={child} $first={isFirst}>
      <MoreBtn
        onPress={() => onPressMore?.(data)}
        disabled={!onPressMore}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="More actions"
      >
        <Feather name="more-horizontal" size={20} color="#8a8a8a" />
      </MoreBtn>

      <Row>
        {child && (
          <ReplyIcon>
            <Feather name="corner-down-right" size={18} color="#9aa0a6" />
          </ReplyIcon>
        )}
        <AvatarButton
          onPress={handlePressProfile}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <Avatar source={avatarSrc} />
        </AvatarButton>

        <Meta>
          <AuthorRow>
            {anon && (
              <AnonBadgeWrapper>
                <AnonBadgeText>익명</AnonBadgeText>
              </AnonBadgeWrapper>
            )}
            <Author>{authorLabel}</Author>
          </AuthorRow>
          <Sub>{dateLabel || '—'}</Sub>
        </Meta>
      </Row>

      {!!bodyText && <Body>{bodyText}</Body>}

      <Footer>
        <Act onPress={onPressLike} hitSlop={8} accessibilityRole="button" accessibilityLabel="Like this comment">
          <AntDesign name={likedByMe ? 'like1' : 'like2'} size={14} color={likedByMe ? '#30F59B' : '#cfd4da'} />
          <Count $active={likedByMe}>{likeCount}</Count>
        </Act>
      </Footer>

      <ProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
        userData={selectedUser}
        onChat={handleStartChat}
        onFollow={handleFollow}
        isLoadingChat={isChatLoading}
        isLoadingFollow={isFollowLoading}
      />
    </Wrap>
  );
}

/* ---------- 스타일 ---------- */
const Wrap = styled.View<{ $child: boolean; $first?: boolean }>`
  position: relative;
  background: #171818;
  padding: 15px 17px 25px 20px;
  border-top-width: ${({ $child, $first }) => ($first || $child ? 0 : 1)}px;
  border-top-color: #222426;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ReplyIcon = styled.View`
  width: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
`;

const Avatar = styled.Image`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #2a2b2c;
`;

const Meta = styled.View`
  margin-left: 10px;
  flex: 1;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Author = styled.Text`
  color: #fff;
  font-size: 13px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const Sub = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
  margin-top: 2px;
`;

const Body = styled.Text`
  color: #d9dcdf;
  font-size: 13px;
  line-height: 18px;
  margin-top: 6px;
`;

const Footer = styled.View`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
`;

const Act = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`;

const Count = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')};
  margin-left: 6px;
  font-size: 12px;
`;

const AnonBadgeWrapper = styled.View`
  background: #30f59b;
  border-radius: 4px;
  padding: 1px 6px;
  margin-right: 6px;
`;

const AnonBadgeText = styled.Text`
  color: #000;
  font-size: 10px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const MoreBtn = styled.Pressable`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px;
  z-index: 10;
`;

const AvatarButton = styled.Pressable`
  border-radius: 14px;
`;
