import FriendCard from '@/components/FriendCard';
import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import styled from 'styled-components/native';

// 1. Props 정의 수정
type ProfileModalProps = {
  visible: boolean;
  userData: any;
  onClose: () => void;
  onFollow?: () => void;       // 👈 (id: number) 제거
  onUnfollow?: () => void;     // 👈 (id: number) 제거
  onChat?: () => void;
  isLoadingFollow?: boolean; // 👈 [추가]
  isLoadingChat?: boolean;   // 👈 [추가]
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  userData,
  onClose,
  onFollow,
  onUnfollow,
  onChat,
  isLoadingFollow, // 👈 [추가]
  isLoadingChat,   // 👈 [추가]
}) => {
  if (!visible || !userData) return null;

  // 2. API 데이터를 FriendCard Props로 매핑
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

  // 3. followStatus를 FriendCard에 전달할 props로 변환
  const followStatus = userData?.followStatus; // "SELF", "PENDING", "ACCEPTED", "NOT_FOLLOWING"

  // 4. FriendCard에 전달할 핸들러 함수 (id 제거)
  const handleFollow = () => {
    if (onFollow) onFollow();
  };

  const handleUnfollow = () => {
    if (onUnfollow) onUnfollow();
  };

  return (
    <Backdrop onPress={onClose} activeOpacity={1}>
      <ModalContainer onStartShouldSetResponder={() => true}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 5. FriendCard에 모든 props 전달 */}
          <FriendCard
            {...mapApiDataToFriendCardProps(userData)}

            // --- 팔로우/채팅 버튼 상태 ---
            followStatus={followStatus} // 👈 'isFollowed' 대신 'followStatus' 전달
            isLoadingFollow={isLoadingFollow} // 👈 로딩 상태 전달
            isLoadingChat={isLoadingChat}     // 👈 로딩 상태 전달

            // --- 버튼 핸들러 ---
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onChat={onChat || (() => console.log('chat start'))}
          />
        </ScrollView>

        {/* 전체 모달 로딩 오버레이 (선택 사항) */}
        {(isLoadingFollow || isLoadingChat) && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LoadingOverlay>
        )}
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
  overflow: hidden; 
`;

// [추가] 로딩 오버레이 스타일
const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;