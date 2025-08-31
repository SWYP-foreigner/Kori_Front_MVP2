import React,{useState,useEffect} from "react";
import styled from "styled-components/native";
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import MembersBox from "@/components/MembersBox";
import { useLocalSearchParams } from "expo-router";
import { FlatList } from 'react-native';
import api from "@/api/axiosInstance";

type ChatMembers={
    userId:number,
    firstName:string,
    lastName:string,
    userImageUrl:string,
    isHost:boolean
};
const ChatInsideMember=()=>{
    const router = useRouter();
        // BottomSheet 상태
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
    const [members, setMembers] = useState<ChatMembers[]>([]);
    const toggleModal = (memberName?: string) => {
        if (memberName) setSelectedMember(memberName);
        setModalVisible(!isModalVisible);
    };
    
     useEffect(() => {
        const getMembers = async () => {
        try {
            // 멤버 데이터 받기
            const res =await api.get(`https://dev.ko-ri.cloud/api/v1/chat/rooms/${roomId}/participants`);
            console.log("멤버들",res.data);
            const data:ChatMembers[]=res.data.data;
            setMembers(data);
        } catch (err) {
            console.log("멤버 가져오기 실패", err);
        }
        };
        getMembers();
        }, [roomId]);
    
    const onLeaveChat = async () => {
        try {
            const res = await api.delete(`https://dev.ko-ri.cloud/api/v1/chat/rooms/${roomId}/leave`);
            console.log("퇴장 성공", res.data);
            // 퇴장 후 화면 이동 등 처리
            router.replace("/(tabs)/chat");
        } catch (err) {
            console.log("퇴장 실패", err);
        }
    };
    return(
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
                            <Right>
                                {/* Something */}
                            </Right>
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
                            name={item.firstName}
                            isHost={item.isHost}
                            imageUrl={item.userImageUrl}
                            onPressMore={() => {
                                setSelectedMember(item.firstName);
                                setModalVisible(true);
                            }}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        />
                        
                    </MembersScreen>
                    <LeaveChatButton onPress={onLeaveChat}>
                        <LeaveChatButtonText >Leave Chat</LeaveChatButtonText>
                    </LeaveChatButton>
                    <BottomSpacer/>
                
                    </Container>
                </SafeArea>
        
    );
};


export default ChatInsideMember;



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

const MembersTextContainer=styled.View`
    height:70px;
    justify-content:center;

`;
const MembersText=styled.Text`
    color: #848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
`;
const MembersScreen=styled.View`
    flex:1;
`;

const LeaveChatButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #FF4F4F;
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

