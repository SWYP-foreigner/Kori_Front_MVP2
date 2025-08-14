import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import Tag from '@/components/Tag';
import React from 'react';
import styled from 'styled-components/native';

type Props = {
  userId: number;
  name: string;
  country: string;
  age: number;
  purpose: string;
  languages: string[];
  personalities: string[];
  isFollowed?: boolean;
  onFollow?: (userId: number) => void;
  onChat?: () => void;
};

export default function FriendCard({
  userId,
  name,
  country,
  age,
  purpose,
  languages,
  personalities,
  isFollowed = false,
  onFollow,
  onChat,
}: Props) {
  return (
    <Card>
      <Avatar size={80} />

      <Name>{name}</Name>
      <SubText>
        {country} | Age {age}
      </SubText>

      {/* 방문 목적, 사용 가능 언어 */}
      <InfoRow>
        <InfoItem>
          <InfoLabel>📄 Purpose</InfoLabel>
          <InfoValue>{purpose}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>🌐 Language</InfoLabel>
          <InfoValue>{languages.join(' • ')}</InfoValue>
        </InfoItem>
      </InfoRow>

      {/*  */}
      <InfoRowSingle>
        <InfoLabel>⭐ Personality</InfoLabel>
      </InfoRowSingle>
      <TagsWrap>
        {personalities.map((p) => (
          <Tag key={p} label={p} />
        ))}
      </TagsWrap>

      {/* 필로우, 채팅 버튼 */}
      <Actions>
        <CustomButton
          label={isFollowed ? 'Following' : 'Follow'}
          variant={isFollowed ? 'filled' : 'outline'}
          onPress={() => onFollow?.(userId)}
        />
        <CustomButton label="Chat" variant="outline" onPress={onChat} />
      </Actions>
    </Card>
  );
}

const Card = styled.View`
  width: 320px;
  background-color: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  align-items: center;

  /* subtle shadow */
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const Name = styled.Text`
  font-weight: 700;
  font-size: 18px;
`;

const SubText = styled.Text`
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin: 4px 0;
  gap: 12px;
`;

const InfoRowSingle = styled.View`
  align-self: flex-start;
  margin: 8px 0 4px 0;
`;

const InfoItem = styled.View`
  flex: 1;
`;

const InfoLabel = styled.Text`
  font-size: 12px;
  color: #777;
  margin-bottom: 2px;
`;

const InfoValue = styled.Text`
  font-size: 13px;
  font-weight: 500;
`;

const TagsWrap = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Actions = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 12px;
`;