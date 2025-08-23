import React, { useRef } from "react";
import { Animated, PanResponder, Text,Alert } from "react-native";
import styled from "styled-components/native";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SWIPE_THRESHOLD = 80; // 드래그해야 열림/닫힘이 되는 기준

const MyChatRoomBox = ({data}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const onDelete=()=>
  {
    console.log('삭제 버튼 눌림');
    // Alert
    Alert.alert('Delete Chatting?', 'After deleting it , you cannot restore it.', [
      {text: 'Delete', onPress: () => console.log('삭제 후 화면 갱신')},
       {
        text: 'cancel',
        onPress: () => console.log('삭제 취소됨'),
       
       }
    ]);
  };
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 좌우로 드래그할 때만 PanResponder 발동
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // 왼쪽으로 드래그 중일 때만 움직임 적용 (0 이상으로 못 가게 제한)
        if (gestureState.dx < 0 || (isOpen.current && gestureState.dx > 0)) {
          translateX.setValue(gestureState.dx + (isOpen.current ? -100 : 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isOpen.current) {
          // 아직 닫혀 있는 상태 → 왼쪽으로 스와이프하면 열기
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            Animated.timing(translateX, {
              toValue: -100, // 삭제 버튼 만큼 열림
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              isOpen.current = true;
            });
          } else {
            // 원래 위치로 복귀
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // 이미 열려 있는 상태 → 오른쪽으로 스와이프하면 닫기
          if (gestureState.dx > SWIPE_THRESHOLD) {
            Animated.timing(translateX, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              isOpen.current = false;
            });
          } else {
            // 다시 열려있도록 유지
            Animated.spring(translateX, {
              toValue: -100,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  return (
    <ChatRoom>
      {/* 삭제 버튼 (배경에 깔림) */}

      
        <DeleteButton activeOpacity={0.8} onPress={onDelete}>
          <FontAwesome name="trash-o" size={24} color="#ffffff" />
        </DeleteButton>
      

      {/* 채팅방 박스 (앞에서 움직이는 뷰) */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          width: "100%",
        }}
        {...panResponder.panHandlers}
      >
        <RoomBox activeOpacity={0.8}>
          <RoomImageContainer>
            <RoomImage source={require("../assets/images/character2.png")} />
          </RoomImageContainer>
          <RoomWrapper>
            <RoomTop>
              <ChatPeopleContainer>
                <ChatPerson>{data.name}</ChatPerson>
                <ChatPeople>{data.count}</ChatPeople>
              </ChatPeopleContainer>
              <ChatTime>{data.time}</ChatTime>
            </RoomTop>
            <RoomBottom>
              <ChatContent>{data.message}</ChatContent>
              <ChatCountBox>
                <ChatCount>{data.mcount}</ChatCount>
              </ChatCountBox>
            </RoomBottom>
          </RoomWrapper>
        </RoomBox>
      </Animated.View>
    </ChatRoom>
  );
};

export default MyChatRoomBox;

// 스타일 정의
const ChatRoom = styled.View`
  background-color: #1d1e1f;
  align-items: center;
  height: 80px;
  justify-content: center;
  
`;

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  width: 25%;
  height: 100%;
  background-color: #FF4F4F;
  align-items: center;
  justify-content: center;
`;


const RoomBox = styled.TouchableOpacity`
  background-color:#1d1e1f;
  padding-top:8px;
  height:80px;
  flex-direction: row;
  align-items:center;
  border-bottom-width: 1px;
  border-bottom-color: #353637;
  
`;

const RoomImageContainer = styled.View`
  width: 20%;
  height: 60px;
`;

const RoomImage = styled.Image`
  width: 100%;
  height: 85%;
  resize-mode: contain;
`;

const RoomWrapper = styled.View`
  width: 75%;
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
  margin-top:5px;
  flex-direction: row;
  align-items: center;
`;

const ChatPerson = styled.Text`
  font-size: 16px;
  margin-left: 5px;
  font-family: "PlusJakartaSans_500Medium";
  color: #ffffff;
`;

const ChatPeople = styled.Text`
  font-size: 14px;
  margin-left: 8px;
  font-family: "PlusJakartaSans_500Medium";
  color: #02f59b;
`;

const ChatTime = styled.Text`
  margin-top:5px;
  font-size: 11px;
  font-family: "PlusJakartaSans_300Light";
  color: #ffffff;
`;

const ChatContent = styled.Text`
  font-size: 13px;
  margin-left: 5px;
  color: #ffffff;
  font-family: "PlusJakartaSans_300Light";
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
  font-family: "PlusJakartaSans_600SemiBold";
  font-size:9px;
  color: #1d1e1f;
`;
