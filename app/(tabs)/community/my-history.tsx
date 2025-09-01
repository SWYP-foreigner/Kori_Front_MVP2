import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    ListRenderItem,
    Modal,
    Platform,
    Pressable
} from 'react-native';
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
};

type CommentRow = {
    id: string;
    myText: string;
    parentSnippet: string;
    createdAt: string;
};

const AV = require('@/assets/images/character1.png');

const MOCK_POSTS: PostRow[] = [
    {
        id: 'p1',
        author: 'Shotaro',
        avatar: AV,
        createdAt: '2025-08-14',
        body: 'Hi! I came to Korea on a working holiday...',
        views: 999,
        likes: 999,
        comments: 999,
    },
    {
        id: 'p2',
        author: 'Shotaro',
        avatar: AV,
        createdAt: '2025-08-14',
        body: 'Hi! I came to Korea on a working holiday...',
        views: 999,
        likes: 999,
        comments: 999,
    },
    {
        id: 'p3',
        author: 'Shotaro',
        avatar: AV,
        createdAt: '2025-08-14',
        body: 'Hi! I came to Korea on a working holiday...',
        views: 999,
        likes: 999,
        comments: 999,
    },
];

const MOCK_COMMENTS: CommentRow[] = [
    {
        id: 'c1',
        myText: 'My comment ...',
        parentSnippet: "Someone else’s writing",
        createdAt: '2025-08-14',
    },
    {
        id: 'c2',
        myText: 'My comment ...',
        parentSnippet: "Someone else’s writing",
        createdAt: '2025-08-14',
    },
];


export default function MyHistoryScreen() {
    const [tab, setTab] = useState<Tab>('post');

    const [posts, setPosts] = useState<PostRow[]>(MOCK_POSTS);
    const [comments, setComments] = useState<CommentRow[]>(MOCK_COMMENTS);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetTarget, setSheetTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(
        null
    );

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
        closeSheet();
        router.push('/community/write');
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

                        if (isPost) {
                            setPosts((prev) => prev.filter((p) => p.id !== sheetTarget.id));
                            showToast('1 Posts Deleted');
                        } else {
                            setComments((prev) => prev.filter((c) => c.id !== sheetTarget.id));
                            showToast('1 Comments Deleted');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };


    const renderPost: ListRenderItem<PostRow> = ({ item }) => (
        <RowWrap>
            <TopRow>
                <Avatar source={item.avatar} />
                <Meta>
                    <Author>{item.author}</Author>
                    <SubRow>
                        <Sub>{item.createdAt}</Sub>
                        <Dot>·</Dot>
                        <AntDesign name="eyeo" size={12} color="#9aa0a6" />
                        <Sub style={{ marginLeft: 6 }}>{item.views}</Sub>
                    </SubRow>
                </Meta>
                <MoreBtn onPress={() => openSheet({ type: 'post', id: item.id })}>
                    <AntDesign name="ellipsis1" size={16} color="#cfd4da" />
                </MoreBtn>
            </TopRow>

            <Body numberOfLines={1}>{item.body}</Body>

            <Divider />

            <ActionRow>
                <Act>
                    <AntDesign name="like2" size={14} color="#30F59B" />
                    <ActText>{item.likes}</ActText>
                </Act>
                <Act>
                    <AntDesign name="message1" size={14} color="#cfd4da" />
                    <ActText>{item.comments}</ActText>
                </Act>
            </ActionRow>
        </RowWrap>
    );

    const renderComment: ListRenderItem<CommentRow> = ({ item }) => (
        <RowWrap>
            <TopRow>
                <Avatar source={AV} />
                <Meta>
                    <Author>{item.createdAt}</Author>
                    <SubRow>
                        <Sub>{item.myText}</Sub>
                    </SubRow>
                </Meta>
                <MoreBtn onPress={() => openSheet({ type: 'comment', id: item.id })}>
                    <AntDesign name="ellipsis1" size={16} color="#cfd4da" />
                </MoreBtn>
            </TopRow>

            <ParentSnippet numberOfLines={1}>{item.parentSnippet}</ParentSnippet>
            <Line />
        </RowWrap>
    );

    const data = useMemo(() => (tab === 'post' ? posts : comments), [tab, posts, comments]);

    return (
        <Safe>
            {/* Header */}
            <Header>
                <Back onPress={() => router.back()}>
                    <AntDesign name="left" size={20} color="#fff" />
                </Back>
                <HeaderTitle>My History</HeaderTitle>
                <RightPlaceholder />
            </Header>

            {/* Tabs */}
            <TabsBar>
                <TabBtn $active={tab === 'post'} onPress={() => setTab('post')}>
                    <TabText $active={tab === 'post'}>My Post</TabText>
                    {tab === 'post' && <TabUnderline />}
                </TabBtn>
                <TabBtn $active={tab === 'comment'} onPress={() => setTab('comment')}>
                    <TabText $active={tab === 'comment'}>Comments</TabText>
                    {tab === 'comment' && <TabUnderline />}
                </TabBtn>
            </TabsBar>

            {/* List */}
            <FlatList
                data={data as any[]}
                keyExtractor={(it) => (it as any).id}
                renderItem={tab === 'post' ? (renderPost as any) : (renderComment as any)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={
                    <Empty>
                        <EmptyText>No items.</EmptyText>
                    </Empty>
                }
            />

            <Modal
                visible={sheetOpen}
                transparent
                animationType="fade"
                onRequestClose={closeSheet}
            >
                <SheetBackdrop onPress={closeSheet} />
                <Sheet>
                    <SheetBtn onPress={onEdit}>
                        <SheetIcon>
                            <MaterialIcons name="edit" size={18} color="#cfd4da" />
                        </SheetIcon>
                        <SheetText>Edit</SheetText>
                    </SheetBtn>

                    <SheetBtn onPress={onDelete}>
                        <SheetIcon>
                            <MaterialIcons name="delete-outline" size={18} color="#ff6b6b" />
                        </SheetIcon>
                        <SheetText style={{ color: '#ff6b6b' }}>Delete</SheetText>
                    </SheetBtn>

                    <SheetBtn onPress={closeSheet}>
                        <SheetIcon>
                            <AntDesign name="close" size={18} color="#cfd4da" />
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
  font-family: 'PlusJakartaSans_700Bold';
`;
const RightPlaceholder = styled.View`
  width: 40px;
`;

const TabsBar = styled.View`
  height: 44px;
  flex-direction: row;
  align-items: flex-end;
  padding: 0 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;
const TabBtn = styled.Pressable<{ $active?: boolean }>`
  flex: 1;
  height: 100%;
  align-items: center;
  justify-content: flex-end;
`;
const TabText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#9aa0a6')};
  font-family: 'PlusJakartaSans_700Bold';
`;
const TabUnderline = styled.View`
  height: 2px;
  width: 62px;
  background: #30F59B;
  border-radius: 2px;
  margin-top: 6px;
`;

const RowWrap = styled.View`
  padding: 14px 16px 12px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;

const TopRow = styled.View`
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

const Divider = styled.View`
  height: 1px;
  background: #222426;
  margin-top: 10px;
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

const ParentSnippet = styled.Text`
  margin-top: 8px;
  color: #9aa0a6;
  font-size: 12px;
`;
const Line = styled.View`
  height: 1px;
  background: #222426;
  margin-top: 12px;
`;

const Empty = styled.View`
  padding: 32px 16px;
  align-items: center;
`;
const EmptyText = styled.Text`
  color: #cfd4da;
`;

/* bottom sheet */
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
    ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -6 } },
    android: { elevation: 8 },
})}
`;
const SheetBtn = styled.Pressable`
  height: 52px;
  border-radius: 12px;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
  margin: 6px 12px 0 12px;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
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

/* toast */
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
