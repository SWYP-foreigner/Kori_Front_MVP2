import React,{useState} from "react";
import styled from "styled-components/native";
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import MembersBox from "@/components/MembersBox";
import { Modal } from "react-native";

const ChatInsideMember=()=>{
    const router = useRouter();
        // BottomSheet 상태
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    const toggleModal = (memberName?: string) => {
        if (memberName) setSelectedMember(memberName);
        setModalVisible(!isModalVisible);
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
                            <HeaderTitleText>Kori</HeaderTitleText>
                        </Center>
                        <Right>
                            {/* Something */}
                        </Right>
                </HeaderContainer>
                <MembersTextContainer>
                    <MembersText>Members(2)</MembersText>
                </MembersTextContainer>
                {/* FlatList로 변경예정 */}
                <ScrollView>
                <MembersScreen>
                    <MembersBox
                        name="Kori"
                        onPressMore={() => {
                            setSelectedMember("Kori");
                            setModalVisible(true);
                        }}
                    />
                    <MembersBox
                        name="Shinhyo"
                        onPressMore={() => {
                            setSelectedMember("Shinhyo");
                            setModalVisible(true);
                        }}
                    />
                    
                </MembersScreen>
                </ScrollView>
                <LeaveChatButton>
                    <LeaveChatButtonText>Leave Chat</LeaveChatButtonText>
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

