import api from '@/api/axiosInstance';
import { removeBookmark as apiRemoveBookmark } from '@/api/community/bookmarks';
import { usePostUI } from '@/src/store/usePostUI';
import { keyToUrl } from '@/utils/image';

import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  View,
  type FlatListProps
} from 'react-native';
import styled from 'styled-components/native';


const AV = require('@/assets/images/character1.png');

type ApiItem = {
  postId?: number;
  id?: number;
  bookmarkId?: number;

  authorName?: string;
  content?: string;
  likeCount?: number;
  commentCount?: number;
  checkCount?: number;
  viewCount?: number;
  userImageUrl?: string;
  userImage?: string;
  postImages?: string[];
  createdAt?: string | number;
  createdTime?: string | number;
};

type ApiResp = {
  success: boolean;
  data: {
    items: ApiItem[];
    hasNext: boolean;
    nextCursor?: string;
  };
  timestamp?: string;
};

type Row = {
  postId?: number;
  displayId: string;
  author: string;
  createdAtLabel: string;
  views: number;
  body: string;
  likes: number;
  comments: number;
  avatar: any;
};

export default function BookmarksScreen() {
  const [items, setItems] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { setBookmarked } = usePostUI();

  const busyRef = useRef<Record<string, boolean>>({});
  const loadingRef = useRef(false);

  const toAbs = (u?: string) => (u ? (u.startsWith('http') ? u : keyToUrl(u)) : undefined);

  const mapItem = useCallback((raw: ApiItem, respTs?: string): Row => {
    const postId =
      (raw.postId as number | undefined) ??
      (typeof raw.id === 'number' ? raw.id : undefined);

    const avatarUrl = toAbs(raw.userImageUrl ?? raw.userImage);

    return {
      postId,
      displayId: String(raw.bookmarkId ?? postId ?? cryptoRandom()),
      author: (raw.authorName && String(raw.authorName).trim()) || 'Anonymity',
      createdAtLabel: toDateLabel(raw.createdAt ?? raw.createdTime ?? respTs),
      views: Number((raw.viewCount ?? raw.checkCount ?? 0) as number),
      body: (raw.content && String(raw.content)) || '',
      likes: Number(raw.likeCount ?? 0),
      comments: Number(raw.commentCount ?? 0),
      avatar: avatarUrl ? { uri: avatarUrl } : AV,
    };
  }, []);

  const fetchPage = useCallback(async (after?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { size: 20, ...(after ? { cursor: after } : {}) };
      const { data } = await api.get<ApiResp>('/api/v1/my/bookmarks', { params });
      const respTs = data?.timestamp;
      const list = (data?.data?.items ?? []).map((it) => mapItem(it, respTs));

      setItems(prev => {
        if (!after) return list;
        const seen = new Set(prev.map(r => r.displayId));
        const appended = list.filter(r => !seen.has(r.displayId));
        return [...prev, ...appended];
      });

      setHasNext(Boolean(data?.data?.hasNext));
      setCursor(data?.data?.nextCursor ?? undefined);
    } catch (e) {
      console.log('[bookmarks:list] error', e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [mapItem]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setItems([]);
    setCursor(undefined);
    setHasNext(true);
    fetchPage(undefined);
  }, [fetchPage]);

  useEffect(() => {
    fetchPage(undefined);
  }, [fetchPage]);

  const openPost = (row: Row) => {
    if (!row.postId) return;
    router.push({ pathname: '/community/[id]', params: { id: String(row.postId) } });
  };

  const removeOne = async (row: Row) => {
    if (!row.postId) return;
    const key = row.displayId;
    if (busyRef.current[key]) return;
    busyRef.current[key] = true;

    const before = items;
    setItems(prev => prev.filter(r => r.displayId !== key));
    setBookmarked(row.postId, false);

    try {
      await apiRemoveBookmark(row.postId);
    } catch (e) {
      console.log('[bookmarks:remove] error', e);
      setItems(before);
      setBookmarked(row.postId, true);
    } finally {
      busyRef.current[key] = false;
    }
  };

  const renderItem: ListRenderItem<Row> = ({ item }) => (
    <Cell activeOpacity={item.postId ? 0.8 : 1} onPress={() => openPost(item)}>
      <RowTop>
        <RowLeft>
          <Avatar source={item.avatar} />
          <Meta>
            <Author>{item.author}</Author>
            <MetaRow>
              <Sub>{item.createdAtLabel}</Sub>
              <Dot>·</Dot>
              <AntDesign name="eyeo" size={12} color="#9aa0a6" />
              <Sub style={{ marginLeft: 6 }}>{item.views}</Sub>
            </MetaRow>
          </Meta>
        </RowLeft>

        <IconBtn
          onPress={(e: any) => {
            e.stopPropagation();
            removeOne(item);
          }}
          hitSlop={8}
        >
          <MaterialIcons name="bookmark" size={18} color="#30F59B" />
        </IconBtn>
      </RowTop>

      <Body numberOfLines={3}>{item.body}</Body>

      <Footer>
        <FootItem>
          <AntDesign name="like2" size={16} color="#cfd4da" />
          <FootText>{item.likes}</FootText>
        </FootItem>
        <FootItem style={{ marginLeft: 18 }}>
          <AntDesign name="message1" size={16} color="#cfd4da" />
          <FootText>{item.comments}</FootText>
        </FootItem>

        <MoreBtn>
          <AntDesign name="ellipsis1" size={16} color="#9aa0a6" />
        </MoreBtn>
      </Footer>

      <Divider />
    </Cell>
  );

  const listEmpty = useMemo(
    () => (
      <Empty>
        <EmptyText>No bookmarked posts.</EmptyText>
      </Empty>
    ),
    []
  );

  return (
    <Safe>
      <Header>
        <Back onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </Back>
        <Title>Bookmarked</Title>
        <RightSpace />
      </Header>

      <List
        data={items}
        keyExtractor={(it: Row) => it.displayId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? listEmpty : null}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && hasNext && cursor) fetchPage(cursor);
        }}
        ListFooterComponent={
          loading ? (
            <FooterLoading>
              <ActivityIndicator />
            </FooterLoading>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </Safe>
  );
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2);
}

function toDateLabel(raw?: unknown): string {
  if (raw == null) return '';
  const s = String(raw);
  const d = !s.includes('T') && s.includes(' ') ? new Date(s.replace(' ', 'T')) : new Date(s);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d).replace(/-/g, '/');
  } catch {
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  }
}

const Safe = styled.SafeAreaView`flex: 1; background: #1D1E1F;`;
const Header = styled.View`height: 48px; padding: 0 12px; flex-direction: row; align-items: center; justify-content: space-between;`;
const Back = styled.Pressable`width: 40px; align-items: flex-start;`;
const Title = styled.Text`color: #ffffff; font-size: 18px; font-family: 'PlusJakartaSans_500Bold';`;
const RightSpace = styled.View`width: 40px;`;

const List = styled(FlatList as React.ComponentType<FlatListProps<Row>>)``;

const Cell = styled(TouchableOpacity)`padding: 12px 16px 8px 16px;`;
const RowTop = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const RowLeft = styled.View`flex-direction: row; align-items: center; flex: 1; padding-right: 8px;`;

const Avatar = styled.Image`width: 36px; height: 36px; border-radius: 18px; background: #2a2b2c;`;
const Meta = styled.View`margin-left: 10px; flex: 1;`;
const Author = styled.Text`color: #ffffff; font-size: 13px; font-family: 'PlusJakartaSans_700Bold';`;
const MetaRow = styled.View`flex-direction: row; align-items: center; margin-top: 2px;`;
const Sub = styled.Text`color: #9aa0a6; font-size: 11px;`;
const Dot = styled.Text`color: #9aa0a6; margin: 0 6px;`;

const IconBtn = styled.Pressable`padding: 6px;`;

const Body = styled.Text`color: #d9dcdf; font-size: 14px; line-height: 20px; margin-top: 10px;`;

const Footer = styled.View`margin-top: 10px; margin-bottom: 8px; flex-direction: row; align-items: center;`;
const FootItem = styled.View`flex-direction: row; align-items: center;`;
const FootText = styled.Text`color: #cfd4da; margin-left: 6px; font-size: 12px;`;
const MoreBtn = styled(View)`margin-left: auto;`;

const Divider = styled.View`height: 1px; background: #222426; margin-top: 10px;`;

const FooterLoading = styled.View`padding: 16px 0;`;

const Empty = styled.View`padding: 40px 16px; align-items: center;`;
const EmptyText = styled.Text`color: #cfd4da; font-size: 14px;`;
