import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import MembersBox from '@/components/MembersBox';
import { useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native';
import api from '@/api/axiosInstance';
import AntDesign from '@expo/vector-icons/AntDesign';
import Toast from 'react-native-toast-message';
import { Config } from '@/src/lib/config';

type ChatMembers = {
  userId: number;
  firstName: string;
  lastName: string;
  userImageUrl: string;
  isHost: boolean;
};
const ChatInsideMember = () => {
  const router = useRouter();
  // BottomSheet 상태
  const [isModalVisible, setModalVisible] = useState(false);
  const [isReportMenuVisible, setReportMenuVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
  const [members, setMembers] = useState<ChatMembers[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [text, setText] = useState(``);

  useEffect(() => {
    const getMembers = async () => {
      try {
        // 멤버 데이터 받기
        const res = await api.get(`/api/v1/chat/rooms/${roomId}/participants`);
        const data: ChatMembers[] = res.data.data;
        setMembers(data);
      } catch (err) {
        console.error('멤버 가져오기 실패', err);
      }
    };
    getMembers();
  }, [roomId]);

  // 채팅방 나가기
  const onLeaveChat = async () => {
    try {
      const res = await api.delete(`/api/v1/chat/rooms/${roomId}/leave`);
      // 퇴장 후 화면 이동 등 처리
      router.replace('/(tabs)/chat');
    } catch (err) {
      console.error('퇴장 실패', err);
    }
  };

  // 신고/차단 창 닫기
  const closeModal = () => {
    setModalVisible(false);
  };

  // 신고메뉴 창 닫기
  const closeReportMenuModal = () => {
    setReportMenuVisible(false);
    setModalVisible(false);
  };

  // 신고 창 닫기
  const closeReportModal = () => {
    setIsReportVisible(false);
  };

  // 신고 창 열기
  const openReportModal = () => {
    setModalVisible(false);
    setReportMenuVisible(false);
    setIsReportVisible(true);
  };

  // 신고 메뉴 창 열기
  const openReportMenu = () => {
    setModalVisible(false);
    setReportMenuVisible(true);
  };

  // 차단 알람 띄우기
  // 그룹 채팅이면 그 채팅 유저의 채팅만 안보이게 하기
  // 1:1 채팅이면 채팅유저 차단 후 채팅방까지 자동적으로 나가기

  const completeReport = async () => {
    try {
      await api.post(`${Config.SERVER_URL}/api/v1/chat/declaration`, {
        ignored: text,
      });
      Toast.show({
        type: 'success',
        text1: 'Your report has been received',
        text2: 'It takes up to 24 hours to review',
      });
      setIsReportVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Report Fail',
      });
      setIsReportVisible(false);
    }

    // submit 버튼 누르면 api 호출후
    // 되면 토스트 메세지
    // 안되면 토스트 메세지
  };
  const openBlockMenu = () => {
    setModalVisible(false);
    Alert.alert(
      'Block User',
      'If you block this user in a 1-on-1 chat, you will leave the chat room.\n\nIn a group chat, you will no longer see messages from the blocked user.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'Block User', onPress: blockUser },
      ],
    );
  };

  //채팅방 유저
  const blockUser = async () => {
    const res = await api.get(`${Config.SERVER_URL}/api/v1/chat/isGroup?roomId=${roomId}`);
    const { isGroup } = res.data.data;
    try {
      await api.post(`${Config.SERVER_URL}/api/v1/chat/block/${reportId}`);
      if (isGroup) {
      } else {
        onLeaveChat();
      }
      Toast.show({
        type: 'success',
        text1: 'Blocking this user success',
      });
    } catch (error) {
      console.log('block error', error);
      Toast.show({
        type: 'error',
        text1: 'Blocking this user fail',
      });
    } finally {
      setReportId('');
    }
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
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
          <Right>{/* Something */}</Right>
        </HeaderContainer>
        <MembersTextContainer>
          <MembersText>Members({members.length})</MembersText>
        </MembersTextContainer>

        <MembersScreen>
          <FlatList
            data={members}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <MembersBox
                name={item.firstName + '  ' + item.lastName}
                isHost={item.isHost}
                imageUrl={item.userImageUrl}
                onPressMore={() => {
                  setSelectedMember(item.firstName);
                  setModalVisible(true);
                  setReportId(item.userId.toString());
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </MembersScreen>
        <LeaveChatButton onPress={onLeaveChat}>
          <LeaveChatButtonText>Leave Chat</LeaveChatButtonText>
        </LeaveChatButton>
        <BottomSpacer />

        {/* 첫번째 */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <ModalOverlay activeOpacity={1}>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetHandle />
              </BottomSheetHeader>
              <ReasonBox onPress={openReportMenu}>
                <MenuText>Report this user</MenuText>
              </ReasonBox>
              <ReasonBox onPress={openBlockMenu}>
                <MenuText>Block this user</MenuText>
              </ReasonBox>
              <CancelBox onPress={closeModal}>
                <CancelText>Cancel</CancelText>
              </CancelBox>
            </BottomSheetContent>
          </ModalOverlay>
        </Modal>

        {/* 신고메뉴 */}
        <Modal visible={isReportMenuVisible} transparent animationType="slide">
          <ModalOverlay activeOpacity={1}>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetHandle />
              </BottomSheetHeader>
              <BottomSheetTitle>Reason for report</BottomSheetTitle>
              <BottomSheetSubTitle>
                If the report does not meet the reason for the report{'\n'}the report will not be processed
              </BottomSheetSubTitle>
              <ReasonBox onPress={openReportModal}>
                <ReasonText>Spam</ReasonText>
              </ReasonBox>
              <ReasonBox onPress={openReportModal}>
                <ReasonText>Sexual Activity</ReasonText>
              </ReasonBox>
              <ReasonBox onPress={openReportModal}>
                <ReasonText>Violence</ReasonText>
              </ReasonBox>
              <ReasonBox onPress={openReportModal}>
                <ReasonText>Fraud</ReasonText>
              </ReasonBox>
              <ReasonBox onPress={openReportModal}>
                <ReasonText>Etc</ReasonText>
              </ReasonBox>
              <CancelBox onPress={closeReportMenuModal}>
                <CancelText>Cancel</CancelText>
              </CancelBox>
            </BottomSheetContent>
          </ModalOverlay>
        </Modal>

        <Modal visible={isReportVisible} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ReportOveraly>
              <ReportSheetContent>
                <ReportHeader>
                  <Image source={require('@/assets/images/alert.png')} style={{ width: 25, height: 25 }} />
                  <ReportHeaderText>Report this user</ReportHeaderText>
                  <TouchableOpacity onPress={closeReportModal}>
                    <AntDesign name="close" size={24} color="#CCCFD0" />
                  </TouchableOpacity>
                </ReportHeader>
                <ReportBox
                  value={text}
                  onChangeText={setText}
                  placeholder="Enter report details"
                  placeholderTextColor={'#848687'}
                  returnKeyType="done"
                  multiline
                  submitBehavior="blurAndSubmit"
                />

                <ReportSubmitButton onPress={completeReport}>
                  <ReposrtSubmitButtonText>Submit</ReposrtSubmitButtonText>
                </ReportSubmitButton>
              </ReportSheetContent>
            </ReportOveraly>
          </KeyboardAvoidingView>
        </Modal>
      </Container>
    </SafeArea>
  );
};

export default ChatInsideMember;

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
  height: 10%;
  align-items: center;
  justify-content: center;
`;

const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 18px;
`;

const Left = styled.View`
  flex: 1;
`;
const Center = styled.View`
  flex: 2;
  align-items: center;
`;
const Right = styled.View`
  flex-direction: row;
  flex: 1;
  justify-content: center;
`;

const MembersTextContainer = styled.View`
  height: 50px;
  justify-content: center;
`;
const MembersText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
`;
const MembersScreen = styled.View`
  flex: 1;
`;

const LeaveChatButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #ff4f4f;
  margin-bottom: 8px;
`;

const LeaveChatButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;

const BottomSpacer = styled.View`
  height: 25px;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheetContent = styled.View`
  background-color: #353637;
  border-radius: 8px;
  padding-bottom: 40px;
`;

const BottomSheetHeader = styled.View`
  align-items: center;
  padding: 15px 20px 10px 20px;
`;

const BottomSheetHandle = styled.View`
  width: 45px;
  height: 6px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const BottomSheetTitle = styled.Text`
  align-self: center;
  color: #ffffff;
  font-size: 17px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const BottomSheetSubTitle = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  margin-top: 20px;
  margin-left: 15px;
  margin-bottom: 30px;
`;

const ReasonBox = styled.TouchableOpacity`
  height: 60px;
  border-top-color: #949899;
  border-bottom-color: #949899;
  border-width: 1px;
  justify-content: center;
  align-items: center;
`;
const MenuText = styled.Text`
  color: #ff4f4f;
  font-size: 17px;
  font-family: PlusJakartaSans_500Medium;
`;
const ReasonText = styled.Text`
  color: #ffffff;
  font-size: 17px;
  font-family: PlusJakartaSans_500Medium;
`;

const ReportOveraly = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;
const ReportSheetContent = styled.View`
  background-color: #414142;
  width: 310px;
  height: 310px;
  border-radius: 8px;
  padding: 12px;
`;
const ReportHeader = styled.View`
  height: 30px;
  justify-content: space-between;
  flex-direction: row;
  padding: 0px 10px;
`;
const ReportHeaderText = styled.Text`
  color: #ff4f4f;
  font-family: PlusJakartaSans_500Medium;
  font-size: 15px;
`;
const ReportBox = styled.TextInput`
  color: #ffffff;
  background-color: #353637;
  height: 200px;
  padding-left: 10px;
`;
const ReportSubmitButton = styled.TouchableOpacity`
  background-color: #ff4f4f;
  border-radius: 8px;
  margin: 10px 0px;
  height: 50px;
  align-items: center;
  justify-content: center;
`;
const ReposrtSubmitButtonText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;
const CancelBox = styled(ReasonBox)``;
const CancelText = styled(ReasonText)``;
