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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

type ChatHistory = {
    id: number,
    roomId: number,
    senderId: number,
    senderFirstName: string,
    senderLastName: string,
    senderImageUrl: string,
    content: string,
    sentAt: string,
};

type TranslatedChatMessage = {
    id :number,
    roomId:number,
    senderId:number,
    originContent:string,
    targetContent:string,
    sentAt:string,
    senderFirstName:string,
    senderLastName:string,
    senderImageUrl:string
};

const { height } = Dimensions.get('window');

const ChattingRoomScreen=()=>{
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { userId, roomName } = useLocalSearchParams<{ userId: string; roomName: string }>();
    const { roomId } = useLocalSearchParams<{ roomId : string }>();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [myUserId,setMyUserId]=useState('');
    const [isTranslate,setIsTranslate]=useState(false);
    const [stompConnected, setStompConnected] = useState(false);  
    const stompClient = useRef<Client | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // ---------------------- 토큰 refresh 함수 ----------------------
    const refreshTokenIfNeeded = async (): Promise<string | null> => {
        try {
            const refresh = await SecureStore.getItemAsync("refresh");
            if (!refresh) return null;
            const res = await api.post("/api/v1/member/refresh", { refreshToken: refresh });
            const newToken = res.data.accessToken;
            await SecureStore.setItemAsync("jwt", newToken);
            console.log("[AUTH] 토큰 재발급 성공");
            return newToken;
        } catch (err) {
            console.error("[AUTH] 토큰 재발급 실패", err);
            return null;
        }
    };
    

    // ---------------------- STOMP 연결 함수 ----------------------
    const connectStomp = async () => {
        let token = await SecureStore.getItemAsync("jwt");
        const myId = await SecureStore.getItemAsync('MyuserId');

        if (!myId) return console.error("[AUTH] 유저ID 없음");

        // token 없으면 refresh
        if (!token) {
            token = await refreshTokenIfNeeded();
            if (!token) return console.error("[AUTH] 유효한 토큰 없음, 연결 실패");
        }

        setMyUserId(myId);

        const connectHeaders = { Authorization: `Bearer ${token}` };

        stompClient.current = new Client({
            webSocketFactory: () => new global.WebSocket('wss://dev.ko-ri.cloud/ws'),
            connectHeaders,
            forceBinaryWSFrames: true,
            reconnectDelay: 30000,
            heartbeatIncoming: 60000,
            heartbeatOutgoing: 60000,
            debug: (str) => console.log('[STOMP DEBUG]', str),
        });

        stompClient.current.onConnect = (frame) => {
            console.log('✅ STOMP 연결 성공');
            setStompConnected(true);
            subscribeToMessages(myId);
        };

        // STOMP 오류 처리
        stompClient.current.onStompError = async (frame) => {
            console.error('❌ STOMP 오류', frame.headers['message']);
            if (frame.headers['message']?.includes('401')) {
                console.log("[AUTH] 토큰 만료 감지, refresh 시도");
                const newToken = await refreshTokenIfNeeded();
                if (!newToken) return console.error("[AUTH] 토큰 재발급 실패");
                stompClient.current?.deactivate();
                connectStomp();
            }
        };

        stompClient.current.onWebSocketError = (evt) => console.error('WebSocket 오류', evt);
        stompClient.current.onWebSocketClose = (evt) => console.log('WebSocket 종료', evt);

        console.log("🚀 STOMP 연결 시도...");
        stompClient.current.activate();
    };

    const subscribeToMessages = (myId: string) => {
        stompClient.current?.subscribe(`/topic/user/${myId}/messages`, (message) => {
            const body = JSON.parse(message.body);
            setMessages((prev) => [body, ...prev]);
        });
    };

    useEffect(() => {
        fetchHistory();
        connectStomp();

        return () => {
            if (stompClient.current?.connected) {
                console.log("🧹 STOMP 연결 해제");
                stompClient.current.deactivate();
            }
            setStompConnected(false);
        };
    }, []);

    // ---------------------- 메시지 불러오기 ----------------------
    const fetchHistory = async () => {
        try {
            const initTranslate = await api.post(`api/v1/chat/rooms/${roomId}/translation`, { translateEnabled: false });
            if (initTranslate) {
                const res = await api.get(`/api/v1/chat/rooms/${roomId}/first_messages`);
                const chatHistory: ChatHistory[] = res.data.data;
                setMessages([...chatHistory]);
            }
            setIsTranslate(false);
        } catch (err) {
            console.log("채팅 기록 불러오기 실패", err);
        }
    };

    // ---------------------- 메시지 전송 ----------------------
    const sendMessage = async () => {
        if (!inputText.trim()) return;
        if (!stompConnected) return console.warn('STOMP 미연결');

        const msg = { roomId, senderId: myUserId, content: inputText };

        try {
            stompClient.current?.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(msg),
            });
            setInputText("");
        } catch (err: any) {
            console.error("메시지 전송 실패", err);
            if (err.message?.includes("401")) {
                const newToken = await refreshTokenIfNeeded();
                if (!newToken) return console.error("[AUTH] 토큰 재발급 실패");
                connectStomp();
                stompClient.current?.publish({
                    destination: "/app/chat.sendMessage",
                    body: JSON.stringify(msg),
                });
                setInputText("");
            }
        }
    };
    
    // ---------------------- 번역 업데이트 ----------------------
    const updateTranslateScreen = async () => {
        try {
            await api.post(`api/v1/chat/rooms/${roomId}/translation`, { translateEnabled: true });
            const res = await api.get(`/api/v1/chat/rooms/${roomId}/messages`);
            const translatedChatMessage: TranslatedChatMessage[] = res.data.data;
            setMessages([...translatedChatMessage]);
            setIsTranslate(true);
        } catch (err) {
            console.log("번역된 채팅 기록 불러오기 실패", err);
        }
    };

    // 무한 스크롤
   const fetchMoreHistory = async () => {
        if ( !hasMore) return;

        setIsFetchingMore(true);

        try {
            const lastMessageId = messages[messages.length - 1]?.id;
            const res = await api.get(`/api/v1/chat/rooms/${roomId}/messages?lastMessageId=${lastMessageId}`);

            const olderMessages: ChatHistory[] = res.data.data;

            if (olderMessages.length === 0) {
            setHasMore(false);
            } else {
            setMessages((prev) => [...prev, ...olderMessages]); // inverted → 배열 뒤쪽에 붙이기
            }
        } catch (err) {
            console.log("이전 메시지 불러오기 실패", err);
        } finally {
            setIsFetchingMore(false);
        }
};

    const onhandleNext = () => {
        router.push({
            pathname: './ChatInsideMember',  
            params: { roomId, roomName },
        });
    };

    // 시간 변환 함수
    const formatTime = (sentAt: string | number) => {
        const ts = typeof sentAt === "string" ? Date.parse(sentAt) : sentAt * 1000;
        const date = new Date(ts);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };
    const formatDate=(utcSeconds: number): string=> {
    // 초 단위이므로 밀리초로 변환
    const date = new Date(utcSeconds * 1000);

    // 요일 배열
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const weekday = weekdays[date.getUTCDay()];

    return `${year}.${month}.${day} (${weekday})`;
    }

    return (
        <SafeArea>
            <StatusBar barStyle="light-content" />
            <Container>
                {/* 헤더 */}
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
                        <TouchableOpacity onPress={onhandleNext}>
                            <SimpleLineIcons name="menu" size={23} color="#CCCFD0" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </Right>
                </HeaderContainer>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 50 : 30}
                    >
                {/* 채팅 화면 */}
                <ChattingScreen>
                    <FlatList
                        data={messages}
                        keyExtractor={item => item.id.toString()}
                        inverted
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'flex-end',
                            paddingTop: 10,
                            paddingBottom: 10
                        }}
                        onEndReached={fetchMoreHistory} // 스크롤 상단에서 이전 메시지 로딩
                        onEndReachedThreshold={0.1}
                        renderItem={({ item, index }) => {
                            const isMyMessage = item.senderId.toString() === myUserId;
                            // 프로필 표시 로직
                            const showProfile = index === messages.length - 1 || (messages[index + 1] && messages[index + 1].senderFirstName !== item.senderFirstName);
                            const isSameUser= ((index>0)&&(messages[index-1].senderFirstName === messages[index].senderFirstName));
                            const showTime=(index===0) ||
                                ((index>0)&&(formatTime(messages[index-1].sentAt)!==formatTime(messages[index].sentAt))&&(isSameUser))
                                || !isSameUser;
                            const showDate=(index === messages.length - 1) || (messages[index + 1] && formatDate(messages[index + 1].sentAt) !== formatDate(item.sentAt));
                            
                            console.log(index,item);
                            console.log(formatDate(item.sentAt))
                            if (isMyMessage) {
                                return showProfile ? (
                                    <>
                                    <ChattingRightContainer showProfile={showProfile}>
                                        {showTime&&
                                        <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>}
                                        <MyTextFirstBox>
                                            <MyText>{isTranslate ? item.targetContent : (item.content || item.originContent)}</MyText>
                                        </MyTextFirstBox>
                                    </ChattingRightContainer>  
                                      {showDate&&
                                    <DateTimeView>
                                        <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                                    </DateTimeView>} 
                                    </>
                                ) : (
                                    <>
                                    <ChattingRightContainer>
                                          {showTime&&
                                        <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>}
                                        <MyTextNotFirstBox>
                                            <MyText>{isTranslate ? item.targetContent : (item.content || item.originContent)}</MyText>
                                        </MyTextNotFirstBox>
                                    </ChattingRightContainer>
                                      {showDate&&
                                    <DateTimeView>
                                        <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                                    </DateTimeView>}
                                    </>
                                );
                            } else {
                                return showProfile ? (
                                    <>
                                    <ChattingLeftContainer showProfile={showProfile}>
                                        <ProfileContainer>
                                            <ProfileBox>
                                                <ProfileImage source={{ uri: item.senderImageUrl }} />
                                            </ProfileBox>
                                        </ProfileContainer>
                                        <OtherContainer>
                                            <OtherNameText>{item.senderLastName}</OtherNameText>
                                            <LeftMessageBox>
                                                <OtherFirstTextBox>
                                                    <OtherText>{isTranslate ? item.targetContent : (item.content || item.originContent)}</OtherText>
                                                </OtherFirstTextBox>
                                                  {showTime&&
                                                <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>}
                                            </LeftMessageBox>
                                        </OtherContainer>
                                    </ChattingLeftContainer>
                                    {showDate&&
                                    <DateTimeView>
                                        <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                                    </DateTimeView>}
                                    </>
                                ) : (
                                    <>
                                    <ChattingLeftContainer>
                                        <ProfileContainer></ProfileContainer>
                                        <OtherContainer>
                                            <LeftMessageBox>
                                                <OtherNotFirstTextBox>
                                                    <OtherText>{isTranslate ? item.targetContent : (item.content || item.originContent)}</OtherText>
                                                </OtherNotFirstTextBox>
                                                  {showTime&&
                                                <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>}
                                            </LeftMessageBox>
                                        </OtherContainer>
                                    </ChattingLeftContainer>
                                      {showDate&&
                                    <DateTimeView>
                                        <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                                    </DateTimeView>}
                                    </>
                                );
                            }
                        }}
                    />

                    <BottomContainer style={{ paddingBottom: insets.bottom}}>
                        <BottomInputBox
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Enter a message"
                            placeholderTextColor="#888"
                        />
                        <SendImageBox onPress={sendMessage}>
                            <SendImage source={require("@/assets/images/Send.png")}/>
                        </SendImageBox>
                    </BottomContainer>

                    {!isTranslate && (
                        <TranslateButtonBox onPress={updateTranslateScreen}>
                            <TranslateImage source={require("@/assets/images/translate.png")}/>
                        </TranslateButtonBox>
                    )}
                    {isTranslate && (
                        <TranslatingButtonBox onPress={fetchHistory}>
                            <TranslatingImage source={require("@/assets/images/translating.png")}/>
                        </TranslatingButtonBox>
                    )}
                </ChattingScreen>
                </KeyboardAvoidingView>
            </Container>
        </SafeArea>
    );
};

export default ChattingRoomScreen;

// ===================== styled-components =====================
const SafeArea=styled.SafeAreaView` 
flex:1; background-color:#1D1E1F; 
`;
const Container=styled.View`
 flex:1; background-color:#1D1E1F; padding:0px 15px; 
 `;
const HeaderContainer=styled.View` 
flex-direction:row; 
height:70px; 
align-items:center; 
justify-content: center; 
`;
const HeaderTitleText=styled.Text` 
color:#FFFFFF; font-family:PlusJakartaSans_500Medium; font-size:18px; 
`;
const Left=styled.View``;
const Center=styled.View` 
flex:1; justify-content:center; align-items:center;
 `;
const Right=styled.View`
 margin-right:5px; flex-direction:row; justify-content:center;
  `;
const ChattingScreen=styled.View` 
flex:1; flex-direction: column; padding-bottom:10px; 
`;
const ChattingLeftContainer = styled.View`
 margin-top: ${({ showProfile }) => (showProfile ? '30px' : '1px')};
  align-self: flex-start; max-width:280px; 
  flex-direction: row; 
  `;
const ProfileContainer = styled.View` 
width: 38px; 
margin-right: 7px;
 `;
const LeftMessageBox = styled.View`
 max-width: 250px; 
 margin-top: 5px; 
 flex-direction: row; 
 align-items: flex-end; 
 justify-content: flex-start;
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
const OtherFirstTextBox=styled.View`
 background-color: #414142; 
 padding: 8px 12px; 
 max-width: 210px;
 border-top-left-radius: 0px;
border-top-right-radius: 16px;
border-bottom-left-radius: 16px;
border-bottom-right-radius: 16px;
align-self: flex-start; 
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
padding:8px 12px;
 border-radius:16px; 
 align-items:center; 
 justify-content:center; 
 align-self: flex-start; 
 `;
const ChatTimeText=styled.Text` 
color:#848687; 
font-size:10px; 
font-family:PlusJakartaSans_300Light;
 margin-left:3px; 
 `;
const ChattingRightContainer = styled.View` 
margin-top: ${({ showProfile }) => (showProfile ? '30px' : '5px')};
 align-self: flex-end; max-width:280px;
  flex-direction: row;
   justify-content: flex-start; 
   align-items: flex-end; 
   margin-right:8px;
    `;
const MyChatTimeText=styled.Text` 
color:#848687; 
font-size:10px; 
font-family:PlusJakartaSans_300Light;
 margin-right:4px; `;

const MyTextFirstBox=styled.View`
 background-color: #02F59B;
padding: 8px 12px;
   max-width: 210px; 
   border-top-left-radius: 16px;
    border-top-right-radius: 16px; 
    border-bottom-left-radius: 16px;
     border-bottom-right-radius: 0px;
      align-self: flex-end; 
      align-items:center; 
      justify-content:center; `;

const MyTextNotFirstBox=styled.View` 
background-color: #02F59B; 
padding: 8px 12px; max-width: 210px; 
border-radius: 16px; 
align-self: flex-end;
align-items:center; 
justify-content:center; 
`;
const MyText=styled.Text` 
color:#1D1E1F; 
font-size:14px; 
font-family:PlusJakartaSans_400Regular; 
`;
const TranslateButtonBox=styled.TouchableOpacity` 
position: absolute; 
bottom: ${height * 0.12}px;
right:10px; 
width:50px;
height:50px; 
border-radius:30px; 
z-index:999; 
align-items:center; 
justify-content:center; 
flex-direction:row; 
  `;
const TranslateImage=styled.Image` 
width:75px; 
height:75px; 
resize-mode:contain; 
`;
const TranslatingButtonBox=styled.TouchableOpacity` 
position: absolute; 
width:50px; 
height:50px; 
align-self:center; 
border-radius:30px; 
z-index:999; 
align-items:center; 
justify-content:center; 
flex-direction:row; 
`;
const TranslatingImage=styled.Image`
 width:130px; 
 height:130px;
  resize-mode:contain; 
  `;
const BottomContainer=styled.View`
background-color:#1D1E1F;
height:50px; 

border-top-width:1px; 
border-top-color:#353637; 
flex-direction:row; 
`;
const BottomInputBox=styled.TextInput` 
background-color:#353637; 
color:#ffffff; 
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

 const DateTimeView=styled.View`
    margin:20px 0px 10px 0px;
    height:20px;
    justify-content:center;
    align-items:center;
 `;

 const DateTimeText=styled.Text`
    color:#848687;
    font-size:12px;
    font-family:PlusJakartaSans_600SemiBold;
 `;

 const LoadingText = styled.Text`
  color: #ccc;
  text-align: center;
  padding: 10px;
  font-size: 12px;
`;