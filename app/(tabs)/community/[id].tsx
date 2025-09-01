import CommentItem, { Comment } from '@/components/CommentItem';
import SortTabs, { SortKey } from '@/components/SortTabs';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';
import { usePostDetail } from '@/hooks/queries/usePostDetail';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  if (/^\d+(\.\d+)?$/.test(s)) { const num = parseFloat(s); return new Date(num * 1000); }
  if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function pad2(n: number) { return n < 10 ? `0${n}` : String(n); }
function formatCreatedYMD(v?: unknown): string {
  const d = parseDateFlexible(v);
  if (!d) return '';
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
    return fmt.format(d).replace(/-/g, '/');
  } catch { return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`; }
}

const MOCK_COMMENTS: Comment[] = [];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);

  const { data, isLoading, isError } = usePostDetail(Number.isFinite(postId) ? postId : undefined);

  const [bookmarked, setBookmarked] = useState(false);
  const [likesOverride, setLikesOverride] = useState<number | null>(null);
  const [likedByMe, setLikedByMe] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideY = useRef(new Animated.Value(300)).current;

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const likeMutation = useToggleLike();

  const [sort, setSort] = useState<SortKey>('new');
  const [value, setValue] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const inputRef = useRef<RNTextInput>(null);
  const listRef = useRef<RNFlatList<Comment>>(null);

  useEffect(() => {
    if (!data) return;
    const liked = (data as any).likedByMe ?? (data as any).isLike ?? (data as any).isLiked ?? false;
    setLikedByMe(Boolean(liked));
  }, [data]);

  const comments = useMemo(() => {
    const arr = MOCK_COMMENTS.slice();
    if (sort === 'new') arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else arr.sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0));
    return arr;
  }, [sort]);

  const submit = () => {
    if (!value.trim()) return;
    const c: Comment = {
      id: String(Date.now()),
      author: anonymous ? 'Anonymous' : 'You',
      avatar: AV,
      createdAt: new Date().toISOString().slice(0, 10),
      body: value.trim(),
      likes: 0,
      isChild: false,
      hotScore: 0,
      anonymous,
    };
    MOCK_COMMENTS.unshift(c);
    setValue('');
    Keyboard.dismiss();
    requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
  };

  const openMenu = () => {
    setMenuVisible(true);
    slideY.setValue(300);
    Animated.timing(slideY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const closeMenu = () =>
    new Promise<void>((resolve) => {
      Animated.timing(slideY, {
        toValue: 300,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }).start(() => {
        setMenuVisible(false);
        resolve();
      });
    });

  if (isLoading) {
    return (
      <Safe>
        <Header>
          <Back onPress={() => router.back()}><AntDesign name="left" size={20} color="#fff" /></Back>
          <HeaderTitle>Post</HeaderTitle>
          <RightPlaceholder />
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
          <HeaderTitle>Post</HeaderTitle>
          <RightPlaceholder />
        </Header>
        <Center><Dim>Post not found.</Dim></Center>
      </Safe>
    );
  }

  const post = data;
  const author = (post as any).userName ?? (post as any).authorName ?? 'Unknown';
  const avatarSrc = post.userImageUrl ? { uri: post.userImageUrl } : AV;

  const createdRaw = (post as any).createdTime ?? (post as any).createdAt ?? (post as any).timestamp;
  const createdLabel = formatCreatedYMD(createdRaw);

  const firstImage = post.contentImageUrls?.[0];
  const serverLikeCount = post.likeCount ?? 0;
  const likeCount = likesOverride ?? serverLikeCount;
  const commentCount = post.commentCount ?? 0;
  const views = post.viewCount ?? 0;
  const body = post.content ?? '';

  const handleToggleLike = async () => {
    if (!Number.isFinite(postId)) return;
    if (likeMutation.isPending) return;
    if (likedByMe) return;

    const prev = likesOverride ?? serverLikeCount;
    setLikesOverride(prev + 1);
    setLikedByMe(true);

    try { await likeMutation.mutateAsync(postId); }
    catch (e) {
      setLikesOverride(prev);
      setLikedByMe(false);
      console.log('[like error]', e);
    }
  };

  const confirmReportPost = (text: string) => {
    Alert.alert(
      'Report',
      'Are you sure\nreport this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            // 실제 신고 처리 (API 연동 위치)
            console.log('[report post]', { postId, text });
            setReportOpen(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onSubmitReport = () => {
    const text = reportText.trim();
    if (!text) {
      Alert.alert('Report', 'Please enter details.');
      return;
    }
    confirmReportPost(text);
  };

  const onReportPost = async () => {
    await closeMenu();
    setReportText('');
    setReportOpen(true);
  };

  const onReportUser = async () => {
    await closeMenu();
    const userId = (post as any).userId ?? (post as any).authorId;
    Alert.alert(
      'Report',
      'Are you sure\nreport this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => console.log('[report user]', userId) },
      ],
      { cancelable: true }
    );
  };

  return (
    <Safe>
      <Header>
        <Back onPress={() => router.back()}><AntDesign name="left" size={20} color="#fff" /></Back>
        <HeaderTitle>Post</HeaderTitle>
        <RightPlaceholder />
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList<Comment>
          ref={listRef}
          data={comments}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <CommentItem data={item} />}
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
                    <MaterialIcons
                      name={bookmarked ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={bookmarked ? '#30F59B' : '#8a8a8a'}
                    />
                  </SmallFlag>
                </Row>

                {!!firstImage && <Img source={{ uri: firstImage }} resizeMode="cover" />}

                <Body>{body}</Body>

                {/* 하단 액션 */}
                <Footer>
                  <Act onPress={handleToggleLike} disabled={likeMutation.isPending || likedByMe}>
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
            <Input
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
            <SheetItem onPress={onReportPost}>
              <SheetIcon><MaterialIcons name="outlined-flag" size={18} color={DANGER} /></SheetIcon>
              <SheetLabel $danger>Report This Post</SheetLabel>
            </SheetItem>

            <SheetItem onPress={onReportUser}>
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

      <Modal
        visible={reportOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setReportOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Pressable
            onPress={() => setReportOpen(false)}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
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

const StyledRNInput = styled(RNTextInput)`
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  padding: 0;
  background: transparent;
`;

const Input = React.forwardRef<RNTextInput, TextInputProps>(
  ({ placeholderTextColor = '#BFC3C5', ...rest }, ref) => (
    <StyledRNInput ref={ref} placeholderTextColor={placeholderTextColor} {...rest} />
  )
);
Input.displayName = 'Input';

const AnonToggle = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
`;

const AnonLabel = styled.Text`
  color: #CCCFD5;
  font-size: 14px;
  margin-right: 8px;
  font-family: 'PlusJakartaSans_Light';
`;

const Check = styled.View<{ $active?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border-width: 1.1px;
  border-color: #CCCFD5;
  background: ${({ $active }) => ($active ? '#30F59B' : 'transparent')};
  align-items: center;
  justify-content: center;
`;

const SendBtn = styled.Pressable`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

/* ---------- Action Sheet styled ---------- */
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
  color: ${({ $danger }) => ($danger ? DANGER : '#e6e9ed')};
  font-size: 16px;
`;

const SheetDivider = styled.View`
  height: 1px;
  background: #2c2f33;
  margin: 4px 0;
`;

/* ---------- Report Dialog styled ---------- */
const Dialog = styled.View`
  width: 100%;
  max-width: 360px;
  background: #2A2B2C;
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
  color: ${({ $danger }) => ($danger ? DANGER : '#E7EAED')};
  font-size: 14px;
  font-weight: 700;
`;

const CloseBtn = styled.Pressable`
  padding: 4px;
`;

/* ✅ 높이 증가 */
const DialogTextarea = styled.TextInput`
  min-height: 220px;
  border-radius: 8px;
  padding: 12px;
  background: #1f2021;
  color: #E7EAED;
  font-size: 14px;
  border-width: 1px;
  border-color: #3a3d40;
`;

const SubmitBtn = styled.Pressable`
  background: ${DANGER};
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
