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
                </ChattingLeftContainer>
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
const TimeView=styled.View`
    background-color:green;
    align-items:center;
    justify-content:center;
`;
const TimeText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:11px;
`;
const ChattingLeftContainer = styled.View`
  background-color: yellow;
  max-width:280px;   /* 최대 너비 */
  height: 152px;
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
const OtherFirstTextBox=styled.View`
    background-color:#414142;
    max-width:210px;
    margin-top:5px;
    border-top-left-radius: 0px;   /* ⬅️ 왼쪽 상단만 0 */
    border-top-right-radius: 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
`;
const OtherText=styled.Text`
    color:#FFFFFF;
    font-size:14px;
    font-family:PlusJakartaSans_300Light;
`;
const OtherNotFirstTextBox=styled.View`
    margin-top:10px;
    background-color:#414142;
    max-width:210px;
    padding:10px 12px;;
    border-radius:10px;
    align-items:center;
    justify-content:center;
`;
const OtherTimeText=styled.View``;
