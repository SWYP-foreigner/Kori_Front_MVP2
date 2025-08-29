import React from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform ,ScrollView,TouchableOpacity} from 'react-native';
import { useLocalSearchParams } from "expo-router";

const ChattingRoomScreen=()=>{
    const router = useRouter();
    const { userId, name } = useLocalSearchParams<{ userId: string; name: string }>();
    const { roomId }= useLocalSearchParams<{ roomId : string }>();
    console.log("userId",userId);
    console.log("name",name);
    console.log("roomId",roomId);
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
                            <HeaderTitleText>{name}</HeaderTitleText>
                        </Center>
                        <Right>
                            <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="search" size={26} color="#CCCFD0" />
                            </TouchableOpacity>
                             <TouchableOpacity onPress={() => router.back()}>
                            <SimpleLineIcons name="menu" size={26} color="#CCCFD0"  style={{ marginLeft: 10 }}  />
                            </TouchableOpacity>
                        </Right>
                </HeaderContainer>
                <ScrollView
                        contentContainerStyle={{ paddingBottom: 100 }} // 아래 여백 확보
                        showsVerticalScrollIndicator={false}
                    >
                <ChattingScreen>
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
                        placeholder="Write Your Text"
                        placeholderTextColor="#616262"
                    />
                    <SendImageBox>
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



