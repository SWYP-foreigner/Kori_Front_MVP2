import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

export type Comment = {
  id: string | number;
  author: string;
  avatar: ImageSourcePropType;
  createdAt: string;
  body: string;
  likes: number;
  likedByMe?: boolean;
  isChild?: boolean;
  hotScore: number;
  anonymous?: boolean;
};

type Props = {
  data: Comment;
  onPressLike?: () => void;
};

export default function CommentItem({ data, onPressLike }: Props) {
  const isChild = !!data.isChild;

  return (
    <Wrap $child={isChild}>
      <Row>
        {isChild && (
          <ReplyIcon>
            <Feather name="corner-down-right" size={18} color="#9aa0a6" />
          </ReplyIcon>
        )}
        <Avatar source={data.avatar} />
        <Meta>
          <Author>{data.author}</Author>
          <Sub>{data.createdAt.slice(5).replace('-', '/')}</Sub>
        </Meta>
        <More>···</More>
      </Row>

      <Body>{data.body}</Body>

      <Footer>
        <Act
          onPress={onPressLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Like this comment"
        >
          <AntDesign
            name={data.likedByMe ? 'like1' : 'like2'}
            size={14}
            color={data.likedByMe ? '#30F59B' : '#cfd4da'}
          />
          <Count $active={!!data.likedByMe}>{data.likes}</Count>
        </Act>

        <Act disabled>
          <AntDesign name="message1" size={14} color="#cfd4da" />
          <Count>999</Count>
        </Act>
      </Footer>
    </Wrap>
  );
}

const Wrap = styled.View<{ $child: boolean }>`
  background: #171818;
  padding: 12px 16px 10px 16px;
  border-top-width: ${({ $child }) => ($child ? 0 : 1)}px;
  border-top-color: #222426;
  border-bottom-width: 1px;
  border-bottom-color: #222426;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ReplyIcon = styled.View`
  width: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
`;

const Avatar = styled.Image`
  width: 28px;
  height: 28px;
  border-radius: 14px;
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

const Sub = styled.Text`
  color: #9aa0a6;
  font-size: 11px;
  margin-top: 2px;
`;

const More = styled.Text`
  color: #9aa0a6;
  font-size: 18px;
  padding: 4px 6px;
`;

const Body = styled.Text`
  color: #d9dcdf;
  font-size: 13px;
  line-height: 18px;
  margin-top: 6px;
`;

const Footer = styled.View`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
`;

const Act = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`;

const Count = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')};
  margin-left: 6px;
  font-size: 12px;
`;
