import api from '@/api/axiosInstance';
import { addBookmark, removeBookmark } from '@/api/community/bookmarks';
import { blockComment } from '@/api/community/comments';
import CommentItem, { Comment } from '@/components/CommentItem';
import ProfileModal from '@/components/ProfileModal';
import SortTabs, { SortKey } from '@/components/SortTabs';
import { useCreateComment } from '@/hooks/mutations/useCreateComment';
import { useLikeComment } from '@/hooks/mutations/useLikeComment';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { useUpdateComment } from '@/hooks/mutations/useUpdateComment';
import { useCommentWriteOptions } from '@/hooks/queries/useCommentWriteOptions';
import { usePostComments } from '@/hooks/queries/usePostComments';
import { usePostDetail } from '@/hooks/queries/usePostDetail';
import { usePostUI } from '@/src/store/usePostUI';
import { formatCreatedYMD } from '@/src/utils/dateUtils';
import { loadAspectRatios } from '@/src/utils/image';
import { LOCAL_ALLOW_ANON, resolvePostCategory } from '@/utils/category';
import { keysToUrls, keyToUrl } from '@/utils/image';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList as RNFlatList } from 'react-native';
import styled from 'styled-components/native';

import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewToken,
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const H_PADDING = 32;
const IMG_W = SCREEN_W - H_PADDING;

function ResponsiveImage({ uri, width, radius = 12 }: { uri: string; width: number; radius?: number }) {
  const [ratio, setRatio] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    RNImage.getSize(
      uri,
      (w, h) => {
        if (mounted) setRatio(w > 0 && h > 0 ? w / h : 16 / 9);
      },
      () => {
        if (mounted) setRatio(16 / 9);
      },
    );
    return () => {
      mounted = false;
    };
  }, [uri]);

  if (!ratio) {
    return <View style={{ width, height: width / (16 / 9), borderRadius: radius, backgroundColor: '#111213' }} />;
  }

  return (
    <RNImage
      source={{ uri }}
      resizeMode="cover"
      style={{ width, aspectRatio: ratio, borderRadius: radius, backgroundColor: '#111213' }}
    />
  );
}

const AV = require('@/assets/images/character1.png');
const DANGER = '#FF4D4F';

const StyledEditInput = styled(RNTextInput)`
  min-height: 220px;
  border-radius: 8px;
  padding: 12px;
  background: #1f2021;
  color: #e7eaed;
  font-size: 14px;
  border-width: 1px;
  border-color: #3a3d40;
`;
const EditInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => <StyledEditInput ref={ref} {...props} />);
EditInput.displayName = 'EditInput';

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { id, focusCommentId, intent, commentId } = useLocalSearchParams<{
    id: string;
    focusCommentId?: string;
    intent?: string;
    commentId?: string;
  }>();
  const postId = Number(id);
  const {
    bookmarked: bmMap,
    toggleBookmarked,
    hydrateFromServer,
    setBookmarked,
    liked,
    likeCount,
    setLiked,
    toggleLiked,
    setLikeCount,
    hydrateLikeFromServer,

  } = usePostUI();

  const postBookmarked = bmMap[postId] ?? false;

  const { data, isLoading, isError } = usePostDetail(Number.isFinite(postId) ? postId : undefined);

  const fetchUserProfile = async (userId: number) => {
    try {
      console.log('[Profile] fetching user:', userId);
      setIsLoadingProfile(true);
      const res = await api.get(`/api/v1/member/${userId}/info`);
      console.log('[Profile] raw response:', res); // <-- 전체 응답 찍기
      console.log('[Profile] res.data:', res.data); // <-- 이 라인 중요
      // 안전하게 실제 user 객체를 꺼내서 저장
      const userObj = (res.data && (res.data.data ?? res.data)) || res;
      console.log('[Profile] resolved userObj:', userObj);
      setSelectedUser(userObj);
      setIsProfileVisible(true);
    } catch (err) {
      console.error('프로필 불러오기 실패', err);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const post = data as any;

  const category = React.useMemo(() => resolvePostCategory(post), [post]);

  const { data: cmtOpts } = useCommentWriteOptions(Number.isFinite(postId) ? postId : undefined);

  const serverAnonymousAllowed = Boolean(
    (cmtOpts as any)?.isAnonymousAvailable ?? (cmtOpts as any)?.isAnonymousAvaliable,
  );

  const anonAllowed = React.useMemo(() => {
    const local = category ? LOCAL_ALLOW_ANON.has(category) : false;
    return serverAnonymousAllowed || local;
  }, [serverAnonymousAllowed, category]);

  React.useEffect(() => {
    console.log('[comment:write-options]', {
      postId,
      category,
      serverAnonymousAllowed,
      anonAllowed,
      raw: cmtOpts,
    });
  }, [postId, category, serverAnonymousAllowed, anonAllowed, cmtOpts]);

  const DEFAULT_RATIO = 16 / 9;
  const MAX_IMAGES = 5;
  const IMG_W = Dimensions.get('window').width - 32;

  const rawImageKeys: string[] = useMemo(() => {
    const p: any = data ?? {};
    return (p.contentImageUrls as string[] | undefined) ?? (p.imageUrls as string[] | undefined) ?? [];
  }, [data]);

  const imageUrls: string[] = useMemo(() => keysToUrls(rawImageKeys).slice(0, MAX_IMAGES), [rawImageKeys]);

  const [ratios, setRatios] = useState<number[]>([]);
  const heights = useMemo(
    () => (ratios.length ? ratios : imageUrls.map(() => DEFAULT_RATIO)).map((r) => IMG_W / r),
    [ratios, imageUrls, IMG_W],
  );

  const [imgIndex, setImgIndex] = useState(0);
  const heightAnim = useRef(new Animated.Value(IMG_W / DEFAULT_RATIO)).current;

  //댓글 바로 숨기기 (임시로)
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Set<number>>(new Set());

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!viewableItems?.length) return;
    const i = viewableItems[0].index ?? 0;
    syncHeightForIndex(i);
  }).current;

  const currentIndexRef = useRef(0);

  const syncHeightForIndex = React.useCallback(
    (i: number) => {
      currentIndexRef.current = i;
      setImgIndex(i);
      const nextH = heights[i] ?? IMG_W / DEFAULT_RATIO;
      Animated.timing(heightAnim, {
        toValue: nextH,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    },
    [heights, IMG_W, DEFAULT_RATIO, heightAnim],
  );

  const onMomentumScrollEnd = (e: any) => {
    const x = e?.nativeEvent?.contentOffset?.x ?? 0;
    const i = Math.max(0, Math.round(x / IMG_W));
    syncHeightForIndex(i);
  };
  const onScrollEndDrag = (e: any) => {
    const x = e?.nativeEvent?.contentOffset?.x ?? 0;
    const i = Math.max(0, Math.round(x / IMG_W));
    syncHeightForIndex(i);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!imageUrls.length) return;
      const rs = await loadAspectRatios(imageUrls, DEFAULT_RATIO);
      if (!alive) return;
      setRatios(rs);

      const i = currentIndexRef.current;
      const r = rs[i] ?? DEFAULT_RATIO;
      heightAnim.setValue(IMG_W / r);
    })();
    return () => {
      alive = false;
    };
  }, [imageUrls, DEFAULT_RATIO, IMG_W, heightAnim]);

  const syncHeightForOffset = React.useCallback(
    (x: number) => {
      const i = Math.max(0, Math.round(x / IMG_W));
      setImgIndex(i);

      const nextH = heights[i] ?? IMG_W / DEFAULT_RATIO;
      Animated.timing(heightAnim, {
        toValue: nextH,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    },
    [heights, IMG_W, DEFAULT_RATIO, heightAnim],
  );

  const openedOnceRef = useRef(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideY = useRef(new Animated.Value(300)).current;

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  type ReportTarget = 'post' | 'user' | 'comment';
  const [reportTarget, setReportTarget] = useState<ReportTarget>('post');

  //댓글 신고랑 차단
  type SheetCtx = { type: 'post' | 'comment' | null; commentId?: number };
  const [sheetCtx, setSheetCtx] = useState<SheetCtx>({ type: null });

  const likeMutation = useToggleLike();
  const createCmt = useCreateComment(postId);

  const [sort, setSort] = useState<SortKey>('new');
  const likeComment = useLikeComment(postId, sort);

  const [value, setValue] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const canSend = value.trim().length > 0;

  const inputRef = useRef<RNTextInput>(null);
  const listRef = useRef<RNFlatList<Comment>>(null);

  const { data: commentsRaw } = usePostComments(Number.isFinite(postId) ? postId : undefined, sort);
  const commentList: Comment[] = Array.isArray(commentsRaw)
    ? (commentsRaw as Comment[])
    : ((commentsRaw as any)?.items ?? []);

  //리스트 보이도록
  const getCmtId = (c: any) => Number(c?.id ?? c?.commentId);
  const visibleComments: Comment[] = useMemo(
    () => commentList.filter((c) => !hiddenCommentIds.has(getCmtId(c))),
    [commentList, hiddenCommentIds],
  );

  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<RNTextInput>(null);

  const { mutateAsync: updateCommentMut } = useUpdateComment();
  const likeBusyRef = useRef<Record<number, boolean>>({});
  const bmBusyRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    const serverVal = (post as any)?.bookmarked;
    hydrateFromServer(postId, typeof serverVal === 'boolean' ? serverVal : undefined);
  }, [postId, post, hydrateFromServer]);

  useEffect(() => {
    if (!Number.isFinite(postId) || !post) return;

    const liked = Boolean((post as any).likedByMe ?? (post as any).isLike ?? (post as any).isLiked ?? false);
    const count = post.likeCount ?? 0;

    hydrateLikeFromServer(postId, liked, count);
  }, [postId, post, hydrateLikeFromServer]);

  useEffect(() => {
    if (openedOnceRef.current) return;
    if (intent !== 'edit' || !focusCommentId) return;
    if (!Array.isArray(commentList) || commentList.length === 0) return;

    const target = commentList.find((c) => String((c as any).id ?? (c as any).commentId) === String(focusCommentId));
    if (!target) return;

    const body = (target as any).content ?? (target as any).comment ?? (target as any).text ?? '';

    setEditText(String(body));
    setEditVisible(true);
    openedOnceRef.current = true;

    const t = setTimeout(() => editInputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [intent, focusCommentId, commentList.length]);

  if (isLoading) {
    return (
      <Safe>
        <Header>
          <Back onPress={() => router.back()}>
            <AntDesign name="left" size={20} color="#fff" />
          </Back>
          <HeaderTitle>Post</HeaderTitle>
          <RightPlaceholder />
        </Header>
        <Center>
          <Dim>Loading…</Dim>
        </Center>
      </Safe>
    );
  }
  if (isError || !data) {
    return (
      <Safe>
        <Header>
          <Back onPress={() => router.back()}>
            <AntDesign name="left" size={20} color="#fff" />
          </Back>
          <HeaderTitle>Post</HeaderTitle>
          <RightPlaceholder />
        </Header>
        <Center>
          <Dim>Post not found.</Dim>
        </Center>
      </Safe>
    );
  }

  const authorId: string = String(
    post.userId ??
    post.authorId ??
    post.memberId ??
    post.writerId ??
    post.ownerId ??
    post.creatorId ??
    post.author?.id ??
    post.user?.id ??
    '',
  );
  const authorName: string =
    post.userName ??
    post.authorName ??
    post.memberName ??
    post.writerName ??
    post.ownerName ??
    post.creatorName ??
    post.author?.name ??
    post.user?.name ??
    'Unknown';
  const postType = post.type ?? post.category ?? post.postType ?? post.kind ?? 'unknown';
  const isAnonymous = Boolean(post.anonymous ?? post.isAnonymous ?? post.private);
  const isBlocked = Boolean(post.blocked ?? post.isBlocked);
  const isDeleted = Boolean(post.deleted ?? post.isDeleted ?? post.status === 'DELETED');

  const author = isAnonymous ? '익명' : authorName;
  const avatarUrl = post.userImageUrl ? keyToUrl(post.userImageUrl) : undefined;
  const avatarSrc = isAnonymous ? AV : avatarUrl ? { uri: avatarUrl } : AV;

  const createdRaw = post.createdTime ?? post.createdAt ?? post.timestamp;
  const createdLabel = formatCreatedYMD(createdRaw);

  const serverLikeCount = post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const views = post.viewCount ?? 0;
  const body = post.content ?? '';

  const serverLiked = Boolean((post as any).likedByMe ?? (post as any).isLike ?? (post as any).isLiked ?? false);

  const likedByMe = liked[postId] ?? serverLiked;
  const likeCountUI = likeCount[postId] ?? serverLikeCount;

  try {
    console.groupCollapsed('[post-meta]');
    const keys = Object.keys(post || {});
    console.groupEnd();
  } catch { }

  const toggleCommentLike = (comment: Comment) => {
    const cmtId = Number((comment as any).id ?? (comment as any).commentId);
    if (!Number.isFinite(cmtId)) return;
    if (likeBusyRef.current[cmtId]) return;
    likeBusyRef.current[cmtId] = true;

    const prevLiked = Boolean((comment as any).likedByMe ?? (comment as any).isLiked ?? false);

    likeComment.mutate(
      { commentId: cmtId, liked: prevLiked },
      {
        onSettled: () => {
          likeBusyRef.current[cmtId] = false;
        },
      },
    );
  };

  const submit = () => {
    const text = value.trim();
    if (!text || !Number.isFinite(postId)) return;
    createCmt.mutate(
      {
        comment: text,
        anonymous: anonAllowed ? !!anonymous : false,
      },
      {
        onSuccess: () => {
          setValue('');
          Keyboard.dismiss();
          requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
        },
        onError: () => Alert.alert('Comment', 'Failed to post comment.'),
      },
    );
  };

  const handleToggleLike = async () => {
    if (!Number.isFinite(postId) || likeMutation.isPending) return;

    const prevLiked = likedByMe;
    const prevCount = likeCountUI;
    const nextLiked = !prevLiked;
    const delta = nextLiked ? +1 : -1;
    const nextCount = Math.max(0, prevCount + delta);

    toggleLiked(postId);
    setLikeCount(postId, nextCount);

    try {
      await likeMutation.mutateAsync({ postId, liked: prevLiked });
    } catch (e) {
      // 롤백
      setLiked(postId, prevLiked);
      setLikeCount(postId, prevCount);
      console.error('[like detail] error', e);
    }
  };

  //게시글에서 열ㄹ기
  const openPostSheet = () => {
    setSheetCtx({ type: 'post' });
    setMenuVisible(true);
    slideY.setValue(300);
    Animated.timing(slideY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  //댓글에서 열기
  const openCommentSheet = (c: Comment) => {
    const cid = Number((c as any).id ?? (c as any).commentId);
    if (!Number.isFinite(cid)) return;
    setSheetCtx({ type: 'comment', commentId: cid });
    setMenuVisible(true);
    slideY.setValue(300);
    Animated.timing(slideY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const openCommentReport = (c: Comment) => {
    const cid = Number((c as any).id ?? (c as any).commentId);
    if (!Number.isFinite(cid)) return;
    setReportTarget('comment');
    setReportCommentId(cid);
    setReportText('');
    setReportOpen(true);
  };

  const closeMenu = () =>
    new Promise<void>((resolve) => {
      Animated.timing(slideY, {
        toValue: 300,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(false);
        resolve();
      });
    });

  const onSubmitReport = () => {
    const reason = reportText.trim();

    if (reportTarget !== 'comment' && !reason) {
      Alert.alert('Report', 'Please enter details.');
      return;
    }

    const titleText =
      reportTarget === 'user'
        ? 'Report This User'
        : reportTarget === 'comment'
          ? 'Report This Comment'
          : 'Report This Post';

    Alert.alert('Report', `Are you sure\n${titleText}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          setReportLoading(true);
          try {
            if (reportTarget === 'comment') {
              if (!reportText.trim()) throw new Error('reason required');
              await api.post('/api/v1/chat/declaration', {
                ignored: reportText.trim(),
                // commentId: reportCommentId
              });
            } else if (reportTarget === 'user') {
              await api.post(`/api/v1/posts/${postId}/block`, { reason });
            } else {
              await api.post(`/api/v1/posts/${postId}/block`, { reason });
            }

            setReportOpen(false);
            setReportText('');
            setReportCommentId(null);
            Alert.alert('Report', 'We’ve received your report. It may take up to 24 hours for review.');
          } catch (e: any) {
            const s = e?.response?.status;
            let msg =
              s === 401
                ? 'Authentication required. Please log in again.'
                : s === 403
                  ? 'You do not have permission.'
                  : s === 404
                    ? 'Target not found.'
                    : s === 400
                      ? 'This comment cannot be blocked.'
                      : 'Failed to submit the report.';
            Alert.alert('Report', msg);

            console.group('[report] error');
            console.log('target', reportTarget, 'status', s);
            console.log('meta', { postId, reportCommentId });
            console.groupEnd();
          } finally {
            setReportLoading(false);
          }
        },
      },
    ]);
  };

  const onSaveEdit = async () => {
    const text = editText.trim();
    if (!text) {
      Alert.alert('Edit', 'Please enter your comment.');
      return;
    }
    if (!focusCommentId) {
      Alert.alert('Edit', 'Comment id missing.');
      return;
    }

    try {
      await updateCommentMut({ commentId: Number(focusCommentId), content: text });
      setEditVisible(false);
    } catch (e) {
      console.log('[update comment] error', e);
      Alert.alert('Edit', 'Failed to save changes.');
    }
  };

  const hideCommentLocal = (cid: number) => {
    setHiddenCommentIds((prev) => {
      const next = new Set(prev);
      next.add(cid);
      return next;
    });
  };
  const unhideCommentLocal = (cid: number) => {
    setHiddenCommentIds((prev) => {
      if (!prev.has(cid)) return prev;
      const next = new Set(prev);
      next.delete(cid);
      return next;
    });
  };

  //r게시글 차단
  const blockPostFromSheet = () => {
    if (!Number.isFinite(postId)) return;
    setMenuVisible(false);

    Alert.alert('Block', 'Are you sure you want to block this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/api/v1/posts/${postId}/declaration`, {});

            Alert.alert('Block', 'This post has been blocked.');
          } catch (e: any) {
            const s = e?.response?.status;
            const msg =
              s === 401
                ? 'Authentication required. Please log in again.'
                : s === 403
                  ? 'You do not have permission.'
                  : s === 404
                    ? 'Post not found.'
                    : 'Failed to block this post.';
            Alert.alert('Block', msg);
            console.log('[block post] error', { status: s, postId, e });
          } finally {
            router.back();
          }
        },
      },
    ]);
  };

  const blockCommentFromSheet = () => {
    if (sheetCtx.type !== 'comment' || !Number.isFinite(sheetCtx.commentId!)) return;
    const cid = sheetCtx.commentId!;
    setMenuVisible(false);

    Alert.alert('Block', 'Are you sure you want to block this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          hideCommentLocal(cid);

          try {
            await blockComment(cid, 'Blocked from comment sheet');
            Alert.alert('Block', 'This comment has been blocked.');
          } catch (e: any) {
            const s = e?.response?.status;
            const msg =
              s === 401
                ? 'Authentication required. Please log in again.'
                : s === 403
                  ? 'You do not have permission.'
                  : s === 404
                    ? 'Comment not found.'
                    : 'Failed to block this comment.';
            Alert.alert('Block', msg);
            console.log('[block comment] error', { status: s, commentId: cid, e });
          }
        },
      },
    ]);
  };
  const handleStartChat = async () => {
    // 2. 이미 로딩 중이거나 선택된 유저가 없으면 중단
    if (isChatLoading || !selectedUser) {
      console.log('Chat creation in progress or no user selected.');
      return;
    }

    // 3. selectedUser에서 상대방 ID 추출 (키 이름은 실제 데이터에 맞게 조정 필요)
    const otherUserId = (selectedUser as any)?.id ?? (selectedUser as any)?.userId;

    if (!otherUserId) {
      Alert.alert('Error', 'Could not find user ID to start chat.');
      return;
    }

    console.log(`[Chat] Attempting to create room with user: ${otherUserId}`);
    setIsChatLoading(true);

    try {
      // 4. API 호출
      const response = await api.post('/api/v1/chat/rooms/oneTone', {
        otherUserId: Number(otherUserId),
      });

      // 5. 응답 데이터에서 채팅방 ID 추출
      // API 응답 본문이 { "id": ..., "participants": ... } 형태이므로 response.data가 바로 채팅방 객체입니다.
      console.log('[Chat] API Response Data:', JSON.stringify(response.data, null, 2));
      const newRoom = response.data.data;
      const roomId = newRoom?.id;

      if (!roomId) {
        throw new Error('Chat room ID not found in API response.');
      }

      console.log(`[Chat] Successfully created room. ID: ${roomId}`);

      // 6. 성공 시 프로필 모달 닫기
      setIsProfileVisible(false);

      // 7. expo-router를 사용해 채팅방으로 이동
      //    (경로는 실제 채팅방 스크린 경로에 맞게 수정하세요. 예: '/chat/[id]')
      router.push({
        pathname: '/chat/ChattingRoomScreen', // <-- ChatLayout에 등록된 파일 이름
        params: { roomId: roomId }             // <-- 전달할 데이터 (채팅방 ID)
      });

    } catch (err: any) {
      // 8. 에러 처리
      console.error('[Chat] Failed to create chat room:', err);
      const status = err.response?.status;
      const msg =
        status === 400
          ? 'Invalid request.'
          : status === 401
            ? 'Please log in to chat.'
            : 'Failed to start chat.';
      Alert.alert('Chat Error', msg);
    } finally {
      // 9. 로딩 상태 해제
      setIsChatLoading(false);
    }
  };

  // 🔽 [추가] 팔로우 요청 함수
  const handleFollow = async () => {
    // 로딩 중이거나, 유저 정보가 없으면 중단
    if (isFollowLoading || !selectedUser) return;

    // selectedUser에서 ID와 현재 팔로우 상태를 가져옵니다.
    const targetUserId = (selectedUser as any)?.userId;
    const currentStatus = (selectedUser as any)?.followStatus;

    if (!targetUserId) {
      Alert.alert('Error', 'Could not find user ID.');
      return;
    }

    // "NOT_FOLLOWING" 상태일 때만 팔로우 요청을 보냅니다.
    if (currentStatus !== 'NOT_FOLLOWING') {
      console.log(`[Follow] Action ignored. Current status: ${currentStatus}`);
      return;
    }

    console.log(`[Follow] Attempting to follow user: ${targetUserId}`);
    setIsFollowLoading(true);

    try {
      // 1. API 호출: POST /api/v1/home/follow/{userId}
      await api.post(`/api/v1/home/follow/${targetUserId}`);

      // 2. API 성공 시, 로컬 state를 "PENDING"으로 즉시 변경 (Optimistic UI)
      //    (모달이 이 state를 보고 버튼 모양을 "Pending"으로 바꿀 겁니다)
      setSelectedUser(prevUser => ({
        ...(prevUser as any),
        followStatus: 'PENDING'
      }));

      Alert.alert('Follow', 'Follow request sent!');

    } catch (err: any) {
      // 3. 에러 처리 (백엔드 로직에 맞게)
      console.error('[Follow] Failed to send follow request:', err);
      const errorData = err.response?.data;
      const errorCode = errorData?.code; // 백엔드에서 보낸 에러 코드

      let msg = 'Failed to send follow request.';
      if (errorCode === 'PROFILE_SET_NOT_COMPLETED') {
        msg = 'You must complete your own profile before you can follow others.';
      } else if (errorCode === 'FOLLOW_ALREADY_EXISTS') {
        msg = 'You have already sent a request or are already following this user.';
        // 혹시 모르니 state를 PENDING으로 강제 동기화
        setSelectedUser(prevUser => ({
          ...(prevUser as any),
          followStatus: 'PENDING' // 또는 'ACCEPTED'일 수 있으나 PENDING이 더 가능성 높음
        }));
      } else if (errorCode === 'CANNOT_FOLLOW_YOURSELF') {
        msg = 'You cannot follow yourself.';
      }

      Alert.alert('Follow Error', msg);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    // 로딩 중이거나, 유저 정보가 없으면 중단
    if (isFollowLoading || !selectedUser) return;

    // selectedUser에서 ID와 현재 팔로우 상태를 가져옵니다.
    const targetUserId = (selectedUser as any)?.userId;
    const currentStatus = (selectedUser as any)?.followStatus;

    // "ACCEPTED" (친구) 상태가 아니면 함수를 실행하지 않습니다.
    if (currentStatus !== 'ACCEPTED') {
      console.log(`[Unfollow] Action ignored. Current status: ${currentStatus}`);
      Alert.alert('Unfollow', 'You can only unfollow users you are already friends with.');
      return;
    }

    console.log(`[Unfollow] Attempting to unfollow user: ${targetUserId}`);
    setIsFollowLoading(true);

    try {
      // 1. API 호출: DELETE /api/v1/users/follow/accepted/{friendId}
      await api.delete(`/api/v1/users/follow/accepted/${targetUserId}`);

      // 2. API 성공 시, 로컬 state를 "NOT_FOLLOWING"으로 즉시 변경
      setSelectedUser(prevUser => ({
        ...(prevUser as any),
        followStatus: 'NOT_FOLLOWING'
      }));

      Alert.alert('Unfollow', 'You have successfully unfollowed this user.');

    } catch (err: any) {
      // 3. 에러 처리
      console.error('[Unfollow] Failed to unfollow:', err);
      const status = err.response?.status;
      let msg = 'Failed to unfollow user.';

      if (status === 404) {
        msg = 'User not found or you are not following them.';
        // 404 에러 시 로컬 state를 강제로 'NOT_FOLLOWING'으로 동기화
        setSelectedUser(prevUser => ({
          ...(prevUser as any),
          followStatus: 'NOT_FOLLOWING'
        }));
      } else if (status === 401) {
        msg = 'Please log in again.';
      }

      Alert.alert('Unfollow Error', msg);
    } finally {
      setIsFollowLoading(false);
    }
  };


  const reportTitle =
    reportTarget === 'user'
      ? 'Report This User'
      : reportTarget === 'comment'
        ? 'Report This Comment'
        : 'Report This Post';

  return (
    <Safe>
      <Header>
        <Back onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </Back>
        <HeaderTitle>Post</HeaderTitle>
        <RightPlaceholder />
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      >
        <FlatList<Comment>
          ref={listRef}
          data={visibleComments}
          keyExtractor={(it) => String((it as any).id ?? (it as any).commentId)}
          renderItem={({ item, index }) => (
            <CommentItem
              data={item}
              isFirst={index === 0}
              onPressProfile={fetchUserProfile}
              onPressLike={() => toggleCommentLike(item)}
              onPressMore={(c) => openCommentSheet(c)}
            />
          )}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: '#171818' }}
          contentContainerStyle={{ paddingBottom: 92 }}
          ListHeaderComponent={
            <>
              <Card>
                <Row>
                  <Meta>
                    <Pressable
                      onPress={() => fetchUserProfile(Number(authorId))}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Avatar source={avatarSrc} />
                      <Meta>
                        <Author>{author}</Author>
                        <MetaRow>
                          <Sub>{createdLabel || '—'}</Sub>
                          <Dot>·</Dot>
                          <AntDesign name="eyeo" size={12} color="#9aa0a6" />
                          <Sub style={{ marginLeft: 6 }}>{views}</Sub>
                        </MetaRow>
                      </Meta>
                    </Pressable>
                  </Meta>

                  <BookmarkWrap
                    onPress={async () => {
                      if (bmBusyRef.current[postId]) return;
                      bmBusyRef.current[postId] = true;

                      const before = postBookmarked;
                      const next = !before;

                      toggleBookmarked(postId);

                      try {
                        if (next) {
                          await addBookmark(postId);
                        } else {
                          await removeBookmark(postId);
                        }
                      } catch (e) {
                        setBookmarked(postId, before);
                        console.log('[bookmark:detail] error', e);
                      } finally {
                        bmBusyRef.current[postId] = false;
                      }
                    }}
                    $active={postBookmarked}
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name={postBookmarked ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={postBookmarked ? '#30F59B' : '#8a8a8a'}
                    />
                  </BookmarkWrap>
                </Row>

                {imageUrls.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Animated.View
                      style={{
                        height: heightAnim,
                        overflow: 'hidden',
                        borderRadius: 12,
                        backgroundColor: '#111213',
                      }}
                    >
                      <FlatList
                        data={imageUrls}
                        keyExtractor={(u, i) => `${u}#${i}`}
                        horizontal
                        pagingEnabled
                        snapToInterval={IMG_W}
                        decelerationRate="fast"
                        removeClippedSubviews={false}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={onMomentumScrollEnd}
                        onScrollEndDrag={onScrollEndDrag}
                        onViewableItemsChanged={onViewableItemsChanged}
                        renderItem={({ item }) => (
                          <RNImage source={{ uri: item }} resizeMode="cover" style={{ width: IMG_W, height: '100%' }} />
                        )}
                      />
                    </Animated.View>

                    <Counter>{` ${imgIndex + 1}/${imageUrls.length} `}</Counter>
                  </View>
                )}

                <Body>{body}</Body>

                <Footer>
                  <Act onPress={handleToggleLike} disabled={likeMutation.isPending}>
                    <AntDesign name="like2" size={16} color={likedByMe ? '#30F59B' : '#cfd4da'} />
                    <ActText>{likeCountUI}</ActText>
                  </Act>
                  <Act>
                    <AntDesign name="message1" size={16} color="#cfd4da" />
                    <ActText>{commentCount}</ActText>
                  </Act>
                  <Grow />
                  <MoreBtn onPress={openPostSheet} hitSlop={8}>
                    <Feather name="more-horizontal" size={22} color="#8a8a8a" />
                  </MoreBtn>
                </Footer>
              </Card>

              <SortWrap>
                <SortTabs value={sort} onChange={setSort} />
              </SortWrap>
            </>
          }
        />

        <InputBar>
          <Composer>
            <BottomInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              placeholder="Write Your Text"
              placeholderTextColor="#616262"
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={submit}
            />
            {anonAllowed && (
              <AnonToggle
                onPress={() => {
                  const next = !anonymous;
                  console.log('[comment:anon:toggle]', { category, anonAllowed, before: anonymous, after: next });
                  setAnonymous(next);
                }}
              >
                <AnonLabel>Anonymous</AnonLabel>
                <Check $active={anonymous}>{anonymous && <AntDesign name="check" size={14} color="#ffffff" />}</Check>
              </AnonToggle>
            )}
          </Composer>

          <SendBtn onPress={submit} disabled={!canSend} hitSlop={8}>
            <Feather name="send" size={22} color={canSend ? '#02F59B' : '#D9D9D9'} />
          </SendBtn>
        </InputBar>
      </KeyboardAvoidingView>

      <Modal transparent visible={menuVisible} onRequestClose={() => setMenuVisible(false)} animationType="none">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)} />
          <Animated.View
            style={{
              transform: [{ translateY: slideY }],
              backgroundColor: '#232425',
              paddingBottom: 20,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingTop: 10,
            }}
          >
            <SheetHandle />

            {sheetCtx.type === 'post' && (
              <>
                <SheetItem
                  onPress={() => {
                    setMenuVisible(false);
                    setReportTarget('post');
                    setReportText('');
                    setReportOpen(true);
                  }}
                >
                  <SheetIcon>
                    <MaterialIcons name="outlined-flag" size={18} color={DANGER} />
                  </SheetIcon>
                  <SheetLabel $danger>Report This Post</SheetLabel>
                </SheetItem>

                <SheetItem
                  onPress={() => {
                    setMenuVisible(false);
                    setReportTarget('user');
                    setReportText('');
                    setReportOpen(true);
                  }}
                >
                  <SheetIcon>
                    <MaterialIcons name="person-outline" size={18} color={DANGER} />
                  </SheetIcon>
                  <SheetLabel $danger>Report This User</SheetLabel>
                </SheetItem>

                <SheetItem onPress={blockPostFromSheet}>
                  <SheetIcon>
                    <MaterialIcons name="block" size={18} color={DANGER} />
                  </SheetIcon>
                  <SheetLabel $danger>Block This Post</SheetLabel>
                </SheetItem>
              </>
            )}

            {sheetCtx.type === 'comment' && (
              <>
                <SheetItem
                  onPress={() => {
                    setMenuVisible(false);
                    setReportTarget('comment');
                    setReportCommentId(sheetCtx.commentId!);
                    setReportText('');
                    setReportOpen(true);
                  }}
                >
                  <SheetIcon>
                    <MaterialIcons name="outlined-flag" size={18} color={DANGER} />
                  </SheetIcon>
                  <SheetLabel $danger>Report This Comment</SheetLabel>
                </SheetItem>

                <SheetItem onPress={blockCommentFromSheet}>
                  <SheetIcon>
                    <MaterialIcons name="block" size={18} color={DANGER} />
                  </SheetIcon>
                  <SheetLabel $danger>Block This Comment</SheetLabel>
                </SheetItem>
              </>
            )}

            <SheetDivider />
            <SheetItem onPress={() => setMenuVisible(false)}>
              <SheetIcon>
                <AntDesign name="close" size={18} color="#cfd4da" />
              </SheetIcon>
              <SheetLabel>Cancel</SheetLabel>
            </SheetItem>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={reportOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setReportOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Pressable
            onPress={() => setReportOpen(false)}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <Dialog>
            <DialogHeader>
              <DialogTitle>
                <MaterialCommunityIcons name="flag-variant" size={18} color={DANGER} />
                <DialogTitleText $danger> {reportTitle}</DialogTitleText>
              </DialogTitle>
              <CloseBtn onPress={() => setReportOpen(false)}>
                <AntDesign name="close" size={18} color="#cfd4da" />
              </CloseBtn>
            </DialogHeader>

            <DialogTextarea
              value={reportText}
              onChangeText={setReportText}
              placeholder={
                reportTarget === 'user'
                  ? 'Tell us what’s wrong with this user’s content…'
                  : reportTarget === 'comment'
                    ? 'Tell us what’s wrong with this comment…'
                    : 'Tell us what’s wrong with this post…'
              }
              blurOnSubmit
              returnKeyType="done"
              placeholderTextColor="#858b90"
              multiline
              textAlignVertical="top"
              editable={!reportLoading}
            />

            <SubmitBtn onPress={onSubmitReport} disabled={reportLoading || !reportText.trim()}>
              <SubmitText>{reportLoading ? 'Submitting…' : 'Submit'}</SubmitText>
            </SubmitBtn>
          </Dialog>
        </View>
      </Modal>

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setEditVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Pressable
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            onPress={() => setEditVisible(false)}
          />
          <EditBox>
            <EditHeader>
              <EditTitle>
                <AntDesign name="edit" size={16} color="#cfd4da" />
                <EditTitleText> Edit My Comments</EditTitleText>
              </EditTitle>
              <CloseBtn onPress={() => setEditVisible(false)}>
                <AntDesign name="close" size={18} color="#cfd4da" />
              </CloseBtn>
            </EditHeader>

            <EditInput
              ref={editInputRef}
              value={editText}
              onChangeText={setEditText}
              placeholder=""
              placeholderTextColor="#858b90"
              multiline
              textAlignVertical="top"
            />

            <SaveBtn onPress={onSaveEdit}>
              <SaveText>Save Edit</SaveText>
            </SaveBtn>
          </EditBox>
        </View>
      </Modal>
      <ProfileModal
        visible={isProfileVisible}
        userData={selectedUser}
        onClose={() => setIsProfileVisible(false)}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onChat={handleStartChat}
        isLoadingFollow={isFollowLoading}
        isLoadingChat={isChatLoading}
      />
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;
const Header = styled.View`
  height: 48px;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const Back = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;
const HeaderTitle = styled.Text`
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_500Bold';
  text-align: center;
  flex: 1;
`;
const RightPlaceholder = styled.View`
  width: 40px;
`;
const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const Dim = styled.Text`
  color: #cfd4da;
`;

const Card = styled.View`
  background: #1d1e1f;
  padding: 12px 16px 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;
const Row = styled.View`
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
const MetaRow = styled.View`
  margin-top: 2px;
  flex-direction: row;
  align-items: center;
`;
const Sub = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
`;
const Dot = styled.Text`
  color: #9aa0a6;
  margin: 0 6px;
`;

const BookmarkWrap = styled.Pressable<{ $active?: boolean }>`
  padding: 6px;
  background: transparent;
`;

const Counter = styled.Text`
  position: absolute;
  right: 14px;
  bottom: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
`;

const Body = styled.Text`
  color: #d9dcdf;
  font-size: 14px;
  line-height: 20px;
  margin-top: 10px;
`;
const Footer = styled.View`
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
`;
const Act = styled.Pressable<{ disabled?: boolean }>`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const ActText = styled.Text`
  color: #cfd4da;
  margin-left: 6px;
  font-size: 12px;
`;
const Grow = styled.View`
  flex: 1;
`;
const MoreBtn = styled.Pressable`
  padding: 6px;
`;

const SortWrap = styled.View`
  background: #171818;
  padding: 10px 16px 0 16px;
  margin-bottom: 15px;
`;
const InputBar = styled.View`
  padding: 10px 12px 14px 12px;
  background: #1d1e1f;
  border-top-width: 1px;
  border-top-color: #222426;
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
`;
const Composer = styled.View`
  flex: 1;
  background: #414142;
  border-radius: 8px;
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
`;
const BottomInput = styled(RNTextInput)`
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  padding: 0;
  background: transparent;
`;
const AnonToggle = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
`;
const AnonLabel = styled.Text`
  color: #cccfd5;
  font-size: 14px;
  margin-right: 8px;
  font-family: 'PlusJakartaSans_Light';
`;
const Check = styled.View<{ $active?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border-width: 1.1px;
  border-color: #cccfd5;
  background: ${({ $active }) => ($active ? '#30f59b' : 'transparent')};
  align-items: center;
  justify-content: center;
`;

const SendBtn = styled.Pressable<{ disabled?: boolean }>`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const SheetHandle = styled.View`
  align-self: center;
  width: 44px;
  height: 4px;
  border-radius: 2px;
  background: #44484d;
  margin-bottom: 8px;
`;
const SheetItem = styled.Pressable`
  flex-direction: row;
  align-items: center;
  padding: 14px 20px;
`;
const SheetIcon = styled.View`
  width: 28px;
  align-items: center;
  margin-right: 8px;
`;
const SheetLabel = styled.Text<{ $danger?: boolean }>`
  color: ${({ $danger }) => ($danger ? '#ff4d4f' : '#e6e9ed')};
  font-size: 16px;
`;
const SheetDivider = styled.View`
  height: 1px;
  background: #2c2f33;
  margin: 4px 0;
`;

const Dialog = styled.View`
  width: 100%;
  max-width: 360px;
  background: #2a2b2c;
  border-radius: 12px;
  padding: 12px 12px 16px 12px;
`;
const DialogHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;
const DialogTitle = styled.View`
  flex-direction: row;
  align-items: center;
`;
const DialogTitleText = styled.Text<{ $danger?: boolean }>`
  color: ${({ $danger }) => ($danger ? '#ff4d4f' : '#e7eaed')};
  font-size: 14px;
  font-weight: 700;
`;
const CloseBtn = styled.Pressable`
  padding: 4px;
`;
const DialogTextarea = styled.TextInput`
  min-height: 220px;
  border-radius: 8px;
  padding: 12px;
  background: #1f2021;
  color: #e7eaed;
  font-size: 14px;
  border-width: 1px;
  border-color: #3a3d40;
`;
const SubmitBtn = styled.Pressable<{ disabled?: boolean }>`
  background: #ff4d4f;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const SubmitText = styled.Text`
  color: #ffffff;
  font-weight: 700;
`;
const EditBox = styled.View`
  width: 100%;
  max-width: 360px;
  background: #2a2b2c;
  border-radius: 12px;
  padding: 12px 12px 16px 12px;
`;
const EditHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;
const EditTitle = styled.View`
  flex-direction: row;
  align-items: center;
`;
const EditTitleText = styled.Text`
  color: #cfd4da;
  font-size: 14px;
  font-weight: 700;
`;
const SaveBtn = styled.Pressable`
  background: #30f59b;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
`;
const SaveText = styled.Text`
  color: #000;
  font-weight: 700;
`;
