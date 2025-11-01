import api from '@/api/axiosInstance';
import GroupChatRoomBox from '@/src/features/chat/components/GroupChatRoomBox';
import MyChatRoomBox from '@/src/features/chat/components/MyChatRoomBox';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';

type ChatRoom = {
  roomId: string; // 채팅방 아이디
  roomName: string; // 채팅방 이름
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
  roomImageUrl?: string;
  participantCount?: number;
};

export default function ChatScreen() {
  const router = useRouter();
  const [chatrooms, setChatRooms] = useState<ChatRoom[]>([]);
  const stompClient = useRef<Client | null>(null);
  const [isGroupChat, setisGroupChat] = useState(false);

  const changeTomyChat = () => setisGroupChat(false);
  const changeToGroupChat = () => setisGroupChat(true);
  const createNewSpace = () => router.push('/chat/CreateSpaceScreen');

  // 🔹 accessToken 재발급 함수
  const refreshTokenIfNeeded = async (): Promise<string | null> => {
    try {
      const refresh = await SecureStore.getItemAsync('refresh');
      if (!refresh) return null;
      const res = await api.post('/api/v1/member/refresh', { refreshToken: refresh });
      const newToken = res.data.data.accessToken;
      const newRefreshToken = res.data.data.refreshToken;
      if (newToken) {
        await SecureStore.setItemAsync('jwt', newToken);
        await SecureStore.setItemAsync('refresh', newRefreshToken);

        return newToken;
      }
      return null;
    } catch (err) {
      console.error('[AUTH] 토큰 재발급 실패', err);
      return null;
    }
  };

  // 🔹 채팅방 목록 가져오기
  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/v1/chat/rooms');

      setChatRooms(res.data.data);
    } catch (err) {
      console.error('채팅방 불러오기 실패:', err);
    }
  };

  // 🔹 화면 focus 될 때마다 채팅방 갱신
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, []),
  );

  useEffect(() => {
    const connectStomp = async () => {
      let token = await SecureStore.getItemAsync('jwt');
      const MyuserId = await SecureStore.getItemAsync('MyuserId');

      if (!token) {
        token = await refreshTokenIfNeeded();
        if (!token) return console.error('[AUTH] 토큰 없음, STOMP 연결 불가');
      }

      stompClient.current = new Client({
        webSocketFactory: () => new WebSocket('wss://dev.ko-ri.cloud/ws'),
        forceBinaryWSFrames: true,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 30000,
        heartbeatIncoming: 60000,
        heartbeatOutgoing: 60000,
        debug: (str) => console.log('[STOMP]', str),
      });

      stompClient.current.onConnect = () => {
        stompClient.current?.subscribe(`/topic/user/${MyuserId}/rooms`, (msg) => {
          const updatedRoom: ChatRoom = JSON.parse(msg.body);
          setChatRooms((prev) => {
            const filtered = prev.filter((room) => room.roomId !== updatedRoom.roomId);
            return [updatedRoom, ...filtered];
          });
        });
      };

      // 🔹 STOMP Error → 토큰 만료 시 refresh 후 재연결
      stompClient.current.onStompError = async (frame) => {
        const newToken = await refreshTokenIfNeeded();
        if (!newToken) return console.log('[AUTH] 토큰 재발급 실패');
        stompClient.current?.deactivate();
        connectStomp();
      };
      stompClient.current.onWebSocketClose = () => {
        console.warn('웹소켓 끊김');
      };

      stompClient.current.onWebSocketError = (evt) => console.error('WebSocket ERROR', evt);
      stompClient.current.onWebSocketClose = (evt) => console.log('WebSocket CLOSE', evt);

      stompClient.current.activate();
    };

    connectStomp();

    return () => {
      stompClient.current?.deactivate();
    };
  }, []);

  const goSearch = () => {
    router.push({
      pathname: '../../screens/chatscreen/SearchChatRoom',
      params: { isGroupChat: String(isGroupChat) },
    });
  };

  return (
    <Safe>
      <Container>
        <Header>
          <TitleWrapper>
            <Title>Chat</Title>
            <IconImage source={require('../../../assets/images/IsolationMode.png')} />
          </TitleWrapper>
          <SearchButton onPress={goSearch}>
            <Feather name="search" size={25} color="#CCCFD0" />
          </SearchButton>
        </Header>

        <ChatWrapper>
          <ChatBox>
            <MyChatBox isGroupChat={isGroupChat} onPress={changeTomyChat}>
              <MyChatText isGroupChat={isGroupChat}>My chat</MyChatText>
            </MyChatBox>
          </ChatBox>
          <ChatBox>
            <GroupChatBox isGroupChat={isGroupChat} onPress={changeToGroupChat}>
              <GroupChatText isGroupChat={isGroupChat}>Linked Space</GroupChatText>
            </GroupChatBox>
          </ChatBox>
        </ChatWrapper>

        {!isGroupChat ? (
          <FlatList
            data={chatrooms}
            renderItem={({ item }) => <MyChatRoomBox data={item} />}
            keyExtractor={(item) => item.roomId}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <GroupChatRoomBox />
        )}

        {isGroupChat && (
          <CreateSpaceButton onPress={createNewSpace}>
            <AntDesign name="plus" size={24} color="black" />
          </CreateSpaceButton>
        )}
      </Container>
    </Safe>
  );
}

// ================= styled-components =================
const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`
  flex: 1;
  padding: 0px 20px;
`;
const Header = styled.View`
  height: 70px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const SearchButton = styled.TouchableOpacity``;
const TitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;
const Title = styled.Text`
  color: #ffffff;
  font-size: 32px;
  font-family: 'InstrumentSerif_400Regular';
`;
const IconImage = styled.Image`
  margin-left: 4px;
  width: 20px;
  height: 20px;
`;
const ChatWrapper = styled.View`
  height: 50px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #616262;
`;
const ChatBox = styled.View`
  width: 50%;
  height: 50px;
  align-items: center;
  justify-content: center;
`;
const MyChatBox = styled.TouchableOpacity`
  width: 70%;
  height: 50px;
  margin: 0px 100px;
  border-bottom-color: ${(props) => (props.isGroupChat ? '#616262' : '#02F59B')};
  border-bottom-width: ${(props) => (props.isGroupChat ? '1px' : '2px')};
  align-items: center;
  justify-content: center;
`;
const GroupChatBox = styled.TouchableOpacity`
  width: 70%;
  height: 50px;
  border-bottom-color: ${(props) => (props.isGroupChat ? '#02F59B' : '#616262')};
  border-bottom-width: ${(props) => (props.isGroupChat ? '2px' : '1px')};
  align-items: center;
  justify-content: center;
`;
const MyChatText = styled.Text`
  color: ${(props) => (props.isGroupChat ? '#616262' : '#02F59B')};
  font-family: 'PlusJakartaSans_500Medium';
  font-size: 16px;
`;
const GroupChatText = styled.Text`
  color: ${(props) => (props.isGroupChat ? '#02F59B' : '#616262')};
  font-family: 'PlusJakartaSans_500Medium';
  font-size: 16px;
`;
const CreateSpaceButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 30px;
  background-color: #02f59b;
  justify-content: center;
  align-items: center;
  z-index: 999;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 3.84px;
`;
