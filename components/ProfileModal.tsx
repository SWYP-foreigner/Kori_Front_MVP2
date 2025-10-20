import React from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
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
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onPress={onClose}
      activeOpacity={1}
    >
      <View
        style={{
          width: '90%',
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 10,
          maxHeight: '80%',
        }}
        onStartShouldSetResponder={() => true}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <FriendCard
            {...mapApiDataToFriendCardProps(userData)}
            isFollowed={false}
            onFollow={onFollow || ((id) => console.log('follow', id))}
            onUnfollow={onUnfollow || ((id) => console.log('unfollow', id))}
            onChat={onChat || (() => console.log('chat start'))}
          />
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileModal;
