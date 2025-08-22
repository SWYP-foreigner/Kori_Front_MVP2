import CommentItem, { Comment } from '@/components/CommentItem';
import SortTabs, { SortKey } from '@/components/SortTabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import styled from 'styled-components/native';

const AV = require('@/assets/images/character1.png');
const IMG = require('@/assets/images/img.png');

const MOCK_POSTS: Record<string, any> = {
    p1: {
        id: 'p1',
        author: 'Shotaro',
        avatar: AV,
        category: 'Free talk',
        minutesAgo: 23,
        createdAt: '2025-08-14',
        body:
            "Hi! I came to Korea on a working holiday and I'm currently learning Korean at Yonsei Univ.",
        images: [IMG],
        likes: 999,
        comments: 999,
        views: 1998,
        bookmarked: false,
    },
    p2: {
        id: 'p2',
        author: 'Shotaro',
        avatar: AV,
        category: 'Event',
        createdAt: '2025-08-14',
        body: 'Second post without image.',
        likes: 999,
        comments: 999,
        views: 1998,
        bookmarked: false,
    },
};

const MOCK_COMMENTS_BY_POST: Record<string, Comment[]> = {
    p1: [
        {
            id: 'c1',
            author: 'John',
            avatar: AV,
            createdAt: '2025-08-14',
            body:
                "Hi! I came to Korea on a working holiday and I'm currently learning Korean.",
            likes: 999,
            isChild: false,
            hotScore: 1200,
        },
        {
            id: 'c2',
            author: 'Alice',
            avatar: AV,
            createdAt: '2025-08-14',
            body:
                "Hi! I came to Korea on a working holiday and I'm currently learning Korean.",
            likes: 999,
            isChild: true,
            hotScore: 900,
        },
    ],
    p2: [
        {
            id: 'c3',
            author: 'Tom',
            avatar: AV,
            createdAt: '2025-08-14',
            body: 'Event looks great!',
            likes: 3,
            isChild: false,
            hotScore: 10,
        },
    ],
};

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [post, setPost] = useState<any | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        const p = id ? MOCK_POSTS[id] : null;
        setPost(p ?? null);
        setComments(id && MOCK_COMMENTS_BY_POST[id] ? [...MOCK_COMMENTS_BY_POST[id]] : []);
    }, [id]);

    const [sort, setSort] = useState<SortKey>('new');
    const [value, setValue] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const sorted = useMemo(() => {
        const arr = comments.slice();
        if (sort === 'new') {
            arr.sort(
                (a, b) =>
                    b.createdAt.localeCompare(a.createdAt) ||
                    Number(a.isChild) - Number(b.isChild),
            );
        } else {
            arr.sort((a, b) => b.hotScore - a.hotScore);
        }
        return arr;
    }, [comments, sort]);

    const submit = () => {
        if (!value.trim() || !post) return;
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
        setComments(prev => [c, ...prev]);
        setValue('');
    };

    const toggleBookmark = () =>
        setPost(p => (p ? { ...p, bookmarked: !p.bookmarked } : p));

    const likePost = () =>
        setPost(p => (p ? { ...p, likes: p.likes + 1 } : p));

    if (!post) {
        return (
            <Safe>
                <Header>
                    <Back onPress={() => router.back()}>
                        <AntDesign name="left" size={20} color="#fff" />
                    </Back>
                    <HeaderTitle>Post</HeaderTitle>
                    <Right />
                </Header>
                <EmptyWrap>
                    <EmptyText>Post not found.</EmptyText>
                </EmptyWrap>
            </Safe>
        );
    }

    const dateLabel =
        typeof post.minutesAgo === 'number'
            ? `${post.minutesAgo} min ago`
            : post.createdAt?.slice(5).replace('-', '/');

    return (
        <Safe>
            <Header>
                <Back onPress={() => router.back()}>
                    <AntDesign name="left" size={20} color="#fff" />
                </Back>
                <HeaderTitle>Post</HeaderTitle>
                <Right>
                    <IconBtn onPress={toggleBookmark}>
                        <AntDesign
                            name="flag"
                            size={18}
                            color={post.bookmarked ? '#30F59B' : '#cfd4da'}
                        />
                    </IconBtn>
                </Right>
            </Header>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <FlatList<Comment>
                    data={sorted}
                    keyExtractor={(it) => it.id}
                    renderItem={({ item }) => <CommentItem data={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    ListHeaderComponent={
                        <>
                            <Card>
                                <Row>
                                    <Avatar source={post.avatar} />
                                    <Meta>
                                        <Author>{post.author}</Author>
                                        <MetaRow>
                                            <Sub>{dateLabel}</Sub>
                                            <Dot>·</Dot>
                                            <AntDesign name="eyeo" size={12} color="#9aa0a6" />
                                            <Sub style={{ marginLeft: 6 }}>{post.views}</Sub>
                                        </MetaRow>
                                    </Meta>
                                    <SmallFlag onPress={toggleBookmark}>
                                        <AntDesign
                                            name="flag"
                                            size={16}
                                            color={post.bookmarked ? '#30F59B' : '#8a8a8a'}
                                        />
                                    </SmallFlag>
                                </Row>

                                {!!post.images?.length && (
                                    <Img source={post.images[0]} resizeMode="cover" />
                                )}

                                <Body>{post.body}</Body>

                                <Footer>
                                    <Act onPress={likePost}>
                                        <AntDesign name="like2" size={16} color="#30F59B" />
                                        <ActText>{post.likes}</ActText>
                                    </Act>
                                    <Act>
                                        <AntDesign name="message1" size={16} color="#cfd4da" />
                                        <ActText>{post.comments}</ActText>
                                    </Act>
                                </Footer>
                            </Card>

                            <SortWrap>
                                <SortLabel>Sort by</SortLabel>
                                <SortTabs value={sort} onChange={setSort} />
                            </SortWrap>
                        </>
                    }
                />

                <InputBar>
                    <Input
                        ref={inputRef}
                        value={value}
                        onChangeText={setValue}
                        placeholder="Write Your Text"
                        placeholderTextColor="#8a8a8a"
                        returnKeyType="send"
                        onSubmitEditing={submit}
                    />
                    <Anon onPress={() => setAnonymous(v => !v)} $active={anonymous}>
                        <AnonText $active={anonymous}>Anonymous</AnonText>
                    </Anon>
                    <Send onPress={submit}>
                        <AntDesign name="arrowup" size={16} color="#0f1011" />
                    </Send>
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
`;
const Right = styled.View`
  flex-direction: row;
  align-items: center;
`;
const IconBtn = styled.Pressable`
  padding: 6px;
  margin-left: 6px;
`;

const EmptyWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const EmptyText = styled.Text`
  color: #cfd4da;
`;

const Card = styled.View`
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
  padding: 10px 16px 0 16px;
`;
const SortLabel = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
  margin-bottom: 6px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const InputBar = styled.View`
  padding: 8px 10px 12px 10px;
  background: #1d1e1f;
  border-top-width: 1px;
  border-top-color: #222426;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;
const Input = styled.TextInput`
  flex: 1;
  height: 40px;
  border-radius: 10px;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
  padding: 0 12px;
  color: #fff;
`;
const Anon = styled.Pressable<{ $active?: boolean }>`
  height: 40px;
  border-radius: 10px;
  padding: 0 12px;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => ($active ? '#2d3f38' : '#1a1b1c')};
  border: 1px solid ${({ $active }) => ($active ? '#30F59B' : '#2a2b2c')};
`;
const AnonText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')};
  font-family: 'PlusJakartaSans_600SemiBold';
  font-size: 12px;
`;
const Send = styled.Pressable`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
`;
