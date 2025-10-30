import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import FriendCard from '@/components/FriendCard';

type ProfileModalProps = {
  visible: boolean;
  userData: any;
  onClose: () => void;
  onFollow?: (id: number) => void;
  onUnfollow?: (id: number) => void;
  onChat?: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, userData, onClose, onFollow, onUnfollow, onChat }) => {
  if (!visible || !userData) return null;

  const mapApiDataToFriendCardProps = (data: any) => {
    return {
      userId: data.userId,
      name: `${data.firstname} ${data.lastname}`,
      country: data.country,
      birth: data.birthday ? new Date(data.birthday).getFullYear() : undefined,
      gender: data.gender?.toLowerCase() as 'male' | 'female' | 'unspecified',
      purpose: data.purpose,
      languages: data.language || [],
      personalities: data.hobby || [],
      bio: data.introduction || 'No introduction',
      imageKey: data.imageKey,
    };
  };

  return (
    <Backdrop onPress={onClose} activeOpacity={1}>
      <ModalContainer onStartShouldSetResponder={() => true}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FriendCard
            {...mapApiDataToFriendCardProps(userData)}
            isFollowed={false}
            onFollow={onFollow || ((id) => console.log('follow', id))}
            onUnfollow={onUnfollow || ((id) => console.log('unfollow', id))}
            onChat={onChat || (() => console.log('chat start'))}
          />
        </ScrollView>
      </ModalContainer>
    </Backdrop>
  );
};

export default ProfileModal;

const Backdrop = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.View`
  width: 90%;
  background-color: #fff;
  border-radius: 20px;
  padding: 10px;
  max-height: 100%;
`;
