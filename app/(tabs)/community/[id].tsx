import CommentItem, { Comment } from '@/components/CommentItem';
import SortTabs, { SortKey } from '@/components/SortTabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList as RNFlatList } from 'react-native';
import {
    FlatList, Keyboard, KeyboardAvoidingView,
    Platform, TextInput as RNTextInput, TextInputProps
} from 'react-native';
import styled from 'styled-components/native';

type PostModel = {
    id: string; author: string; avatar: any; category: string;
    minutesAgo?: number; createdAt: string; body: string; images?: any[];
    likes: number; comments: number; views?: number; bookmarked?: boolean;
};

const AV = require('@/assets/images/character1.png');
const IMG = require('@/assets/images/img.png');

const MOCK_POSTS: Record<string, PostModel> = {
    p1: {
        id: 'p1', author: 'Shotaro', avatar: AV, category: 'Free talk', minutesAgo: 23, createdAt: '2025-08-14',
        body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean at Yonsei Univ.",
        images: [IMG], likes: 999, comments: 999, views: 1998, bookmarked: false
    },
    p2: {
        id: 'p2', author: 'Shotaro', avatar: AV, category: 'Event', createdAt: '2025-08-14',
        body: 'Second post without image.', likes: 999, comments: 999, views: 1998, bookmarked: false
    },
};

const MOCK_COMMENTS_BY_POST: Record<string, Comment[]> = {
    p1: [
        {
            id: 'c1', author: 'John', avatar: AV, createdAt: '2025-08-14',
            body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean.",
            likes: 999, isChild: false, hotScore: 1200
        },
        {
            id: 'c2', author: 'Alice', avatar: AV, createdAt: '2025-08-14',
            body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean.",
            likes: 999, isChild: true, hotScore: 900
        },
    ],
    p2: [{ id: 'c3', author: 'Tom', avatar: AV, createdAt: '2025-08-14', body: 'Event looks great!', likes: 3, isChild: false, hotScore: 10 }],
};

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [post, setPost] = useState<PostModel | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        const p = id ? MOCK_POSTS[id] : null;
        setPost(p ?? null);
        setComments(id && MOCK_COMMENTS_BY_POST[id] ? [...MOCK_COMMENTS_BY_POST[id]] : []);
    }, [id]);

    const [sort, setSort] = useState<SortKey>('new');
    const [value, setValue] = useState('');
    const [anonymous, setAnonymous] = useState(false);

    const inputRef = useRef<RNTextInput>(null);
    const listRef = useRef<RNFlatList<Comment>>(null);

    const sorted = useMemo(() => {
        const arr = comments.slice();
        if (sort === 'new') {
            arr.sort((a, b) =>
                b.createdAt.localeCompare(a.createdAt) || Number(a.isChild) - Number(b.isChild));
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
            likes: 0, isChild: false, hotScore: 0, anonymous,
        };
        setComments(prev => [c, ...prev]);
        setValue('');
        Keyboard.dismiss();
        requestAnimationFrame(() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true }),
        );
    };

    const toggleBookmark = () =>
        setPost(prev => (prev ? { ...prev, bookmarked: !prev.bookmarked } : prev));

    const likePost = () =>
        setPost(prev => (prev ? { ...prev, likes: prev.likes + 1 } : prev));

    if (!post) {
        return (
            <Safe>
                <Header>
                    <Back onPress={() => router.back()}>
                        <AntDesign name="left" size={20} color="#fff" />
                    </Back>
                    <HeaderTitle>Post</HeaderTitle>
                    <RightPlaceholder />
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
                <RightPlaceholder />
            </Header>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <FlatList<Comment>
                    ref={listRef}
                    data={sorted}
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
                                        <MaterialIcons
                                            name={post.bookmarked ? 'bookmark' : 'bookmark-border'}
                                            size={20}
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
                            <Check $active={anonymous}>
                                {anonymous && <AntDesign name="check" size={14} color="#ffffff" />}
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

const EmptyWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const EmptyText = styled.Text`
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
