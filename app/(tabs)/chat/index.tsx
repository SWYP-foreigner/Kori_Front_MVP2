import { SafeAreaView, Text,StatusBar ,FlatList} from 'react-native';
import styled from 'styled-components/native';
import Feather from '@expo/vector-icons/Feather';
import ChatRoomBox from '@/components/MyChatRoomBox';
import GroupChatRoomBox from '@/components/GroupChatRoomBox';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState , useRef } from 'react';
import { useRouter } from 'expo-router';
import { Client } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import api from '@/api/axiosInstance';

type ChatRoom = {
  roomId: string;        // 채팅방 아이디
  roomName: string;         // 채팅방 이름 (1:1: 상대방 이름, 그룹: 그룹 채팅방 이름)
  lastMessageContent: string;   // 마지막 채팅 내용
  lastMessageTime: string;      // 마지막 채팅 시간 
  unreadCount: number;   // 안 읽은 메시지 수
  roomImageUrl?: string; // 채팅방 사진 (1:1: 상대방 프로필, 그룹: 방 사진)
  participantCount?: number; // 채팅방 인원수 (옵션)
};

// ChatRoom 
// {
//   1. 채팅방 아이디
//   2. 채팅방 이름 ( 1:1 채팅 -> 이름 , 그룹채팅 -> 그룹 채팅방 이름) 
//   3. 마지막 채팅
//   4. 마지막 채팅 시간
//   5. 채팅방 사진 ( 1:1 채팅 -> 상대방 프로필 , 그룹채팅 -> 그룹채팅방 사진)
//   6. 안 읽은 메시지
//   7. 채팅방 인원수
// }

export default function ChatScreen() {
  const router=useRouter();
  const [chatrooms,setChatRooms]=useState<ChatRoom[]>([]);
  const stompClient =useRef<Client | null>(null);
  const [isGroupChat,setisGroupChat]=useState(false);

    const changeTomyChat=()=>{
      setisGroupChat(false);
    };
     const changeToGroupChat=()=>{
      setisGroupChat(true);
    };
    const createNewSpace=()=>{
      router.push('/chat/CreateSpaceScreen')
    }
      // ================== 1️⃣ 초기 채팅방 불러오기 ==================
  // 컴포넌트가 화면에 나타날 때 한 번만 서버에서 채팅방 리스트를 가져옴
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/api/v1/chat/rooms');
        const data: ChatRoom[] = res.data.data; // data 배열만 추출
        setChatRooms(data);
      } catch (err) {
        console.error('채팅방 불러오기 실패:', err);
      }
    };
    fetchRooms();
  }, []); // 빈 배열 → 마운트 시 한 번만 실행

  useEffect(() => {
    // 1️⃣ STOMP 연결을 위한 async 함수 정의
    const connectStomp = async () => {
      // 2️⃣ SecureStore에서 JWT 토큰과 유저 ID 불러오기
      const token = await SecureStore.getItemAsync("jwt");       // 로그인 시 저장한 accessToken
      const MyuserId = await SecureStore.getItemAsync("MyuserId"); // 로그인 시 저장한 userId
      // 3️⃣ STOMP Client 생성
      stompClient.current = new Client({
        webSocketFactory: () => new WebSocket('wss://dev.ko-ri.cloud/ws'), // HTTPS 서버 → wss 프로토콜 사용
        connectHeaders: {
          Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 추가
        },
        reconnectDelay: 5000, // 연결이 끊겼을 때 자동 재연결 간격(ms)
        debug: (str) => console.log('[STOMP]', str), // 디버그 로그
      });

      // 4️⃣ 연결 성공 시 콜백
      stompClient.current.onConnect = () => {
        console.log('STOMP connected');

        // 5️⃣ 채팅방 상태 변경 구독
        // /topic/user/{userId}/rooms 경로로 메시지 구독 → 새 채팅방, 메시지, 읽음 등 실시간 반영
        stompClient.current?.subscribe(`/topic/user/${MyuserId}/rooms`, (msg) => {
          const updatedRoom: ChatRoom = JSON.parse(msg.body); // 메시지 JSON 파싱

          // 6️⃣ 기존 배열에서 해당 채팅방 제거 후 맨 앞에 추가 → 최신 채팅방 위로
          setChatRooms((prev) => {
            const filtered = prev.filter((room) => room.roomId !== updatedRoom.roomId);
            return [updatedRoom, ...filtered];
          });
        });
      };

      // 7️⃣ STOMP 에러 처리
      stompClient.current.onStompError = (frame) => {
        console.error('STOMP ERROR', frame);
      };

      // 8️⃣ WebSocket 연결 활성화
      stompClient.current.activate();
    };

    // 9️⃣ STOMP 연결 함수 호출
    connectStomp();

    // 10️⃣ 언마운트 시 cleanup
    // 컴포넌트가 사라질 때 WebSocket 연결 종료 → 메모리 누수 방지
    return () => {
      stompClient.current?.deactivate();
    };
    }, []); // 빈 배열 → 컴포넌트 마운트 시 한 번만 실행

   
    return (
        <Safe>
        <Container>
        <Header>
        <TitleWrapper>
            <Title>Chat</Title>
            <IconImage source={require('../../../assets/images/IsolationMode.png')} />
        </TitleWrapper>
        <SearchButton>
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
        <GroupChatBox isGroupChat={isGroupChat}  onPress={changeToGroupChat}>
             <GroupChatText  isGroupChat={isGroupChat}>Linked Space</GroupChatText>
        </GroupChatBox>
        </ChatBox>
      </ChatWrapper>
      {!isGroupChat ? (
      <FlatList
      data={chatrooms}
      renderItem={({ item }) => <ChatRoomBox data={item} />}
      keyExtractor={item => item.roomId}
      showsVerticalScrollIndicator={false} 
      />
      ) : (
        <GroupChatRoomBox/>
      )}
        <CreateSpaceButton onPress={createNewSpace}>
          <AntDesign name="plus" size={24} color="black" />
        </CreateSpaceButton>
      </Container>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`
  flex: 1;
  padding: 0px 20px;
`;
const Header = styled.View`
  height:70px;
  flex-direction: row;
  justify-content:space-between;
  align-items: center;
`;

const SearchButton=styled.TouchableOpacity`
    
`;

const TitleWrapper=styled.View`
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
const ChatWrapper=styled.View`
    height:50px;
    flex-direction:row;
`;
const ChatBox=styled.View`
    width:50%;
    
    height:50px;
    align-items:center;
    justify-content:center;

`;
const MyChatBox=styled.TouchableOpacity`
   
    width:70%;
    height:50px;
    margin:0px 100px;
    border-bottom-color:${(props)=>(props.isGroupChat ? '#616262' :'#02F59B')};
    border-bottom-width:2px;
    align-items:center;
    justify-content:center;
`;
const GroupChatBox=styled.TouchableOpacity`
     
    width:70%;
    height:50px;
    border-bottom-color:${(props)=>(props.isGroupChat ? '#02F59B' :'#616262')};
    border-bottom-width:2px;
    align-items:center;
    justify-content:center;
`;

const MyChatText=styled.Text`

    color:${(props)=>(props.isGroupChat ? '#616262' :'#02F59B')};
    font-family:'PlusJakartaSans_500Medium';
    font-size:16px;
`;

const GroupChatText=styled.Text`

    color:${(props)=>(props.isGroupChat ? '#02F59B' :'#616262')};
    font-family:'PlusJakartaSans_500Medium';
    font-size:16px;
`;
const CreateSpaceButton=styled.TouchableOpacity`
    position:absolute;
    bottom:20px;
    right:20px;
    width:50px;
    height:50px;
    border-radius:30px;
    background-color:#02F59B;
    justify-content:center;
    align-items:center;
    z-index:999;
    elevation: 5;          /* Android 그림자 */
    shadow-color: #000;    /* iOS 그림자 */
    shadow-offset: 0px 2px;
    shadow-opacity: 0.3;
    shadow-radius: 3.84px;
`;
