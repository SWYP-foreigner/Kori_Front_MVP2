import React from "react";
import styled from "styled-components/native";
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import MembersBox from "@/components/MembersBox";


const GroupChatInsideMember=()=>{
    const router = useRouter();

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
                            <HeaderTitleText>Hiking Club</HeaderTitleText>
                            <HeaderMemberCount>4</HeaderMemberCount>
                        </Center>
                        <Right>
                            <TouchableOpacity onPress={() => console.log("공유기능")}>
                                <Octicons name="share-android" size={22} color="#CCCFD0" />
                            </TouchableOpacity>
                             <TouchableOpacity onPress={() => console.log("신고기능")}>
                                <ShingoImage source={require("@/assets/images/Shingo.png")}/>
                            </TouchableOpacity>
                        </Right>
                </HeaderContainer>
                <MembersTextContainer>
                    <MembersText>Members(4)</MembersText>
                </MembersTextContainer>
                 {/* FlatList로 변경예정 */}
                <ScrollView>
                <MembersScreen>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                    <MembersBox/>
                </MembersScreen>
                </ScrollView>
                <LeaveChatButton>
                    <LeaveChatButtonText>Leave Space</LeaveChatButtonText>
                </LeaveChatButton>
                <BottomSpacer/>
                </Container>
                </SafeArea>
        
    );
};


export default GroupChatInsideMember;



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

const HeaderMemberCount=styled.Text`
    color:#02F59B;
    font-size:19px;
    font-family:PlusJakartaSans_500Medium;
    margin-left:5px;
`;

const ShingoImage=styled.Image`
    width:26px;
    height:26px;
    margin-left:20px;
    margin-bottom:3px;
`;


const Left=styled.View`
    flex:1;
`;
const Center=styled.View`
    flex:2;
    justify-content:center;
    align-items:center;
    flex-direction:row;
`;
const Right=styled.View`
    flex-direction:row;
    flex:1;
    justify-content:center;
    align-items:center;
    margin-left:5px;

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

