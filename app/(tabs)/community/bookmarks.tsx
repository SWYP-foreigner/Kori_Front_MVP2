import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    ListRenderItem,
    TouchableOpacity,
    View, type FlatListProps
} from 'react-native';
import styled from 'styled-components/native';

const AV = require('@/assets/images/character1.png');

type BookmarkPost = {
    id: string;
    author: string;
    avatar: any;
    createdAt: string;
    views?: number;
    body: string;
    likes: number;
    comments: number;
};

const MOCK: BookmarkPost[] = [
    { id: 'b1', author: 'Shotaro', avatar: AV, createdAt: '2025-08-14', views: 999, body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean at the Korean Language Institute at Yonsei Univ.", likes: 999, comments: 999 },
    { id: 'b2', author: 'Shotaro', avatar: AV, createdAt: '2025-08-14', views: 999, body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean at the Korean Language Institute at Yonsei Univ.", likes: 999, comments: 999 },
    { id: 'b3', author: 'Shotaro', avatar: AV, createdAt: '2025-08-14', views: 999, body: "Hi! I came to Korea on a working holiday and I'm currently learning Korean at the Korean Language Institute at Yonsei Univ.", likes: 999, comments: 999 },
];

export default function BookmarksScreen() {
    const [items, setItems] = useState<BookmarkPost[]>(MOCK);

    const removeBookmark = (id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const openPost = (id: string) => {
        router.push({ pathname: '/community/[id]', params: { id } });
    };

    const renderItem: ListRenderItem<BookmarkPost> = ({ item }) => (
        <Cell activeOpacity={0.8} onPress={() => openPost(item.id)}>
            <RowTop>
                <RowLeft>
                    <Avatar source={item.avatar} />
                    <Meta>
                        <Author>{item.author}</Author>
                        <MetaRow>
                            <Sub>{formatDate(item.createdAt)}</Sub>
                            <Dot>·</Dot>
                            <AntDesign name="eyeo" size={12} color="#9aa0a6" />
                            <Sub style={{ marginLeft: 6 }}>{item.views ?? 0}</Sub>
                        </MetaRow>
                    </Meta>
                </RowLeft>

                <IconBtn onPress={() => removeBookmark(item.id)} hitSlop={8}>
                    <MaterialIcons name="bookmark" size={18} color="#30F59B" />
                </IconBtn>
            </RowTop>

            <Body numberOfLines={3}>{item.body}</Body>

            <Footer>
                <FootItem>
                    <AntDesign name="like2" size={16} color="#30F59B" />
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
        [],
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
                keyExtractor={(it: BookmarkPost) => it.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={listEmpty}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </Safe>
    );
}

function formatDate(yyyy_mm_dd: string) {
    if (!yyyy_mm_dd?.includes('-')) return yyyy_mm_dd;
    const [y, m, d] = yyyy_mm_dd.split('-');
    return `${m}/${d}/${y}`;
}


const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1D1E1F;
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

const Title = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_500Bold';
`;

const RightSpace = styled.View`
  width: 40px;
`;

const List = styled(
    FlatList as React.ComponentType<FlatListProps<BookmarkPost>>
)``;

const Cell = styled(TouchableOpacity)`
  padding: 12px 16px 8px 16px;
`;

const RowTop = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RowLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  padding-right: 8px;
`;

const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #2a2b2c;
`;

const Meta = styled.View`
  margin-left: 10px;
  flex: 1;
`;

const Author = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
`;

const Sub = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
`;

const Dot = styled.Text`
  color: #9aa0a6;
  margin: 0 6px;
`;

const IconBtn = styled.Pressable`
  padding: 6px;
`;

const Body = styled.Text`
  color: #d9dcdf;
  font-size: 14px;
  line-height: 20px;
  margin-top: 10px;
`;

const Footer = styled.View`
  margin-top: 10px;
  margin-bottom: 8px;
  flex-direction: row;
  align-items: center;
`;

const FootItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FootText = styled.Text`
  color: #cfd4da;
  margin-left: 6px;
  font-size: 12px;
`;

const MoreBtn = styled(View)`
  margin-left: auto;
`;

const Divider = styled.View`
  height: 1px;
  background: #222426;
  margin-top: 10px;
`;

const Empty = styled.View`
  padding: 40px 16px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: #cfd4da;
  font-size: 14px;
`;
