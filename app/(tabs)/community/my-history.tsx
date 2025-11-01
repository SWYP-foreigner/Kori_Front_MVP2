import Icon from '@/components/common/Icon';
import { useDeleteComment } from '@/hooks/mutations/useDeleteComment';
import { useMyComments } from '@/hooks/queries/useMyComments';
import { useDeletePost, useMyPosts } from '@/hooks/queries/useMyPosts';
import { theme } from '@/src/styles/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ListRenderItem, Modal, Platform, Pressable, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

type Tab = 'post' | 'comment';

type PostRow = {
  id: string;
  author: string;
  avatar: any;
  createdAt: string;
  body: string;
  views: number;
  likes: number;
  comments: number;
  liked?: boolean;
};

type CommentRow = {
  id: string;
  postId: string;
  myText: string;
  parentSnippet: string;
  createdAt: string;
};

const AV = require('@/assets/images/character1.png');

function toDateLabel(v?: unknown): string {
  if (v == null) return '';
  const d = new Date(v as any);
  if (!isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return `${s.slice(5, 7)}/${s.slice(8, 10)}/${s.slice(0, 4)}`;
  return s;
}
function pickBody(row: any) {
  const raw = row?.contentPreview ?? row?.content ?? row?.title ?? '';
  return String(raw).replace(/\s+/g, ' ').trim();
}

export default function MyHistoryScreen() {
  const [tab, setTab] = useState<Tab>('post');

  const {
    items: myPostItems,
    isLoading: isLoadingPosts,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPosts(20);
  const deletePostMutation = useDeletePost();

  const posts: PostRow[] = useMemo(
    () =>
      (myPostItems ?? []).map((row: any) => ({
        id: String(row.postId),
        author: row.authorName || 'Unknown',
        avatar: AV,
        createdAt: toDateLabel(row.createdAt),
        body: pickBody(row),
        views: Number(row.viewCount ?? 0),
        likes: Number(row.likeCount ?? 0),
        comments: Number(row.commentCount ?? 0),
        liked: Boolean(row.isLiked ?? row.likedByMe ?? false),
      })),
    [myPostItems],
  );

  const {
    items: myCommentItems,
    isLoading: isLoadingComments,
    isRefetching: isRefetchingComments,
    refetch: refetchComments,
    fetchNextPage: fetchNextComments,
    hasNextPage: hasNextComments,
    isFetchingNextPage: isFetchingNextComments,
  } = useMyComments(20);

  const deleteCommentMutation = useDeleteComment();

  const comments: CommentRow[] = useMemo(
    () =>
      (myCommentItems ?? []).map((row: any) => ({
        id: String(row.commentId),
        postId: String(row.postId ?? row.parentPostId ?? ''),
        myText: String(row.commentContent ?? '').trim(),
        parentSnippet: String(row.postContent ?? '').trim(),
        createdAt: toDateLabel(row.createdAt),
      })),
    [myCommentItems],
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const openSheet = (target: { type: 'post' | 'comment'; id: string }) => {
    setSheetTarget(target);
    setSheetOpen(true);
  };
  const closeSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSheetTarget(null), 150);
  };

  const onEdit = () => {
    if (!sheetTarget) return;

    if (sheetTarget.type === 'post') {
      const target = posts.find((p) => p.id === sheetTarget.id);
      closeSheet();
      router.push({
        pathname: '/community/write',
        params: { mode: 'edit', postId: sheetTarget.id, initial: target?.body ?? '' },
      });
      return;
    }

    const c = comments.find((x) => x.id === sheetTarget.id);
    closeSheet();
    if (!c?.postId) return;

    router.push({
      pathname: '/community/[id]',
      params: {
        id: c.postId,
        focusCommentId: c.id,
        intent: 'edit',
      },
    });
  };

  const onDelete = () => {
    if (!sheetTarget) return;
    const isPost = sheetTarget.type === 'post';
    const title = isPost
      ? 'Are you sure you want to delete that post?'
      : 'Are you sure you want to delete that comment?';

    closeSheet();
    Alert.alert(
      title,
      'After deleting it,\nyou cannot restore it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isPost) {
                await deletePostMutation.mutateAsync(Number(sheetTarget.id));
                showToast('1 Post deleted');
                refetchPosts();
              } else {
                await deleteCommentMutation.mutateAsync(Number(sheetTarget.id));
                showToast('1 Comment deleted');
                refetchComments();
              }
            } catch (e) {
              console.error('[delete] error', e);
              showToast('Delete failed');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const goPostDetail = (postId: string) => {
    if (!postId) return;
    router.push({ pathname: '/community/[id]', params: { id: postId } });
  };

  const renderPost: ListRenderItem<PostRow> = ({ item }) => {
    const hasDate = !!String(item.createdAt || '').trim();
    const likeIconType = item.liked ? 'thumbsUpSelected' : 'thumbsUpNonSelected';

    return (
      <RowPress onPress={() => goPostDetail(item.id)}>
        <TopRow>
          <InlineRow>
            {hasDate && <PostDateText>{item.createdAt}</PostDateText>}
            {hasDate && <Dot>·</Dot>}
            <Icon type="eye" size={16} color={theme.colors.gray.gray_1} />
            <Sub style={{ marginLeft: 6 }}>{item.views}</Sub>
          </InlineRow>

          <MoreBtn
            onPress={(e: any) => {
              e?.stopPropagation?.();
              openSheet({ type: 'post', id: item.id });
            }}
          >
            <Icon type="eclipsisGaro" size={16} color={theme.colors.gray.gray_1} />
          </MoreBtn>
        </TopRow>

        {item.body ? <PostTitle numberOfLines={1}>{item.body}</PostTitle> : null}

        <ActionRow>
          <Act>
            <Icon type={likeIconType} size={20}  />
          <ActText>{item.likes}</ActText>
          </Act>
          <Act>
            <Icon type="comment" size={20} color={theme.colors.gray.gray_1} />
            <ActText>{item.comments}</ActText>
          </Act>
        </ActionRow>
      </RowPress>
    );
  };

  const renderComment: ListRenderItem<CommentRow> = ({ item }) => (
    <RowPress onPress={() => router.push({ pathname: '/community/[id]', params: { id: item.postId } })}>
      <TopRow>
        <DateText>{item.createdAt}</DateText>
        <MoreBtn
          onPress={(e: any) => {
            e?.stopPropagation?.();
            openSheet({ type: 'comment', id: item.id });
          }}
        >
          <Icon type="eclipsisGaro" size={20} color={theme.colors.gray.gray_1} />
        </MoreBtn>
      </TopRow>
      {item.myText ? <CommentTitle numberOfLines={1}>{item.myText}</CommentTitle> : null}
      {item.parentSnippet ? <ParentSnippet numberOfLines={1}>{item.parentSnippet}</ParentSnippet> : null}
    </RowPress>
  );

  const data = useMemo(() => (tab === 'post' ? posts : comments), [tab, posts, comments]);

  const onEndReached = () => {
    if (tab === 'post') {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    } else {
      if (hasNextComments && !isFetchingNextComments) fetchNextComments();
    }
  };

  const isLoading = tab === 'post' ? isLoadingPosts : isLoadingComments;
  const isRefetching = tab === 'post' ? isRefetchingPosts : isRefetchingComments;
  const isDeleting = deletePostMutation.isPending || deleteCommentMutation.isPending;

  return (
    <Safe>
      <Header>
        <Back onPress={() => router.back()}>
          <Icon type="previous" size={24} color={theme.colors.primary.white} />
        </Back>
        <HeaderTitle>My History</HeaderTitle>
        <RightPlaceholder />
      </Header>

      <TabsWrap>
        <TabsRow>
          <TabItem active={tab === 'post'} onPress={() => setTab('post')}>
            <TabText active={tab === 'post'}>My Post</TabText>
          </TabItem>
          <TabItem active={tab === 'comment'} onPress={() => setTab('comment')}>
            <TabText active={tab === 'comment'}>Comments</TabText>
          </TabItem>
        </TabsRow>
        <TabsBottomLine />
      </TabsWrap>

      <List
        data={data}
        keyExtractor={(it: PostRow | CommentRow) => it.id}
        renderItem={tab === 'post' ? (renderPost as any) : (renderComment as any)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching || isDeleting}
            onRefresh={tab === 'post' ? refetchPosts : refetchComments}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={
          <Empty>
            <EmptyText>{isLoading ? 'Loading...' : 'No items.'}</EmptyText>
          </Empty>
        }
      />

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={closeSheet}>
        <SheetBackdrop onPress={closeSheet} />
        <Sheet>
          <SheetBtn onPress={onEdit} disabled={isDeleting}>
            <SheetIcon>
              <Icon type="edit" size={20} color={theme.colors.primary.white} />
            </SheetIcon>
            <SheetText>Edit</SheetText>
          </SheetBtn>
          <SheetBtn onPress={onDelete} disabled={isDeleting}>
            <SheetIcon>
              <Icon type="trashCan" size={20} color={theme.colors.secondary.red} />
            </SheetIcon>
            <SheetText style={{ color: '#ff6b6b' }}>{isDeleting ? 'Deleting...' : 'Delete'}</SheetText>
          </SheetBtn>
          <SheetBtn onPress={closeSheet} disabled={isDeleting}>
            <SheetIcon>
              <Icon type="close" size={24} color={theme.colors.gray.lightGray_1} />
            </SheetIcon>
            <SheetText>Cancel</SheetText>
          </SheetBtn>
        </Sheet>
      </Modal>

      {toast && (
        <ToastWrap pointerEvents="none">
          <ToastInner>
            <AntDesign name="lock" size={12} color="#cfd4da" style={{ marginRight: 6 }} />
            <ToastText>{toast}</ToastText>
          </ToastInner>
        </ToastWrap>
      )}
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
`;

const RightPlaceholder = styled.View`
  width: 40px;
`;

const TabsWrap = styled.View`
  position: relative;
  padding: 0 16px;
  margin-top: 4px;
`;

const TabsRow = styled.View`
  flex-direction: row;
`;

const TabItem = styled.Pressable<{ active: boolean }>`
  flex: 1;
  align-items: center;
  padding: 12px 6px;
  border-bottom-width: 2px;
  border-bottom-color: ${({ active }) => (active ? '#30F59B' : 'transparent')};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#cfcfcf')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_500SemiBold';
`;

const TabsBottomLine = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: #212325;
`;

const RowPress = styled.Pressable`
  padding: 14px 16px 12px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;

const PostTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Avatar = styled.Image`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background: #2a2b2c;
`;

const Meta = styled.View`
  flex: 1;
  margin-left: 10px;
`;

const Author = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const SubRow = styled.View`
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

const MoreBtn = styled.Pressable`
  padding: 6px;
`;

const Body = styled.Text`
  color: #e6e9ec;
  margin-top: 10px;
  font-size: 14px;
`;

const ActionRow = styled.View`
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

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DateText = styled.Text`
  flex: 1;
  color: #9aa0a6;
  font-size: 11px;
`;

const CommentTitle = styled.Text`
  margin-top: 8px;
  color: #ffffff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_300Bold';
`;

const ParentSnippet = styled.Text`
  margin-top: 8px;
  color: #9aa0a6;
  font-size: 13px;
`;

const Empty = styled.View`
  padding: 32px 16px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: #cfd4da;
`;

const SheetBackdrop = styled(Pressable)`
  flex: 1;
  background: rgba(0, 0, 0, 0.35);
`;

const Sheet = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #111213;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 8px 10px 20px 10px;
  ${Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -6 },
    },
    android: { elevation: 8 },
  })}
`;

const SheetBtn = styled.Pressable<{ disabled?: boolean }>`
  height: 52px;
  border-radius: 12px;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
  margin: 6px 12px 0 12px;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

const SheetIcon = styled.View`
  width: 24px;
  align-items: center;
`;

const SheetText = styled.Text`
  color: #cfd4da;
  font-size: 15px;
  margin-left: 4px;
`;

const ToastWrap = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  align-items: center;
`;

const ToastInner = styled.View`
  background: #2a2b2c;
  border-radius: 8px;
  padding: 6px 10px;
  flex-direction: row;
  align-items: center;
`;

const ToastText = styled.Text`
  color: #cfd4da;
  font-size: 12px;
`;

const List = styled.FlatList<any>``;

const InlineRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PostDateText = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
  /* flex 없음: 내용만큼만 차지 */
`;

const PostTitle = styled.Text`
  margin-top: 8px;
  color: #ffffff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_300Bold';
`;
