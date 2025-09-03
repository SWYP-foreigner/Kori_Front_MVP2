import CommentItem, { Comment } from '@/components/CommentItem';
import SortTabs, { SortKey } from '@/components/SortTabs';
import { useCreateComment } from '@/hooks/mutations/useCreateComment';
import { useLikeComment } from '@/hooks/mutations/useLikeComment';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { useUpdateComment } from '@/hooks/mutations/useUpdateComment';
import { usePostComments } from '@/hooks/queries/usePostComments';
import { usePostDetail } from '@/hooks/queries/usePostDetail';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import type { FlatList as RNFlatList } from 'react-native';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  TextInputProps,
  View
} from 'react-native';
import styled from 'styled-components/native';

const AV = require('@/assets/images/character1.png');
const DANGER = '#FF4D4F';

function parseDateFlexible(v?: unknown): Date | null {
  if (v == null) return null;
  let s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return new Date(parseFloat(s) * 1000);
  if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function formatCreatedYMD(v?: unknown): string {
  const d = parseDateFlexible(v);
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(d).replace(/-/g, '/');
  } catch {
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
  }
}

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
const EditInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => (
  <StyledEditInput ref={ref} {...props} />
));
EditInput.displayName = 'EditInput';

export default function PostDetailScreen() {
  const { id, focusCommentId, intent } = useLocalSearchParams<{
    id: string; focusCommentId?: string; intent?: string;
  }>();
  const postId = Number(id);

  const { data, isLoading, isError } = usePostDetail(
    Number.isFinite(postId) ? postId : undefined,
  );

  const [bookmarked, setBookmarked] = useState(false);
  const [likesOverride, setLikesOverride] = useState<number | null>(null);
  const [likedByMe, setLikedByMe] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideY = useRef(new Animated.Value(300)).current;

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const likeMutation = useToggleLike();
  const createCmt = useCreateComment(postId);

  // 정렬 키 & 댓글 좋아요 훅(키 일치)
  const [sort, setSort] = useState<SortKey>('new');
  const likeComment = useLikeComment(postId, sort);

  const [value, setValue] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const inputRef = useRef<RNTextInput>(null);
  const listRef = useRef<RNFlatList<Comment>>(null);

  // 댓글 리스트 (항상 배열 보장)
  const { data: commentsRaw } = usePostComments(
    Number.isFinite(postId) ? postId : undefined,
    sort,
  );
  const commentList: Comment[] = Array.isArray(commentsRaw)
    ? (commentsRaw as Comment[])
    : ((commentsRaw as any)?.items ?? []);

  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<RNTextInput>(null);

  const { mutateAsync: updateCommentMut } = useUpdateComment();

  // 연타 방지
  const likeBusyRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (intent === 'edit' && focusCommentId) {
      const target = commentList.find(c => String((c as any).id ?? (c as any).commentId) === String(focusCommentId));
      if (target) {
        const body =
          (target as any).content ??
          (target as any).comment ??
          (target as any).text ?? '';
        setEditText(String(body));
        setEditVisible(true);
        const t = setTimeout(() => editInputRef.current?.focus(), 350);
        return () => clearTimeout(t);
      }
    }
  }, [intent, focusCommentId, commentList]);

  useEffect(() => {
    if (!data) return;
    const liked =
      (data as any).likedByMe ??
      (data as any).isLike ??
      (data as any).isLiked ?? false;
    setLikedByMe(Boolean(liked));
  }, [data]);

  // ✅ 화면에서는 낙관적 업데이트를 하지 않는다 (훅이 전담)
  const toggleCommentLike = (comment: Comment) => {
    const cmtId = Number((comment as any).id ?? (comment as any).commentId);
    if (!Number.isFinite(cmtId)) return;

    if (likeBusyRef.current[cmtId]) return;
    likeBusyRef.current[cmtId] = true;

    const prevLiked = Boolean(
      (comment as any).likedByMe ?? (comment as any).isLiked ?? false
    );

    likeComment.mutate(
      { commentId: cmtId, liked: prevLiked },
      { onSettled: () => { likeBusyRef.current[cmtId] = false; } }
    );
  };

  const submit = () => {
    const text = value.trim();
    if (!text || !Number.isFinite(postId)) return;
    createCmt.mutate(
      { anonymous, comment: text },
      {
        onSuccess: () => {
          setValue('');
          Keyboard.dismiss();
          requestAnimationFrame(() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true }),
          );
        },
        onError: () => Alert.alert('Comment', 'Failed to post comment.'),
      },
    );
  };

  const openMenu = () => {
    setMenuVisible(true);
    slideY.setValue(300);
    Animated.timing(slideY, {
      toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  };
  const closeMenu = () =>
    new Promise<void>((resolve) => {
      Animated.timing(slideY, {
        toValue: 300, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }).start(() => { setMenuVisible(false); resolve(); });
    });

  if (isLoading) {
    return (
      <Safe>
        <Header>
          <Back onPress={() => router.back()}><AntDesign name="left" size={20} color="#fff" /></Back>
          <HeaderTitle>Post</HeaderTitle><RightPlaceholder />
        </Header>
        <Center><Dim>Loading…</Dim></Center>
      </Safe>
    );
  }
  if (isError || !data) {
    return (
      <Safe>
        <Header>
          <Back onPress={() => router.back()}><AntDesign name="left" size={20} color="#fff" /></Back>
          <HeaderTitle>Post</HeaderTitle><RightPlaceholder />
        </Header>
        <Center><Dim>Post not found.</Dim></Center>
      </Safe>
    );
  }

  const post = data;
  const author = (post as any).userName ?? (post as any).authorName ?? 'Unknown';
  const avatarSrc = post.userImageUrl ? { uri: post.userImageUrl } : AV;
  const createdRaw =
    (post as any).createdTime ?? (post as any).createdAt ?? (post as any).timestamp;
  const createdLabel = formatCreatedYMD(createdRaw);
  const firstImage = post.contentImageUrls?.[0];
  const serverLikeCount = post.likeCount ?? 0;
  const likeCount = likesOverride ?? serverLikeCount;
  const commentCount = post.commentCount ?? 0;
  const views = post.viewCount ?? 0;
  const body = post.content ?? '';

  const handleToggleLike = async () => {
    if (!Number.isFinite(postId) || likeMutation.isPending) return;
    const prevLiked = likedByMe;
    const delta = prevLiked ? -1 : +1;
    const prevCount = likesOverride ?? serverLikeCount;
    setLikesOverride(Math.max(0, prevCount + delta));
    setLikedByMe(!prevLiked);
    try {
      await likeMutation.mutateAsync({ postId, liked: prevLiked });
    } catch (e) {
      setLikesOverride(prevCount);
      setLikedByMe(prevLiked);
      console.log('[like error]', e);
    }
  };

  const onSubmitReport = () => {
    const text = reportText.trim();
    if (!text) { Alert.alert('Report', 'Please enter details.'); return; }
    Alert.alert('Report', 'Are you sure\nreport this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => { console.log('[report post]', { postId, text }); setReportOpen(false); } },
    ]);
  };

  const onSaveEdit = async () => {
    const text = editText.trim();
    if (!text) { Alert.alert('Edit', 'Please enter your comment.'); return; }
    if (!focusCommentId) { Alert.alert('Edit', 'Comment id missing.'); return; }

    try {
      await updateCommentMut({ commentId: Number(focusCommentId), content: text });
      setEditVisible(false);
    } catch (e) {
      console.log('[update comment] error', e);
      Alert.alert('Edit', 'Failed to save changes.');
    }
  };

  return (
    <Safe>
      <Header>
        <Back onPress={() => router.back()}><AntDesign name="left" size={20} color="#fff" /></Back>
        <HeaderTitle>Post</HeaderTitle><RightPlaceholder />
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList<Comment>
          ref={listRef}
          data={commentList}
          keyExtractor={(it) => String((it as any).id ?? (it as any).commentId)}
          renderItem={({ item }) => (
            <CommentItem
              data={item}
              onPressLike={() => toggleCommentLike(item)}
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
                  <SmallFlag onPress={() => setBookmarked(v => !v)} hitSlop={8}>
                    <MaterialIcons name="bookmark" size={20} color={bookmarked ? '#30F59B' : '#8a8a8a'} />
                  </SmallFlag>
                </Row>

                {!!firstImage && <Img source={{ uri: firstImage }} resizeMode="cover" />}

                <Body>{body}</Body>

                <Footer>
                  <Act onPress={handleToggleLike} disabled={likeMutation.isPending}>
                    <AntDesign name={likedByMe ? 'like1' : 'like2'} size={16} color={likedByMe ? '#30F59B' : '#cfd4da'} />
                    <ActText>{likeCount}</ActText>
                  </Act>
                  <Act>
                    <AntDesign name="message1" size={16} color="#cfd4da" />
                    <ActText>{commentCount}</ActText>
                  </Act>
                  <Grow />
                  <MoreBtn onPress={openMenu} hitSlop={8}>
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
              placeholderTextColor="#BFC3C5"
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={submit}
            />
            <AnonToggle onPress={() => setAnonymous(v => !v)}>
              <AnonLabel>Anonymous</AnonLabel>
              <Check $active={anonymous}>{anonymous && <AntDesign name="check" size={14} color="#ffffff" />}</Check>
            </AnonToggle>
          </Composer>

          <SendBtn onPress={submit} hitSlop={8}>
            <Feather name="send" size={22} color="#D9D9D9" />
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
            <SheetItem onPress={async () => { setMenuVisible(false); setReportText(''); setReportOpen(true); }}>
              <SheetIcon><MaterialIcons name="outlined-flag" size={18} color={DANGER} /></SheetIcon>
              <SheetLabel $danger>Report This Post</SheetLabel>
            </SheetItem>
            <SheetItem onPress={async () => {
              setMenuVisible(false);
              const userId = (post as any).userId ?? (post as any).authorId;
              Alert.alert('Report', 'Are you sure\nreport this user?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report', style: 'destructive', onPress: () => console.log('[report user]', userId) },
              ]);
            }}>
              <SheetIcon><MaterialIcons name="person-outline" size={18} color={DANGER} /></SheetIcon>
              <SheetLabel $danger>Report This User</SheetLabel>
            </SheetItem>
            <SheetDivider />
            <SheetItem onPress={() => setMenuVisible(false)}>
              <SheetIcon><AntDesign name="close" size={18} color="#cfd4da" /></SheetIcon>
              <SheetLabel>Cancel</SheetLabel>
            </SheetItem>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={reportOpen} transparent animationType="fade" statusBarTranslucent presentationStyle="overFullScreen" onRequestClose={() => setReportOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Pressable onPress={() => setReportOpen(false)} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Dialog>
            <DialogHeader>
              <DialogTitle>
                <MaterialCommunityIcons name="flag-variant" size={18} color={DANGER} />
                <DialogTitleText $danger>  Report This Post</DialogTitleText>
              </DialogTitle>
              <CloseBtn onPress={() => setReportOpen(false)}>
                <AntDesign name="close" size={18} color="#cfd4da" />
              </CloseBtn>
            </DialogHeader>

            <DialogTextarea
              value={reportText}
              onChangeText={setReportText}
              placeholder="Tell us what’s wrong with this post…"
              placeholderTextColor="#858b90"
              multiline
              textAlignVertical="top"
            />

            <SubmitBtn onPress={onSubmitReport}>
              <SubmitText>Submit</SubmitText>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Pressable style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} onPress={() => setEditVisible(false)} />
          <EditBox>
            <EditHeader>
              <EditTitle>
                <AntDesign name="edit" size={16} color="#cfd4da" />
                <EditTitleText>  Edit My Comments</EditTitleText>
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
  font-family: 'PlusJakartaSans_700Bold';
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

const SmallFlag = styled.Pressable`
  padding: 6px;
`;

const Img = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  margin-top: 10px;
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

const SendBtn = styled.Pressable`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
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

const SubmitBtn = styled.Pressable`
  background: #ff4d4f;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
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
