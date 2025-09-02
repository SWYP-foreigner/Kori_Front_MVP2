import React,{useState,useRef,useEffect} from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar, FlatList,KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
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
    "id": number,
  "roomId": number,
  "senderId": number,
  "senderFirstName": string,
  "senderLastName": string,
  "senderImageUrl": string,
  "content": string,
  "sentAt": string, //"2025-09-01T15:17:19.523Z"  
};





const ChattingRoomScreen=()=>{

    const router = useRouter();
    const { userId, roomName } = useLocalSearchParams<{ userId: string; roomName: string }>();
    const { roomId }= useLocalSearchParams<{ roomId : string }>();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [myUserId,setMyUserId]=useState('');
    const [isTranslate,setIsTranslate]=useState(false);
    // STOMP 연결 상태 플래그
    const [stompConnected, setStompConnected] = useState(false);    
    

    const stompClient = useRef<Client | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const setMyId=async()=>{
     const myId: string | null = await SecureStore.getItemAsync('MyuserId');
    if (myId) {
      setMyUserId(myId); // null이 아니면 상태 업데이트
    }
    };
    // ✅ 기존 채팅 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
        setMyId();
      try {
        // 채팅 메세지 기록 받기
         const initTranslate= await api.post(`api/v1/chat/rooms/${roomId}/translation`, {
                translateEnabled: false,
            });
        if(initTranslate){
            const res =await api.get(`/api/v1/chat/rooms/${roomId}/first_messages`);
            const chatHistory:ChatHistory[]=res.data.data;
                // 메시지 담기
            setMessages([...chatHistory.reverse()])
        }
      } catch (err) {
        console.log("채팅 기록 불러오기 실패", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchTranslateScreen= async () => {
      try {
        // 채팅 메세지 기록 받기
             const res =await api.get(`/api/v1/chat/rooms/${roomId}/messages`);
             const chatHistory:ChatHistory[]=res.data.data;
                // 메시지 담기
            setMessages([...chatHistory.reverse()])
    
      } catch (err) {
        console.log("채팅 기록 불러오기 실패", err);
      }
    };
    fetchTranslateScreen();
    // ⬇️ 컴포넌트가 unmount 될 때 실행됨
  return () => {
    console.log("채팅 화면 나감");
    setIsTranslate(false); // 초기화
  };
  }, [isTranslate]);

useEffect(() => {
    const connectStomp = async () => {
        // 1. SecureStore에서 토큰과 유저 ID를 비동기로 가져옵니다.
        const token = await SecureStore.getItemAsync("jwt");
        const myId = await SecureStore.getItemAsync('MyuserId');
        
        // 2. 토큰과 ID가 유효한지 반드시 확인합니다.
        console.log("[AUTH] 토큰:", token ? "존재함" : "없음");
        console.log("[AUTH] 유저ID:", myId);
        
        if (!myId || !token) {
            console.error("[AUTH] 토큰 또는 유저ID가 없어 연결을 시작할 수 없습니다.");
            return;
        }
        
        setMyUserId(myId);

        // 3. 연결 헤더를 미리 만듭니다.
        const connectHeaders = {
            Authorization: `Bearer ${token}`,
        };
        console.log("[STOMP] 연결 헤더:", connectHeaders); // 헤더가 올바른지 최종 확인

        stompClient.current = new Client({
            webSocketFactory: () => new global.WebSocket('wss://dev.ko-ri.cloud/ws'),
            connectHeaders: connectHeaders, // 미리 만든 헤더 사용
            forceBinaryWSFrames: true,
           reconnectDelay: 30000,       // 재연결 간격 30초
           heartbeatIncoming: 60000,    // 서버 ping 1분
           heartbeatOutgoing: 60000,    // 클라이언트 ping 1분
            debug: (str) => console.log('[STOMP DEBUG]', str),
        });
        
        // --- 모든 콜백 설정 ---
        stompClient.current.onConnect = (frame) => {
            console.log('✅ [STOMP] onConnect: 연결 성공!', frame);
            setStompConnected(true);
            
            // ★★★★★ 수정된 부분 ★★★★★
            // 구독 경로를 정규식(/.../)이 아닌 템플릿 리터럴( `...` )로 수정합니다.
            const subscription = stompClient.current?.subscribe(
                `/topic/user/${myId}/messages`, 
                (message) => {
                    console.log("📩 [STOMP] 메시지 수신:", message.body);
                    const body = JSON.parse(message.body);
                    setMessages((prev) => [...prev, body]);
                }
            );
            console.log("📢 [STOMP] 채널 구독 완료:", subscription);
        };

        stompClient.current.onStompError = (frame) => {
            console.error('❌ [STOMP] onStompError: STOMP 프로토콜 오류', frame.headers['message']);
        };
        
        stompClient.current.onWebSocketError = (evt) => {
            console.error('❌ [STOMP] onWebSocketError: WebSocket 연결 오류', evt);
        };
        
        stompClient.current.onWebSocketClose = (evt) => {
            console.log('🔌 [STOMP] onWebSocketClose: 연결이 종료되었습니다.', evt);
        };

        // --- 연결 활성화 ---
        console.log("🚀 [STOMP] 연결을 시도합니다...");
        stompClient.current.activate();
    };

    connectStomp();

    // --- 컴포넌트 언마운트 시 정리 ---
    return () => {
        if (stompClient.current?.connected) {
            console.log("🧹 [STOMP] 연결을 해제합니다...");
            stompClient.current.deactivate();
        }
        setStompConnected(false);
    };
}, []);

    // ✅ 메시지 전송
  // 메시지 전송
    const sendMessage = () => {
        console.log("connect",myUserId);

    if (!inputText.trim()) return;
    if (!stompConnected) {
        console.warn('STOMP not connected yet');
        return;
    }

    const msg = {
        roomId: roomId,
        senderId: myUserId,
        content: inputText,
    };

    stompClient.current?.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(msg),
    });

    setInputText("");
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
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // 초 → 밀리초
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const updateTranslateScreen=async()=>{
   try {
     const res= await api.post(`api/v1/chat/rooms/${roomId}/translation`, {
      translateEnabled: true,
    });
    if(res)
    {
        setIsTranslate(true);
    }
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
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
                {/* <ScrollView
                        contentContainerStyle={{ paddingBottom: 100 }} // 아래 여백 확보
                        showsVerticalScrollIndicator={false}
                    > */}

                <ChattingScreen>
                     <FlatList
                        data={messages}
                        keyExtractor={item => item.id.toString()}
                        // inverted={true}
                        renderItem={({ item, index }) => {
                            const isMyMessage = item.senderId.toString() === myUserId;
                            
                            // 이전 메시지와 비교해서 같은 사람인지 확인
                            const showProfile =
                            index === 0 || messages[index -1].senderFirstName !== item.senderFirstName;
                            
                            

                            console.log("index",index);
                            console.log("item",item);
                            console.log("__________________")
                                
                            if (isMyMessage) {
                                
                            return showProfile? (
                           
                                <ChattingRightContainer showProfile={showProfile}>
                                    <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>
                                    <MyTextFirstBox>
                                        <MyText>{item.content}</MyText>
                                    </MyTextFirstBox>
                                </ChattingRightContainer>
                            ) : (
                                <ChattingRightContainer>
                                    <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>
                                    <MyTextNotFirstBox>
                                        <MyText>{item.content}</MyText>
                                    </MyTextNotFirstBox>
                                </ChattingRightContainer>
                            );
                      
                            } else {
                            return showProfile?(
                            <ChattingLeftContainer showProfile={showProfile}>
                                <ProfileContainer>
                                    <ProfileBox>
                                         <ProfileImage source={{ uri: item.senderImageUrl }} />
                                    </ProfileBox>
                                 </ProfileContainer>
                                <OtherContainer>
                                    <OtherNameText>{item.senderFirstName}</OtherNameText>
                                <LeftMessageBox>
                                <OtherFirstTextBox>
                                    <OtherText>{item.content}</OtherText>
                                </OtherFirstTextBox>
                                <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>
                                </LeftMessageBox>
                        </OtherContainer>
                        </ChattingLeftContainer>):(
                            <ChattingLeftContainer>
                                 <ProfileContainer>
                                    <ProfileBox>
                                    </ProfileBox>
                                 </ProfileContainer>
                               <OtherContainer>
                                 <LeftMessageBox>
                                <OtherNotFirstTextBox>
                                <OtherText>{item.content}</OtherText>
                                </OtherNotFirstTextBox>
                                <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>
                            </LeftMessageBox>
                            </OtherContainer>
                        </ChattingLeftContainer>);
                      
                            }
                        }}
                        />
                </ChattingScreen>
                        
                
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
                 <TranslateButtonBox onPress={updateTranslateScreen}>
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
  margin-top: ${({ showProfile }) => (showProfile ? '30px' : '1px')};
  align-self: flex-start; /* 왼쪽 끝 */
  max-width:280px;   /* 최대 너비 */
  flex-direction: row;
`;

// const ProfileContainer=styled.View`
   
//     width:38px; 

// `;
const ProfileContainer = styled.View`
  width: 38px;   /* 항상 공간 확보 */
  margin-right: 7px;
`;

const LeftMessageBox = styled.View`
  max-width: 250px;
  margin-top: 5px;
  flex-direction: row;
  align-items: flex-end; /* 세로 끝 정렬 */
  justify-content: flex-start; /* 왼쪽 정렬 고정 */
`;
const ProfileBox=styled.View`
    width:38px;
    height:38px;
    border-radius:100px;
    overflow:hidden;
`;

const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:cover;
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

// const LeftMessageBox=styled.View`
//     max-width:250px;
//     align-self: flex-start;  /* 부모 기준 왼쪽 정렬 */
//     margin-top:5px;
//     flex-direction:row;
//     justify-content: flex-end;   /* 가로 방향 끝 */
//     align-items: flex-end;       /* 세로 방향 끝 */
// `;
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
  margin-top: ${({ showProfile }) => (showProfile ? '30px' : '5px')};
  align-self: flex-end;  /* 부모 기준 왼쪽 정렬 */
  max-width:280px;   /* 최대 너비 */
  flex-direction: row;
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
    height:75px;
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


