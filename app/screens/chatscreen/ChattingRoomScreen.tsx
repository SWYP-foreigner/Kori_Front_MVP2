import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity, FlatList } from 'react-native';
import { Client } from "@stomp/stompjs";
import * as SecureStore from 'expo-secure-store';
import api from "@/api/axiosInstance";

type ChatHistory = {
  id: number;
  roomId: string;
  senderId: string;
  senderFirstName: string;
  senderImageUrl?: string;
  content: string;
  sentAt: string;
};

const ChattingRoomScreen = () => {
  const router = useRouter();
  const { userId, roomName, roomId } = useLocalSearchParams<{ userId: string; roomName: string; roomId: string }>();

  const [messages, setMessages] = useState<ChatHistory[]>([]);
  const [inputText, setInputText] = useState("");

  const stompClient = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 기존 채팅 기록 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/v1/chat/rooms/${roomId}/first_messages`);
        setMessages(res.data.data.reverse()); // FlatList inverted를 위해 순서 뒤집기
      } catch (err) {
        console.log("채팅 기록 불러오기 실패", err);
      }
    };
    fetchHistory();
  }, [roomId]);

  // STOMP 연결
  useEffect(() => {
    const connectStomp = async () => {
      const token = await SecureStore.getItemAsync("jwt");

      stompClient.current = new Client({
        webSocketFactory: () => new WebSocket('wss://dev.ko-ri.cloud/ws'),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP]', str),
      });

      stompClient.current.onConnect = () => {
        console.log('STOMP connected');
        stompClient.current?.subscribe(`/topic/rooms/${roomId}`, (message) => {
          const body: ChatHistory = JSON.parse(message.body);
          setMessages(prev => [body, ...prev]); // inverted 때문에 prepend
        });
      };

      stompClient.current.onStompError = (frame) => {
        console.error('STOMP ERROR', frame);
      };

      stompClient.current.activate();
    };

    connectStomp();

    return () => {
      stompClient.current?.deactivate();
    };
  }, [roomId]);

  // 메시지 전송
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

    setInputText("");
  };

  const onhandleNext = () => {
    router.push({
      pathname: './ChatInsideMember',
      params: { roomId, roomName },
    });
  };

  // FlatList renderItem
  const renderItem = ({ item }: { item: ChatHistory }) => (
    item.senderId === userId ? (
      <ChattingRightContainer>
        <MyChatTimeText>{new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</MyChatTimeText>
        <MyTextFirstBox>
          <MyText>{item.content}</MyText>
        </MyTextFirstBox>
      </ChattingRightContainer>
    ) : (
      <ChattingLeftContainer>
        <ProfileContainer>
          <ProfileBox>
            <ProfileImage source={{ uri: item.senderImageUrl || "" }} />
          </ProfileBox>
        </ProfileContainer>
        <OtherContainer>
          <OtherNameText>{item.senderFirstName}</OtherNameText>
          <OtherNotFirstTextBox>
            <OtherText>{item.content}</OtherText>
          </OtherNotFirstTextBox>
        </OtherContainer>
      </ChattingLeftContainer>
    )
  );

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                <SimpleLineIcons name="menu" size={26} color="#CCCFD0" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </Right>
          </HeaderContainer>

          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />

          <BottomContainer>
            <BottomInputBox
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="#888"
            />
            <SendImageBox onPress={sendMessage}>
              <SendImage source={require("@/assets/images/Send.png")} />
            </SendImageBox>
          </BottomContainer>

          <TranslateButtonBox>
            <TranslateImage source={require("@/assets/images/translate.png")} />
          </TranslateButtonBox>
        </Container>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};

export default ChattingRoomScreen;


const SafeArea = styled.SafeAreaView`
  flex:1;
  background-color:#1D1E1F;
`;

const Container = styled.View`
  flex:1;
  background-color:#1D1E1F;
  padding:0px 15px;
`;

const HeaderContainer = styled.View`
  flex-direction:row;
  height:10%;
  align-items:center;
  justify-content: center;
`;

const HeaderTitleText = styled.Text`
  color:#FFFFFF;
  font-family:PlusJakartaSans_500Medium;
  font-size:18px;
`;

const Left = styled.View`flex:1;`;
const Center = styled.View`flex:2; align-items:center;`;
const Right = styled.View`flex-direction:row; flex:1; justify-content:center;`;

const ChattingScreen = styled.View`flex:1; flex-direction: column;`;

const ChattingLeftContainer = styled.View`
  align-self: flex-start;
  max-width:280px;
  flex-direction: row;
  margin:10px 0px;
`;

const ProfileContainer = styled.View`width:38px;`;
const ProfileBox = styled.View`width:38px; height:38px;`;
const ProfileImage = styled.Image`width:100%; height:100%; resize-mode:contain;`;

const OtherContainer = styled.View`max-width:242px; padding-left:7px;`;
const OtherNameText = styled.Text`
color:#FFFFFF; font-family:PlusJakartaSans_600SemiBold; font-size:13px;
`;

const OtherNotFirstTextBox = styled.View`
  background-color:#414142;
  max-width:210px;
  padding:8px 12px;
  border-radius:16px;
  align-items:center;
  justify-content:center;
  align-self:flex-start;
`;
const OtherText = styled.Text`
  color:#FFFFFF;
  font-size:14px;
  font-family:PlusJakartaSans_300Light;
`;

const ChattingRightContainer = styled.View`
  align-self: flex-end;
  max-width:280px;
  flex-direction: row;
  margin:2px 0px;
  margin-right:8px;
  align-items:flex-end;
`;

const MyChatTimeText = styled.Text`
  color:#848687;
  font-size:10px;
  font-family:PlusJakartaSans_300Light;
  margin-right:4px;
`;

const MyTextFirstBox = styled.View`
  background-color:#02F59B;
  padding: 8px 12px;
  max-width:210px;
  border-radius:16px;
  align-self:flex-end;
  align-items:center;
  justify-content:center;
`;

const MyText = styled.Text`
  color:#1D1E1F;
  font-size:14px;
  font-family:PlusJakartaSans_400Regular;
`;

const BottomContainer = styled.View`
  flex-direction: row;
  height:90px;
  align-items: center;
  padding: 0 10px;
  background-color:#1D1E1F;
  border-top-width:1px;
  border-top-color:#353637;
`;

const BottomInputBox = styled.TextInput`
  background-color:#353637;
  border-radius:8px;
  flex:1;
  height:45px;
  padding-left:10px;
`;

const SendImageBox = styled.TouchableOpacity`
  width:23px;
  height:23px;
  margin-left:10px;
`;

const SendImage = styled.Image`
  width:100%;
  height:100%;
  resize-mode:contain;
`;

const TranslateButtonBox = styled.TouchableOpacity`
  position:absolute;
  bottom:100px;
  right:10px;
  width:50px;
  height:50px;
  border-radius:30px;
  z-index:999;
  align-items:center;
  justify-content:center;
`;

const TranslateImage = styled.Image`
  width:75px;
  height:75px;
  resize-mode:contain;
`;
