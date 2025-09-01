import CommentItem, { Comment } from '@/components/CommentItem';
import SortTabs, { SortKey } from '@/components/SortTabs';
import { usePostDetail } from '@/hooks/queries/usePostDetail';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import type { FlatList as RNFlatList } from 'react-native';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TextInputProps
} from 'react-native';
import styled from 'styled-components/native';

const AV = require('@/assets/images/character1.png');

function parseDateFlexible(v?: unknown): Date | null {
  if (v == null) return null;
  let s = String(v).trim();

  if (/^\d+(\.\d+)?$/.test(s)) {
    const num = parseFloat(s);
    return new Date(num * 1000);
  }

  if (!s.includes('T') && s.includes(' ')) s = s.replace(' ', 'T');

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatCreatedYMD(v?: unknown): string {
  const d = parseDateFlexible(v);
  if (!d) return '';
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(d).replace(/-/g, '/');
  } catch {
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
  }
}

const MOCK_COMMENTS: Comment[] = [];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);

  const { data, isLoading, isError } = usePostDetail(
    Number.isFinite(postId) ? postId : undefined
  );

  const [bookmarked, setBookmarked] = useState(false);
  const [likesOverride, setLikesOverride] = useState<number | null>(null);

  const [sort, setSort] = useState<SortKey>('new');
  const [value, setValue] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const inputRef = useRef<RNTextInput>(null);
  const listRef = useRef<RNFlatList<Comment>>(null);

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
    requestAnimationFrame(() =>
      listRef.current?.scrollToOffset({ offset: 0, animated: true })
    );
  };

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

  const post = data;
  const author =
    (post as any).userName ??
    (post as any).authorName ??
    'Unknown';

  const avatarSrc = post.userImageUrl ? { uri: post.userImageUrl } : AV;

  const createdRaw =
    (post as any).createdTime ??
    (post as any).createdAt ??
    (post as any).timestamp;

  const createdLabel = formatCreatedYMD(createdRaw);

  const firstImage = post.contentImageUrls?.[0];
  const likeCount = likesOverride ?? post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const views = post.viewCount ?? 0;
  const body = post.content ?? '';

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
                  <SmallFlag onPress={() => setBookmarked((v) => !v)}>
                    <MaterialIcons
                      name={bookmarked ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={bookmarked ? '#30F59B' : '#8a8a8a'}
                    />
                  </SmallFlag>
                </Row>

                {!!firstImage && (
                  <Img source={{ uri: firstImage }} resizeMode="cover" />
                )}

                <Body>{body}</Body>

                <Footer>
                  <Act
                    onPress={() =>
                      setLikesOverride((v) => (v ?? post.likeCount ?? 0) + 1)
                    }
                  >
                    <AntDesign name="like2" size={16} color="#30F59B" />
                    <ActText>{likeCount}</ActText>
                  </Act>
                  <Act>
                    <AntDesign name="message1" size={16} color="#cfd4da" />
                    <ActText>{commentCount}</ActText>
                  </Act>
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
            <AnonToggle onPress={() => setAnonymous((v) => !v)}>
              <AnonLabel>Anonymous</AnonLabel>
              <Check $active={anonymous}>
                {anonymous && (
                  <AntDesign name="check" size={14} color="#ffffff" />
                )}
              </Check>
            </AnonToggle>
          </Composer>

          <SendBtn onPress={submit} hitSlop={8}>
            <Feather name="send" size={22} color="#D9D9D9" />
          </SendBtn>
        </InputBar>
      </KeyboardAvoidingView>
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

const Act = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`;

const ActText = styled.Text`
  color: #cfd4da;
  margin-left: 6px;
  font-size: 12px;
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
    <StyledRNInput
      ref={ref}
      placeholderTextColor={placeholderTextColor}
      {...rest}
    />
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
