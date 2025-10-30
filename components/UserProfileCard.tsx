import React from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import useMyProfile from '@/hooks/queries/useMyProfile';
import defaultAvatar from '@/assets/images/default-avatar.png';
import Icon from './common/Icon';

type Props = {
  onClose: () => void;
};

const UserProfileCard = ({ onClose }: Props) => {
  const { data: profile, isLoading, isError } = useMyProfile();

  if (isLoading)
    return (
      <Loader>
        <ActivityIndicator size="large" />
      </Loader>
    );

  if (isError || !profile) return <ErrorText>Failed to load profile 😢</ErrorText>;

  const { firstname, lastname, country, introduction, purpose, language, hobby, imageUrl } = profile;

  return (
    <Container>
      <CloseButton onPress={onClose}>
        <Icon type="close" size={24} />
      </CloseButton>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <ProfileImage source={imageUrl ? { uri: imageUrl } : defaultAvatar} />

        <Name>
          {firstname} {lastname}
        </Name>
        {country && <SubText>From {country}</SubText>}
        {introduction && <Description>{introduction}</Description>}

        {purpose && (
          <Section>
            <Label>Purpose</Label>
            <Value>{purpose}</Value>
          </Section>
        )}

        {language?.length > 0 && (
          <Section>
            <Label>Language</Label>
            <Value>{language.join(' · ')}</Value>
          </Section>
        )}

        {hobby?.length > 0 && (
          <Section>
            <Label>Interest</Label>
            <TagContainer>
              {hobby.map((item, idx) => (
                <Tag key={idx}>
                  <TagText>{item}</TagText>
                </Tag>
              ))}
            </TagContainer>
          </Section>
        )}

        <ButtonRow>
          <FollowButton>
            <ButtonText>Following</ButtonText>
          </FollowButton>
          <ChatButton>
            <ButtonText style={{ color: '#fff' }}>Chat</ButtonText>
          </ChatButton>
        </ButtonRow>

        <LeaveButton>
          <LeaveText>Leave Group</LeaveText>
        </LeaveButton>
      </ScrollView>
    </Container>
  );
};

export default UserProfileCard;

// styled-components
const Container = styled.View`
  flex: 1;
  background-color: #fff;
  border-radius: 24px;
  padding: 24px;
  position: relative;
`;

const CloseButton = styled(TouchableOpacity)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
`;

const CloseIcon = styled(Image)`
  width: 20px;
  height: 20px;
  tint-color: #888;
`;

const Loader = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.Text`
  text-align: center;
  margin-top: 40px;
  color: #999;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-top: 36px;
`;

const Name = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin-top: 12px;
`;

const SubText = styled.Text`
  font-size: 14px;
  color: #777;
  margin-top: 4px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #444;
  text-align: center;
  margin-top: 8px;
  line-height: 20px;
`;

const Section = styled.View`
  width: 100%;
  margin-top: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #777;
`;

const Value = styled.Text`
  font-size: 15px;
  color: #222;
  margin-top: 4px;
`;

const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.View`
  background-color: #f5f5f5;
  padding: 6px 10px;
  border-radius: 16px;
`;

const TagText = styled.Text`
  font-size: 13px;
  color: #333;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 28px;
`;

const FollowButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #f2f2f2;
  padding: 12px;
  border-radius: 12px;
  align-items: center;
`;

const ChatButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #000;
  padding: 12px;
  border-radius: 12px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: #000;
  font-weight: 600;
`;

const LeaveButton = styled.TouchableOpacity`
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  align-items: center;
`;

const LeaveText = styled.Text`
  color: #d9534f;
  font-weight: 600;
`;
