import React,{useState,useRef,useEffect} from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { Client } from "@stomp/stompjs";
import * as SecureStore from 'expo-secure-store';
import api from "@/api/axiosInstance";
/*
#방법

Api 호출  -> ( 보낸 사람아이디 , 보낸사람 이름 , 보낸사람 프로필 사진 ) 받아오기
-> 프론트에서 저장 
위의 과정을 거치고
채팅방 메시지 기록 불러오기 -> ( 보낸사람 아이디 , 보낸 내용 , 보낸 시간 )*/

type ChatHistory = {
    //  Long id,
    //     Long roomId,
    //     Long senderId,
    //     String senderFirstName,
    //     String senderLastName,
    //     String senderImageUrl,
    //     String content,
    //     Instant sentAt
    // 메세지 id
    // 채팅방 아이디
    // 보낸 사람 아이디
    // 보낸 사람 이름
    // 보낸 사람 프로필 사진
    // 보낸 사람 아이디 
    // 보낸 내용
    // 보낸 시간
};

type OtherChatMessage={
    // 보낸 사람 아이디
    // 보낸 내용
    // 보낸 시간? 
};

type MyChatMessage={
    // roomId ?
    // 내 userId ?
    // 메세지 내용
    // 시간 ? 서버 or 프론트 ?
};

const ChattingRoomScreen=()=>{

    const router = useRouter();
    const { userId, roomName } = useLocalSearchParams<{ userId: string; roomName: string }>();
    const { roomId }= useLocalSearchParams<{ roomId : string }>();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");

    const stompClient = useRef<Client | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    console.log("userId",userId);
    console.log("name",roomName);
    console.log("roomId",roomId);

    // ✅ 기존 채팅 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 채팅 메세지 기록 받기
        const res =await api.get(`/api/v1/chat/rooms/${roomId}/first_messages`);
        console.log("채팅 메시지 기록",res.data.data);
        // 메시지 담기
        // setMessages(res);
      } catch (err) {
        console.log("채팅 기록 불러오기 실패", err);
      }
    };
    fetchHistory();
  }, [roomId]);


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
          stompClient.current?.subscribe(`/topic/rooms/${roomId}`, (message) => {
            const chatHistory: ChatHistory= JSON.parse(message.body); // 메시지 JSON 파싱
            const body = JSON.parse(message.body);
            setMessages((prev) => [...prev, body]);
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
      }, [roomId]); // 빈 배열 → 컴포넌트 마운트 시 한 번만 실행

    // ✅ 메시지 전송
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const msg = {
      roomId,
      senderId: userId,
      message: inputText,
      createdAt: new Date().toISOString(),
    };

    stompClient.current?.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify(msg),
    });

    setInputText(""); // 입력창 비우기
  };
    const onhandleNext = () => {
  router.push({
    pathname: './ChatInsideMember',  
    params: {
      roomId: roomId,
      roomName: roomName
    },
  });
};
    return(
        <SafeArea>
             <StatusBar barStyle="light-content" />
             <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            <Container>
                <HeaderContainer>
                        <Left>
                            <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="arrow-left" size={27} color="#CCCFD0" />
                            </TouchableOpacity>
                        </Left>
                        <Center>
                            <HeaderTitleText>{roomName}</HeaderTitleText>
                        </Center>
                        <Right>
                            <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="search" size={26} color="#CCCFD0" />
                            </TouchableOpacity>
                             <TouchableOpacity onPress={onhandleNext}>
                            <SimpleLineIcons name="menu" size={26} color="#CCCFD0"  style={{ marginLeft: 10 }}  />
                            </TouchableOpacity>
                        </Right>
                </HeaderContainer>
                <ScrollView
                        contentContainerStyle={{ paddingBottom: 100 }} // 아래 여백 확보
                        showsVerticalScrollIndicator={false}
                    >
                <ChattingScreen>
                {/* 이 TimeView는 그 전 날짜랑 비교했을때 바뀌면 표시  */}
                <TimeView>
                    <TimeText>2025.08.15(Fri)</TimeText>
                </TimeView>
                {/* 보낸사람 아이디랑 내 아이디랑 같으면 오른쪽 컨테이너 , 내 아이디랑 다르면 무조건 왼쪽 컨테이너
                유저가 바뀔때 처음에만 프로필 표시 그 다음부터는 대화박스만
                시간이 같은 대화들중 제일 마지막만 시간표시 */}
                <ChattingLeftContainer>
                    <ProfileContainer>
                        <ProfileBox>
                            <ProfileImage source={require("@/assets/images/character2.png")}/>
                        </ProfileBox>
                    </ProfileContainer>
                    <OtherContainer>
                        <OtherNameText>Kori</OtherNameText>
                        <LeftMessageBox>
                          <OtherFirstTextBox>
                            <OtherText>Hola~</OtherText>
                          </OtherFirstTextBox>
                          <ChatTimeText>16:30</ChatTimeText>
                        </LeftMessageBox>
                        <LeftMessageBox>
                        <OtherNotFirstTextBox>
                            <OtherText>Hola~ Vine a Corea desde Estados Unidos como estudiante de intercambio</OtherText>
                        </OtherNotFirstTextBox>
                        <ChatTimeText>16:30</ChatTimeText>
                        </LeftMessageBox>
                    </OtherContainer>
                    
                </ChattingLeftContainer>
                <ChattingRightContainer>
                    <MyChatTimeText>08:30</MyChatTimeText>
                    <MyTextFirstBox>
                        <MyText>I think</MyText>
                    </MyTextFirstBox>
                </ChattingRightContainer>
                <ChattingRightContainer>
                    <MyChatTimeText>08:30</MyChatTimeText>
                    <MyTextNotFirstBox>
                        <MyText>I think</MyText>
                    </MyTextNotFirstBox>
                </ChattingRightContainer>
                <Divider/>
                <TimeView>
                    <TimeText>2025.08.15(Fri)</TimeText>
                </TimeView>

                <ChattingLeftContainer>
                    <ProfileContainer>
                        <ProfileBox>
                            <ProfileImage source={require("@/assets/images/character2.png")}/>
                        </ProfileBox>
                    </ProfileContainer>
                    <OtherContainer>
                        <OtherNameText>Kori</OtherNameText>
                        <LeftMessageBox>
                          <OtherFirstTextBox>
                            <OtherText>Hola~</OtherText>
                          </OtherFirstTextBox>
                          <ChatTimeText>16:30</ChatTimeText>
                        </LeftMessageBox>
                        <LeftMessageBox>
                        <OtherNotFirstTextBox>
                            <OtherText>Hola~ Vine a Corea desde Estados Unidos como estudiante de intercambio</OtherText>
                        </OtherNotFirstTextBox>
                        <ChatTimeText>16:30</ChatTimeText>
                        </LeftMessageBox>
                    </OtherContainer>
                    
                </ChattingLeftContainer>
                </ChattingScreen>
                </ScrollView>
                
                <BottomContainer>
                    <BottomInputBox
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="메시지를 입력하세요"
                        placeholderTextColor="#888"
                    />
                    <SendImageBox onPress={sendMessage}>
                        <SendImage source={require("@/assets/images/Send.png")}/>
                    </SendImageBox>
                </BottomContainer>
                 <TranslateButtonBox>
                        <TranslateImage source={require("@/assets/images/translate.png")}/>
                    </TranslateButtonBox>
            </Container>
            </KeyboardAvoidingView>
        </SafeArea>


    );

}

export default ChattingRoomScreen;

const SafeArea=styled.SafeAreaView`
    flex:1;
    background-color:#1D1E1F;
    
`;
const Container=styled.View`
    flex:1;
    background-color:#1D1E1F;
    padding:0px 15px;
    
`;

const HeaderContainer=styled.View`
    flex-direction:row;
    height:10%;
    align-items:center;
    justify-content: center;
    
`;

const HeaderTitleText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:18px;

`;

const Left=styled.View`
    flex:1;
`;
const Center=styled.View`
    flex:2;
    align-items:center;
`;
const Right=styled.View`
    flex-direction:row;
    flex:1;
    justify-content:center;

`;

const ChattingScreen=styled.View`
    flex:1;
    flex-direction: column; 
    
`;
const TimeView=styled.View`
    align-items:center;
    justify-content:center;
    margin:5px 0px;
`;
const TimeText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:11px;
`;

const ChattingLeftContainer = styled.View`
  align-self: flex-start; /* 왼쪽 끝 */
  max-width:280px;   /* 최대 너비 */
  flex-direction: row;
  margin:10px 0px;
`;

const ProfileContainer=styled.View`
   
    width:38px; 

`;
const ProfileBox=styled.View`
    width:38x;
    height:38px;

`;

const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;


const OtherContainer=styled.View`

    max-width:242px;
    padding-left:7px;
`;
const OtherNameText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
`;

const LeftMessageBox=styled.View`
    max-width:250px;
    align-self: flex-start;  /* 부모 기준 왼쪽 정렬 */
    margin-top:5px;
    flex-direction:row;
    justify-content: flex-end;   /* 가로 방향 끝 */
    align-items: flex-end;       /* 세로 방향 끝 */
`;
const OtherFirstTextBox=styled.View`
  background-color: #414142;
  padding: 8px 12px;
  max-width: 210px;        /* 최대 너비만 제한 */
  border-top-left-radius: 0px;   /* 왼쪽 상단만 0 */
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  align-self: flex-start;  /* 부모 기준 왼쪽 정렬 */
  align-items:center;
  justify-content:center;
`;

const OtherText=styled.Text`
    color:#FFFFFF;
    font-size:14px;
    font-family:PlusJakartaSans_300Light;
`;
const OtherNotFirstTextBox=styled.View`
    background-color:#414142;
    max-width:210px;
    padding:8px 12px;;
    border-radius:16px;
    align-items:center;
    justify-content:center;
    align-self: flex-start;  /* 부모 기준 왼쪽 정렬 */
`;
const ChatTimeText=styled.Text`
    color:#848687;
    font-size:10px;
    font-family:PlusJakartaSans_300Light;
    margin-left:3px;
    
`;

const ChattingRightContainer = styled.View`
  align-self: flex-end;  /* 부모 기준 왼쪽 정렬 */
  max-width:280px;   /* 최대 너비 */
  flex-direction: row;
  margin:2px 0px;
  justify-content: flex-start;   /* 가로 방향 끝 */
  align-items: flex-end;       /* 세로 방향 끝 */
  margin-right:8px;
  
`;

const MyChatTimeText=styled.Text`
    color:#848687;
    font-size:10px;
    font-family:PlusJakartaSans_300Light;
    margin-right:4px;
    
`;
const MyTextFirstBox=styled.View`
  background-color: #02F59B;
  padding: 8px 12px;
  max-width: 210px;        /* 최대 너비만 제한 */
  border-top-left-radius: 16px;   /* 왼쪽 상단만 0 */
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 0px;
  align-self: flex-end;  /* 부모 기준 왼쪽 정렬 */
  align-items:center;
  justify-content:center;
`;

const MyTextNotFirstBox=styled.View`
  background-color: #02F59B;
  padding: 8px 12px;
  max-width: 210px;        /* 최대 너비만 제한 */
  border-top-left-radius: 16px;   /* 왼쪽 상단만 0 */
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  align-self: flex-end;  /* 부모 기준 왼쪽 정렬 */
  align-items:center;
  justify-content:center;
`;
const MyText=styled.Text`
    color:#1D1E1F;
    font-size:14px;
    font-family:PlusJakartaSans_400Regular;
    
`;

const Divider=styled.View`
   height:3px;
   background-color:#35363799;
   margin:10px 0px;
`;
const TranslateButtonBox=styled.TouchableOpacity`
    position:absolute;
    bottom:100px;
    right:10px;
    width:50px;
    height:50px;
    border-radius:30px;
    z-index:999;
    align-items:center;
    justify-content:center;
    flex-direction:row;
    align-items:center;

`;

const TranslateImage=styled.Image`
    width:75px;
    heigth:75px;
    resize-mode:contain;
`;
const BottomContainer=styled.View`
    background-color:#1D1E1F;
    height:90px;
    border-top-width:1px;
    border-top-color:#353637;
    flex-direction:row;
    
`;
const BottomInputBox=styled.TextInput`
    background-color:#353637;
    border-radius:8px;
    width:85%;
    height:45px;
    margin-top:10px;
    padding-left:10px;
`;

const SendImageBox=styled.TouchableOpacity`
    width:23px;
    height:23px;
    margin:20px;
`;

const SendImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;



