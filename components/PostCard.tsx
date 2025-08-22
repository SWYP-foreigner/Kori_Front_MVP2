import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

export type Post = {
    id: string;
    author: string;
    avatar?: any;
    category: string;
    createdAt: string;
    minutesAgo?: number;
    title?: string;
    body: string;
    images?: any[];
    likes: number;
    comments: number;
    bookmarked?: boolean;
    hotScore: number;
};

type Props = {
    data: Post;
    onPress?: () => void;
    onToggleLike?: () => void;
    onToggleBookmark?: () => void;
};

export default function PostCard({ data, onPress, onToggleLike, onToggleBookmark }: Props) {
    const showUnit = typeof data.minutesAgo === 'number';
    const timeLabel = showUnit
        ? (data.minutesAgo! < 60
            ? `${data.minutesAgo} min ago`
            : `${Math.floor(data.minutesAgo! / 60)} hours ago`)
        : data.createdAt.slice(5, 10).replace('-', '/');

    const viewCount = data.likes + data.comments;

    return (
        <Wrap onPress={onPress}>
            <HeaderRow>
                <Avatar source={data.avatar} />

                <Meta>
                    <Author>{data.author}</Author>

                    <SubRow>
                        <TimeText>{timeLabel}</TimeText>

                        <CatBadge>
                            <CatText>{data.category}</CatText>
                        </CatBadge>

                        <Dot>•</Dot>

                        <AntDesign name="eyeo" size={12} color="#9aa0a6" />
                        <SmallCount>{viewCount}</SmallCount>
                    </SubRow>
                </Meta>

                <BookBtn onPress={onToggleBookmark}>
                    <AntDesign
                        name="flag"
                        size={16}
                        color={data.bookmarked ? '#30F59B' : '#8a8a8a'}
                    />
                </BookBtn>
            </HeaderRow>

            {data.images?.length ? (
                <ImageBox>
                    <Image
                        source={data.images[0]}
                        style={{ width: '100%', height: 180, borderRadius: 12 }}
                        resizeMode="cover"
                    />
                    {data.images.length > 1 && (
                        <Counter>{` ${1}/${data.images.length} `}</Counter>
                    )}
                </ImageBox>
            ) : null}

            {!!data.title && <Title numberOfLines={1}>{data.title}</Title>}
            <Body numberOfLines={3}>{data.body}</Body>

            <FooterRow>
                <IconBtn onPress={onToggleLike}>
                    <AntDesign name="like2" size={16} color="#30F59B" />
                    <Count>{data.likes}</Count>
                </IconBtn>
                <IconBtn>
                    <AntDesign name="message1" size={16} color="#cfd4da" />
                    <Count>{data.comments}</Count>
                </IconBtn>
                <More>···</More>
            </FooterRow>
        </Wrap>
    );
}

const Wrap = styled.Pressable`
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
  gap: 8px;
`;

const HeaderRow = styled.View`
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

const SubRow = styled.View`
  margin-top: 2px;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const TimeText = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
`;

const CatBadge = styled.View`
  padding: 2px 8px;
  border-radius: 6px;
  background: #184b3f;
`;
const CatText = styled.Text`
  color: #E9E9E9;
  font-size: 11px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const Dot = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
`;

const SmallCount = styled.Text`
  color: #cfd4da;
  font-size: 11px;
  margin-left: 4px;
`;

const BookBtn = styled.Pressable`
  padding: 6px;
`;

const ImageBox = styled.View`
  margin-top: 8px;
  position: relative;
`;

const Counter = styled.Text`
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 15px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const Body = styled.Text`
  color: #d9dcdf;
  font-size: 13px;
  line-height: 18px;
`;

const FooterRow = styled.View`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
`;

const IconBtn = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`;

const Count = styled.Text`
  color: #cfd4da;
  margin-left: 6px;
  font-size: 12px;
`;

const More = styled.Text`
  margin-left: auto;
  color: #9aa0a6;
  font-size: 18px;
  padding: 4px 6px;
`;
