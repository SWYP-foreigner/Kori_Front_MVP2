import api from '@/api/axiosInstance';
import ProfileModal from '@/components/ProfileModal';
import { Config } from '@/src/lib/config';
import { formatDate, formatTime } from '@/src/utils/dateUtils';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Client } from '@stomp/stompjs';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, InteractionManager, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

type ChatHistory = {
  id: number;
  roomId: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  senderImageUrl: string;
  content: string;
  sentAt: string;
};

type TranslatedChatMessage = {
  id: number;
  roomId: number;
  senderId: number;
  originContent: string;
  targetContent: string;
  sentAt: string;
  senderFirstName: string;
  senderLastName: string;
  senderImageUrl: string;
};

const { height } = Dimensions.get('window');

const ChattingRoomScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { roomName } = useLocalSearchParams<{ roomName: string }>();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [myUserId, setMyUserId] = useState('');
  const [isTranslate, setIsTranslate] = useState(false);
  const [stompConnected, setStompConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchBox, setSearchBox] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessages, setSearchMessages] = useState<any[]>([]);
  const pointerRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // ---------------------- 토큰 refresh 함수 ----------------------
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

  const fetchUserProfile = async (userId: number) => {
    try {
      setIsLoadingProfile(true);
      const res = await api.get(`/api/v1/member/${userId}/info`);
      setSelectedUser(res.data);
      setIsProfileVisible(true);
    } catch (err) {
      console.error('프로필 불러오기 실패', err);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // ---------------------- STOMP 연결 함수 ----------------------
  const connectStomp = async () => {
    let token = await SecureStore.getItemAsync('jwt');
    const myId = await SecureStore.getItemAsync('MyuserId');

    if (!myId) return console.warn('[AUTH] 유저ID 없음');

    // token 없으면 refresh
    if (!token) {
      token = await refreshTokenIfNeeded();
      if (!token) return console.error('[AUTH] 유효한 토큰 없음, 연결 실패');
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
      setStompConnected(true);
      subscribeToMessages(myId);
      subscribeDeleteMessages();
    };

    // STOMP 오류 처리
    stompClient.current.onStompError = async (frame) => {
      console.error('❌ STOMP 오류', frame.headers['message']);
      const newToken = await refreshTokenIfNeeded();
      if (!newToken) return console.error('[AUTH] 토큰 재발급 실패');
      stompClient.current?.deactivate();
      connectStomp();
    };

    stompClient.current.onWebSocketError = (evt) => console.error('WebSocket 오류', evt);
    stompClient.current.onWebSocketClose = (evt) => console.log('WebSocket 종료', evt);
    stompClient.current.activate();
  };

  const subscribeToMessages = (myId: string) => {
    stompClient.current?.subscribe(`/topic/user/${myId}/${roomId}/messages`, (message) => {
      const body = JSON.parse(message.body);
      // 일반 메시지라면 추가
      setMessages((prev) => [body, ...prev]);
    });
  };

  // 실시간 메세지 삭제를 위한 구독
  const subscribeDeleteMessages = () => {
    stompClient.current?.subscribe(`/topic/rooms/${roomId}`, (message) => {
      const body = JSON.parse(message.body);

      if (body.type === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id.toString() !== body.id.toString()));
      }
    });
  };

  useEffect(() => {
    fetchHistory();
    connectStomp();

    return () => {
      if (stompClient.current?.connected) {
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
      console.error('채팅 기록 불러오기 실패', err);
    }
  };

  // ---------------------- 메시지 전송 ----------------------
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    if (!stompConnected) return console.warn('STOMP 미연결');

    const msg = { roomId, senderId: myUserId, content: inputText };

    try {
      stompClient.current?.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(msg),
      });
      setInputText('');
    } catch (err: any) {
      console.error('메시지 전송 실패', err);
      if (err.message?.includes('401')) {
        const newToken = await refreshTokenIfNeeded();
        if (!newToken) return console.error('[AUTH] 토큰 재발급 실패');
        connectStomp();
        stompClient.current?.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(msg),
        });
        setInputText('');
      }
    }
  };
  // ---------------------- 메세지 삭제 ----------------------
  const deleteMessage = async (messageId: string) => {
    if (!stompConnected) return console.warn('STOMP 미연결');

    const msg = { messageId: messageId, senderId: myUserId };
    try {
      stompClient.current?.publish({
        destination: '/app/chat.deleteMessage',
        body: JSON.stringify(msg),
      });
    } catch (err: any) {
      if (err.message?.includes('401')) {
        const newToken = await refreshTokenIfNeeded();
        if (!newToken) return console.error('[AUTH] 토큰 재발급 실패');
        connectStomp();
        stompClient.current?.publish({
          destination: '/app/chat.deleteMessage',
          body: JSON.stringify(msg),
        });
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
      console.error('번역된 채팅 기록 불러오기 실패', err);
    }
  };

  // 무한 스크롤
  const fetchMoreHistory = async () => {
    if (!hasMore) return;

    setIsFetchingMore(true);

    try {
      const lastMessageId = messages[messages.length - 1]?.id;
      const res = await api.get(`/api/v1/chat/rooms/${roomId}/messages?lastMessageId=${lastMessageId ? lastMessageId : ''}`);

      const olderMessages: ChatHistory[] = res.data.data;

      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...prev, ...olderMessages]);
      }
    } catch (err) {
      console.error('이전 메시지 불러오기 실패', err);
    } finally {
      setIsFetchingMore(false);
    }
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      callApiOnExit();
    });

    return unsubscribe;
  }, [navigation]);

  const callApiOnExit = async () => {
    try {
      await api.post(`${Config.SERVER_URL}/api/v1/chat/rooms/${roomId}/read-all`);
    } catch (error) {
      console.error('뒤로가기 실패', error);
    }
  };

  const goBack = async () => {
    await api.post(`${Config.SERVER_URL}/api/v1/chat/rooms/${roomId}/read-all`);
    router.back();
  };
  // 햄버거 버튼 눌렀을때 이동
  const onhandleNext = () => {
    router.push({
      pathname: './ChatInsideMember',
      params: { roomId, roomName },
    });
  };

  // SearchBox 보여주는 함수
  const showSearchBox = () => {
    setSearchBox(true);
    setSearchText('');
    pointerRef.current = 0;
  };

  // SearchBox 닫는 함수
  const closeSearchBox = async () => {
    setSearchBox(false);
    setIsSearching(false);
    setHasMore(true);
    pointerRef.current = 0;

    // 원래 메시지 복원
    await fetchHistory(); // 기존 메시지 다시 불러오기
  };

  const scrollToHighlightMessage = (messageId: number) => {
    if (!flatListRef.current) return;

    const index = messages.findIndex((msg) => msg.id === messageId);
    if (index === -1) return;

    if (index === 0 && index === messages.length - 1) {
      // 첫 메시지면 viewPosition 없이 스크롤
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    } else {
      // 나머지는 중앙 정렬
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // 검색어 색칠 하는 함수
  const HighlightMyText = ({ text, keyword }: { text: string; keyword: string }) => {
    if (!keyword) return <MyText>{text}</MyText>;

    // 정규식으로 split (검색어 부분도 배열에 포함됨)
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));

    return (
      <MyText>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? ( // 검색어랑 같으면 하이라이트
            <MyText key={index} style={{ backgroundColor: 'rgba(255,255,0,0.8)' }}>
              {part}
            </MyText>
          ) : (
            <MyText key={index}>{part}</MyText>
          ),
        )}
      </MyText>
    );
  };

  // 검색어 색칠 하는 함수
  const HighlightOtherText = ({ text, keyword }: { text: string; keyword: string }) => {
    if (!keyword) return <OtherText>{text}</OtherText>;

    // 정규식으로 split (검색어 부분도 배열에 포함됨)
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));

    return (
      <OtherText>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? ( // 검색어랑 같으면 하이라이트
            <OtherText key={index} style={{ backgroundColor: 'rgba(255,255,0,0.3)' }}>
              {part}
            </OtherText>
          ) : (
            <OtherText key={index}>{part}</OtherText>
          ),
        )}
      </OtherText>
    );
  };

  // 채팅방 삭제할때 확인차 알림
  const confirmDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Message Delete', // 제목
      'Do you really want to delete this message?', // 내용
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(messageId) },
      ],
    );
  };
  // 채팅방 검색시 위 화살표
  const UpFindText = async () => {
    if (pointerRef.current + 1 === searchMessages.length) return;
    pointerRef.current += 1;
    const messageId = searchMessages[pointerRef.current]?.id;

    try {
      const res = await api.get(
        `${Config.SERVER_URL}/api/v1/chat/rooms/${roomId}/messages/around?messageId=${messageId}`,
      );

      const resultMessages: ChatHistory[] = res.data.data;
      setMessages([...resultMessages].reverse());
      InteractionManager.runAfterInteractions(() => {
        scrollToHighlightMessage(messageId);
      });
    } catch (err) {
      console.error('위로 이동 후 메시지 불러오기 실패', err);
    }
  };

  // 채팅방 검색시 아래 화살표
  const DownFindText = async () => {
    if (pointerRef.current - 1 < 0) return;
    pointerRef.current -= 1;
    const messageId = searchMessages[pointerRef.current]?.id;
    try {
      const res = await api.get(
        `${Config.SERVER_URL}/api/v1/chat/rooms/${roomId}/messages/around?messageId=${messageId}`,
      );
      const resultMessages: ChatHistory[] = res.data.data;
      setMessages([...resultMessages].reverse());
      // 중앙으로 스크롤
      // FlatList 렌더링 후 스크롤
      InteractionManager.runAfterInteractions(() => {
        scrollToHighlightMessage(messageId);
      });
    } catch (err) {
      console.error('아래로 이동 후 메시지 불러오기 실패', err);
    }
  };
  //검색시 호출되는 함수
  const search = async () => {
    try {
      pointerRef.current = 0;
      setIsSearching(true);
      const res = await api.get(`/api/v1/chat/search?roomId=${roomId}&keyword=${searchText}`);
      const SearchResult: ChatHistory[] = res.data.data;
      setSearchMessages(SearchResult);

      const messageId = SearchResult[pointerRef.current]?.id;

      try {
        const res = await api.get(
          `${Config.SERVER_URL}/api/v1/chat/rooms/${roomId}/messages/around?messageId=${messageId}`,
        );
        const resultMessages: ChatHistory[] = res.data.data;
        setMessages([...resultMessages].reverse());
        // 중앙으로 스크롤
        // FlatList 렌더링 후 스크롤
        InteractionManager.runAfterInteractions(() => {
          scrollToHighlightMessage(messageId);
        });
      } catch (err) {
        console.error('검색 버튼 누른 후 메시지 불러오기 실패', err);
      }
    } catch (err) {
      console.error('검색 결과 불러오기 실패', err);
    }
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        {/* 헤더 */}
        <HeaderContainer>
          {searchBox ? (
            <>
              <TouchableOpacity onPress={closeSearchBox}>
                <Feather name="arrow-left" size={27} color="#CCCFD0" />
              </TouchableOpacity>
              <SearchContainer>
                <Feather name="search" size={23} color="#CCCFD0" style={{ marginLeft: 8 }} />
                <SearchInputText
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search Chat"
                  placeholderTextColor="#616262"
                  onSubmitEditing={search}
                />
                {searchText && (
                  <TouchableOpacity
                    onPress={() => {
                      (setSearchText(''), setIsSearching(false));
                    }}
                  >
                    <AntDesign name="closecircle" size={23} color="#CCCFD0" style={{ marginRight: 8 }} />
                  </TouchableOpacity>
                )}
              </SearchContainer>
            </>
          ) : (
            <>
              <Left>
                <TouchableOpacity onPress={goBack}>
                  <Feather name="arrow-left" size={27} color="#CCCFD0" />
                </TouchableOpacity>
              </Left>
              <Center>
                <HeaderTitleText>{roomName}</HeaderTitleText>
              </Center>
              <Right>
                <TouchableOpacity onPress={showSearchBox}>
                  <Feather name="search" size={23} color="#CCCFD0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onhandleNext}>
                  <SimpleLineIcons name="menu" size={23} color="#CCCFD0" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
              </Right>
            </>
          )}
        </HeaderContainer>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 30}
        >
          {/* 채팅 화면 */}
          <ChattingScreen>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              inverted
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'flex-end',
                paddingTop: 10,
                paddingBottom: 10,
              }}
              onEndReached={fetchMoreHistory} // 스크롤 상단에서 이전 메시지 로딩
              onEndReachedThreshold={0.2}
              renderItem={({ item, index }) => {
                const isMyMessage = item.senderId.toString() === myUserId;
                // 프로필 표시 로직
                const showProfile =
                  index === messages.length - 1 ||
                  (messages[index + 1] && messages[index + 1].senderFirstName !== item.senderFirstName);
                const isSameUser = index > 0 && messages[index - 1].senderFirstName === messages[index].senderFirstName;
                const showTime =
                  index === 0 ||
                  (index > 0 &&
                    formatTime(messages[index - 1].sentAt) !== formatTime(messages[index].sentAt) &&
                    isSameUser) ||
                  !isSameUser;
                const showDate =
                  index === messages.length - 1 ||
                  (messages[index + 1] && formatDate(messages[index + 1].sentAt) !== formatDate(item.sentAt));

                if (isMyMessage) {
                  return showProfile ? (
                    <>
                      <ChattingRightContainer
                        showProfile={showProfile}
                        onLongPress={() => confirmDeleteMessage(item.id)}
                      >
                        {showTime && <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>}
                        <MyTextFirstBox>
                          {isSearching ? (
                            searchMessages[pointerRef.current] && searchMessages[pointerRef.current].id === item.id ? (
                              <HighlightMyText
                                text={isTranslate ? item.targetContent : item.content || item.originContent}
                                keyword={searchText}
                              />
                            ) : (
                              <MyText>{isTranslate ? item.targetContent : item.content || item.originContent}</MyText>
                            )
                          ) : (
                            <MyText>{isTranslate ? item.targetContent : item.content || item.originContent}</MyText>
                          )}
                        </MyTextFirstBox>
                      </ChattingRightContainer>
                      {showDate && (
                        <DateTimeView>
                          <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                        </DateTimeView>
                      )}
                    </>
                  ) : (
                    <>
                      <ChattingRightContainer onLongPress={() => confirmDeleteMessage(item.id)}>
                        {showTime && <MyChatTimeText>{formatTime(item.sentAt)}</MyChatTimeText>}
                        <MyTextNotFirstBox>
                          {isSearching ? (
                            searchMessages[pointerRef.current] && searchMessages[pointerRef.current].id === item.id ? (
                              <HighlightMyText
                                text={isTranslate ? item.targetContent : item.content || item.originContent}
                                keyword={searchText}
                              />
                            ) : (
                              <MyText>{isTranslate ? item.targetContent : item.content || item.originContent}</MyText>
                            )
                          ) : (
                            <MyText>{isTranslate ? item.targetContent : item.content || item.originContent}</MyText>
                          )}
                        </MyTextNotFirstBox>
                      </ChattingRightContainer>
                      {showDate && (
                        <DateTimeView>
                          <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                        </DateTimeView>
                      )}
                    </>
                  );
                } else {
                  return showProfile ? (
                    <>
                      <ChattingLeftContainer showProfile={showProfile}>
                        <ProfileContainer>
                          <ProfileBox>
                            <TouchableOpacity
                              onPress={() => fetchUserProfile(item.senderId)}
                              disabled={isLoadingProfile}
                            >
                              <ProfileImage source={{ uri: item.senderImageUrl }} />
                            </TouchableOpacity>
                          </ProfileBox>
                        </ProfileContainer>
                        <OtherContainer>
                          <OtherNameText>{item.senderLastName}</OtherNameText>
                          <LeftMessageBox>
                            <OtherFirstTextBox>
                              {isSearching ? (
                                searchMessages[pointerRef.current] &&
                                  searchMessages[pointerRef.current].id === item.id ? (
                                  <HighlightOtherText
                                    text={isTranslate ? item.targetContent : item.content || item.originContent}
                                    keyword={searchText}
                                  />
                                ) : (
                                  <OtherText>
                                    {isTranslate ? item.targetContent : item.content || item.originContent}
                                  </OtherText>
                                )
                              ) : (
                                <OtherText>
                                  {isTranslate ? item.targetContent : item.content || item.originContent}
                                </OtherText>
                              )}
                            </OtherFirstTextBox>
                            {showTime && <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>}
                          </LeftMessageBox>
                        </OtherContainer>
                      </ChattingLeftContainer>
                      {showDate && (
                        <DateTimeView>
                          <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                        </DateTimeView>
                      )}
                    </>
                  ) : (
                    <>
                      <ChattingLeftContainer>
                        <ProfileContainer></ProfileContainer>
                        <OtherContainer>
                          <LeftMessageBox>
                            <OtherNotFirstTextBox>
                              {isSearching ? (
                                searchMessages[pointerRef.current] &&
                                  searchMessages[pointerRef.current].id === item.id ? (
                                  <HighlightOtherText
                                    text={isTranslate ? item.targetContent : item.content || item.originContent}
                                    keyword={searchText}
                                  />
                                ) : (
                                  <OtherText>
                                    {isTranslate ? item.targetContent : item.content || item.originContent}
                                  </OtherText>
                                )
                              ) : (
                                <OtherText>
                                  {isTranslate ? item.targetContent : item.content || item.originContent}
                                </OtherText>
                              )}
                            </OtherNotFirstTextBox>
                            {showTime && <ChatTimeText>{formatTime(item.sentAt)}</ChatTimeText>}
                          </LeftMessageBox>
                        </OtherContainer>
                      </ChattingLeftContainer>
                      {showDate && (
                        <DateTimeView>
                          <DateTimeText>{formatDate(item.sentAt)}</DateTimeText>
                        </DateTimeView>
                      )}
                    </>
                  );
                }
              }}
            />
            {searchBox ? (
              <FindSearchTextContainer>
                <TouchableOpacity disabled={!isSearching} onPress={UpFindText}>
                  <Image
                    source={require('@/assets/images/UpArrow.png')}
                    style={{ width: 17, height: 17, marginLeft: 10 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity disabled={!isSearching} onPress={DownFindText}>
                  <Image
                    source={require('@/assets/images/DownArrow.png')}
                    style={{ width: 17, height: 17, marginLeft: 18 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                {isSearching && searchText && (
                  <FindResultText>
                    {pointerRef.current + 1}/{searchMessages.length}
                  </FindResultText>
                )}
              </FindSearchTextContainer>
            ) : (
              <BottomContainer style={{ paddingBottom: insets.bottom }}>
                <BottomInputBox
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Enter a message"
                  placeholderTextColor="#888"
                />
                <SendImageBox onPress={sendMessage}>
                  <SendImage
                    tintColor={inputText ? '#02F59B' : '#ffffff'}
                    source={require('@/assets/images/Send.png')}
                  />
                </SendImageBox>
              </BottomContainer>
            )}
            <ProfileModal
              visible={isProfileVisible}
              userData={selectedUser}
              onClose={() => setIsProfileVisible(false)}
              onFollow={(id) => console.log('follow', id)}
              onUnfollow={(id) => console.log('unfollow', id)}
              onChat={() => console.log('chat start')}
            />

            {!isTranslate && (
              <TranslateButtonBox onPress={updateTranslateScreen}>
                <TranslateImage source={require('@/assets/images/translate.png')} />
              </TranslateButtonBox>
            )}
            {isTranslate && (
              <TranslatingButtonBox onPress={fetchHistory}>
                <TranslatingImage source={require('@/assets/images/translating.png')} />
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
const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;
const HeaderContainer = styled.View`
  flex-direction: row;
  height: 70px;
  align-items: center;
  justify-content: center;
`;
const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 18px;
`;
const Left = styled.View`
  width: 60px;
  align-items: flex-start;
`;
const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
const Right = styled.View`
  width: 60px;
  flex-direction: row;
  justify-content: flex-end;
`;
const ChattingScreen = styled.View`
  flex: 1;
  flex-direction: column;
  padding-bottom: 10px;
`;
const ChattingLeftContainer = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  margin-top: ${({ showProfile }) => (showProfile ? '30px' : '1px')};
  align-self: flex-start;
  max-width: 280px;
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
const ProfileBox = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 100px;
  overflow: hidden;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;
const OtherContainer = styled.View`
  max-width: 242px;
  padding-left: 7px;
`;
const OtherNameText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
`;
const OtherFirstTextBox = styled.View`
  background-color: #414142;
  padding: 8px 12px;
  max-width: 210px;
  border-top-left-radius: 0px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
`;
const OtherText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-family: PlusJakartaSans_300Light;
`;
const OtherNotFirstTextBox = styled.View`
  background-color: #414142;
  max-width: 210px;
  padding: 8px 12px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
`;
const ChatTimeText = styled.Text`
  color: #848687;
  font-size: 10px;
  font-family: PlusJakartaSans_300Light;
  margin-left: 3px;
`;
const ChattingRightContainer = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  margin-top: ${({ showProfile }) => (showProfile ? '30px' : '5px')};
  align-self: flex-end;
  max-width: 280px;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  margin-right: 8px;
`;
const MyChatTimeText = styled.Text`
  color: #848687;
  font-size: 10px;
  font-family: PlusJakartaSans_300Light;
  margin-right: 4px;
`;

const MyTextFirstBox = styled.View`
  background-color: #02f59b;
  padding: 8px 12px;
  max-width: 210px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 0px;
  align-self: flex-end;
  align-items: center;
  justify-content: center;
`;

const MyTextNotFirstBox = styled.View`
  background-color: #02f59b;
  padding: 8px 12px;
  max-width: 210px;
  border-radius: 16px;
  align-self: flex-end;
  align-items: center;
  justify-content: center;
`;
const MyText = styled.Text`
  color: #1d1e1f;
  font-size: 14px;
  font-family: PlusJakartaSans_400Regular;
`;
const TranslateButtonBox = styled.TouchableOpacity`
  position: absolute;
  bottom: ${height * 0.12}px;
  right: 10px;
  width: 50px;
  height: 50px;
  border-radius: 30px;
  z-index: 999;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;
const TranslateImage = styled.Image`
  width: 75px;
  height: 75px;
  resize-mode: contain;
`;
const TranslatingButtonBox = styled.TouchableOpacity`
  position: absolute;
  width: 50px;
  height: 50px;
  align-self: center;
  border-radius: 30px;
  z-index: 999;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;
const TranslatingImage = styled.Image`
  width: 130px;
  height: 130px;
  resize-mode: contain;
`;
const BottomContainer = styled.View`
  background-color: #1d1e1f;
  height: 50px;
  border-top-width: 1px;
  border-top-color: #353637;
  flex-direction: row;
`;
const BottomInputBox = styled.TextInput`
  background-color: #353637;
  color: #ffffff;
  border-radius: 8px;
  width: 85%;
  height: 45px;
  margin-top: 10px;
  padding-left: 10px;
`;
const SendImageBox = styled.TouchableOpacity`
  width: 23px;
  height: 23px;
  margin: 20px;
`;
const SendImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: contain;
`;

const DateTimeView = styled.View`
  margin: 20px 0px 10px 0px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const DateTimeText = styled.Text`
  color: #848687;
  font-size: 12px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const SearchContainer = styled.View`
  width: 85%;
  height: 45px;
  background-color: #353637;
  flex-direction: row;
  margin-left: 10px;
  align-items: center;
  justify-content: center;
  padding: 0px 3px;
  border-radius: 8px;
`;
const SearchInputText = styled.TextInput`
  background-color: #353637;
  height: 45px;
  flex: 1;
  padding-left: 10px;
  color: #ffffff;
  font-size: 14px;
  font-family: PlusJakartaSans_400Regular;
`;

const FindSearchTextContainer = styled.View`
  background-color: #1d1e1f;
  height: 45px;
  border-top-width: 1px;
  border-top-color: #353637;
  flex-direction: row;
  align-items: center;
`;

const FindResultText = styled.Text`
  position: absolute;
  left: 50%;
  color: #ffffff;
  font-size: 14px;
  font-family: PlusJakartaSans_300Light;
`;
