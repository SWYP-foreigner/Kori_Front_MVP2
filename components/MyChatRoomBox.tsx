import api from '@/api/axiosInstance';
import RawProfileImage from '@/components/common/ProfileImage';
import { Config } from '@/src/lib/config';
import { useRouter } from 'expo-router';
import React from 'react';
import styled from 'styled-components/native';


const SWIPE_THRESHOLD = 80; // 드래그해야 열림/닫힘이 되는 기준

const toUrl = (u?: string) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  const base =
    (Config as any).EXPO_PUBLIC_NCP_PUBLIC_BASE_URL ||
    (Config as any).NCP_PUBLIC_BASE_URL ||
    (Config as any).EXPO_PUBLIC_IMAGE_BASE_URL ||
    (Config as any).IMAGE_BASE_URL ||
    '';
  return base ? `${String(base).replace(/\/+$/, '')}/${String(u).replace(/^\/+/, '')}` : undefined;
};

const MyChatRoomBox = ({ data }) => {
  const router = useRouter();

  //채팅방 진입
  const enterChattingRoom = async () => {
    try {
      const res = await api.post(`${Config.SERVER_URL}/api/v1/chat/rooms/${data.roomId}/read-all`);
      if (res.status === 200) {
        router.push({
          pathname: '/(tabs)/chat/ChattingRoomScreen',
          params: {
            roomId: data.roomId, // props에서 바로 가져옴
            roomName: data.roomName, // props에서 바로 가져옴
          },
        });
      } else {
        console.error('채팅방 리스트 읽음 표시 오류');
      }
    } catch (error) {
      console.error('채팅방 리스트 읽음 처리 실패', error);
    }
  };

  const formatTime = (sentAt: string | number) => {
    const ts = typeof sentAt === 'string' ? Date.parse(sentAt) : sentAt * 1000;
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <ChatRoom>
      <RoomBox activeOpacity={0.8} onPress={enterChattingRoom}>
        <RoomImageContainer>
          <RoomImage
            source={
              data.roomImageUrl
                ? { uri: data.roomImageUrl } // URL이 있으면 원격 이미지
                : require('@/assets/images/character1.png') // 없으면 로컬 디폴트 이미지
            }
          />
        </RoomImageContainer>
        <RoomWrapper>
          <RoomTop>
            <ChatPeopleContainer>
              <ChatPerson>
                {data.roomName ? (data.roomName.length > 22 ? data.roomName.slice(0, 22) + '...' : data.roomName) : ''}
              </ChatPerson>
              {data.participantCount > 2 && <ChatPeople>{data.participantCount}</ChatPeople>}
            </ChatPeopleContainer>
            <ChatTime>{formatTime(data.lastMessageTime)}</ChatTime>
          </RoomTop>
          <RoomBottom>
            <ChatContent textColor={data.unreadCount > 0}>
              {' '}
              {data.lastMessageContent
                ? data.lastMessageContent.length > 33
                  ? data.lastMessageContent.slice(0, 33) + '...'
                  : data.lastMessageContent
                : ''}
            </ChatContent>
            {data.unreadCount > 0 && (
              <ChatCountBox>
                <ChatCount>{data.unreadCount}</ChatCount>
              </ChatCountBox>
            )}
          </RoomBottom>
        </RoomWrapper>
      </RoomBox>
    </ChatRoom>
  );
};

export default MyChatRoomBox;

// 스타일 정의
const ChatRoom = styled.View`
  background-color: #1d1e1f;
  height: 80px;
  justify-content: center;
`;

const RoomBox = styled.TouchableOpacity`
  background-color: #1d1e1f;
  padding-top: 8px;
  height: 80px;
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #353637;
`;

const RoomImageContainer = styled.View`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
`;

const RoomImage = styled(RawProfileImage)`
  width: 80%;
  height: 80%;
  border-radius: 30px;
`;

const RoomWrapper = styled.View`
  width: 80%;
  height: 70px;
  flex-direction: column;
`;

const RoomTop = styled.View`
  height: 40%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const RoomBottom = styled.View`
  height: 45%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ChatPeopleContainer = styled.View`
  height: 30px;
  margin-top: 5px;
  flex-direction: row;
  align-items: center;
`;

const ChatPerson = styled.Text`
  font-size: 16px;
  margin-left: 5px;
  font-family: 'PlusJakartaSans_500Medium';
  color: #ffffff;
`;

const ChatPeople = styled.Text`
  font-size: 14px;
  margin-left: 8px;
  font-family: 'PlusJakartaSans_500Medium';
  color: #02f59b;
`;

const ChatTime = styled.Text`
  margin-top: 5px;
  font-size: 11px;
  font-family: 'PlusJakartaSans_300Light';
  color: #ffffff;
`;

const ChatContent = styled.Text<{ textColor?: boolean }>`
  font-size: 13px;
  margin-left: 1px;
  color: ${(props) => (props.textColor ? '#ffffff' : '#848687')};
  font-family: 'PlusJakartaSans_300Light';
`;

const ChatCountBox = styled.View`
  background-color: #02f59b;
  width: 23px;
  height: 23px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
`;

const ChatCount = styled.Text`
  font-family: 'PlusJakartaSans_600SemiBold';
  font-size: 9px;
  color: #1d1e1f;
`;
