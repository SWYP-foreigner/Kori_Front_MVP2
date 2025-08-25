import React from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';


const ChattingRoomScreen=()=>{
    return(
        <SafeArea>
             <StatusBar barStyle="light-content" />
            <Container>
                <HeaderContainer>
                        <Left>
                            <Feather name="arrow-left" size={24} color="#CCCFD0" />
                        </Left>
                        <Center>
                            <HeaderTitleText>Kori</HeaderTitleText>
                        </Center>
                        <Right>
                            <Feather name="search" size={24} color="#CCCFD0" />
                            <SimpleLineIcons name="menu" size={20} color="#CCCFD0"  style={{ marginLeft: 10 }}  />
                        </Right>
                </HeaderContainer>
                <ChatScreenContainer>
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
                        <OtherFirstTextBox>
                            <OtherText>Hola~</OtherText>
                        </OtherFirstTextBox>
                        <OtherNotFirstTextBox>
                            <OtherText>Hola~ Vine a Corea desde Estados Unidos como estudiante de intercambio</OtherText>
                        </OtherNotFirstTextBox>
                    </OtherContainer>
                    <TimeTextContainer>
                        <ChatTimeText>16:30</ChatTimeText>
                    </TimeTextContainer>
                </ChattingLeftContainer>
                <ChattingRightContainer>
                    <TimeTextContainer>
                        <ChatTimeText>08:30</ChatTimeText>
                    </TimeTextContainer>
                    <MyTextContainer>
                        <MyText>I think</MyText>
                    </MyTextContainer>
                </ChattingRightContainer>
                <ChatDivider/>
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
                        <OtherFirstTextBox>
                            <OtherText>Hola~</OtherText>
                        </OtherFirstTextBox>
                        <OtherNotFirstTextBox>
                            <OtherText>Hola~ Vine a Corea desde Estados Unidos como estudiante de intercambio</OtherText>
                        </OtherNotFirstTextBox>
                    </OtherContainer>
                    <TimeTextContainer>
                        <ChatTimeText>16:30</ChatTimeText>
                    </TimeTextContainer>
                </ChattingLeftContainer>
                </ChatScreenContainer>
                <BottomContainer>
                    <InputTextBox
                        placeholder="Write Your Text"
                        placeholderTextColor="#616262"
                    />
                    <Feather name="send" size={23} color="#ffffff" />
                </BottomContainer>
            </Container>
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
    background-color:yellow;
    height:10%;
    align-items:center;
    justify-content: center;
    
`;

const HeaderTitleText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:16px;

`;

const Left=styled.View`
    background-color:green;
    flex:1;
`;
const Center=styled.View`
    background-color:red;
    flex:2;
    align-items:center;
`;
const Right=styled.View`
    background-color:blue;
    flex-direction:row;
    flex:1;
    justify-content:center;

`;

const ChatScreenContainer=styled.View`
    background-color:blue;
    flex-direction:column;
    height:76%;
`;

const TimeView=styled.View`
    background-color:green;
    align-items:center;
    justify-content:center;
    height:20px;
    margin:20px 0px;
`;
const TimeText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:11px;
`;
const ChattingLeftContainer = styled.View`
  background-color: yellow;
  max-width:285px;   /* 최대 너비 */
 
  flex-direction: row;
`;

const ProfileContainer=styled.View`
    background-color:red;
    width:38px; 

`;
const ProfileBox=styled.View`
    width:38x;
    height:38px;
    background-color:green;
`;

const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;
const OtherContainer=styled.View`
    background-color:blue;
    max-width:242px;
    padding-left:7px;
`;
const OtherNameText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
`;
const OtherFirstTextBox = styled.View`
  background-color: #414142;
  padding: 10px 14px;              /* 안쪽 여백 */
  margin-top: 5px;
  border-top-left-radius: 0px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  align-self: flex-start;          /* 텍스트 크기에 맞게 좌측 정렬 */
  max-width: 210px;                /* 최대 너비 */
`;

const OtherText=styled.Text`
    color:#FFFFFF;
    font-size:14px;
    font-family:PlusJakartaSans_300Light;
`;
const OtherNotFirstTextBox=styled.View`
  background-color: #414142;
  padding: 10px 14px;              /* 안쪽 여백 */
  margin-top: 5px;
  border-radius:16px;
  align-self: flex-start;          /* 텍스트 크기에 맞게 좌측 정렬 */
  max-width: 210px;                /* 최대 너비 */
`;

const TimeTextContainer=styled.View`
    background-color:red;
    width:32px;
    align-items:center; 
    justify-content:flex-end;
    margin : 0px 3px;
`;
const ChatTimeText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_300Light;
    font-size:10px;
`;

const ChattingRightContainer = styled.View`
  align-self: flex-end;      /* 부모 기준 오른쪽 정렬 */
  max-width: 285px;
  background-color: yellow;
  margin-top:20px;       /* 위/아래 간격 */
  margin-right:10px;
  flex-direction:row;
`;

const MyTextContainer=styled.View`
  padding: 10px 14px;        /* 말풍선 안쪽 여백 */
  max-width: 285px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 0px;
  background-color:#02F59B;
`;
const MyText=styled.Text`
    color:#1D1E1F;
    font-size:14px;
    font-family: PlusJakartaSans_400Regular;
`;

const ChatDivider=styled.View`
    width:100%;
    height:4px;
    background-color:#35363799;
    margin:20px 0px;
`;

const BottomContainer=styled.View`
    background-color:#1D1E1F;
    height:60px;
    border-top-width: 1px;
    border-top-color: #353637;
    justify-content:center;
    flex-direction:row;
    align-items:center;

`;
const InputTextBox=styled.TextInput`
    margin-left:5px;
    background-color:#353637;
    width:85%;
    height:45px;
    border-radius:8px;
    margin-right:30px;
    margin-left:-5px;
`;
