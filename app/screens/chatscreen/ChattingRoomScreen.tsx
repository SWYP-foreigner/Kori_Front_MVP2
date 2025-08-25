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
                            <ProfileImage/>
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
const ChattingLeftContainer=styled.View`
    background-color:yellow;
    width:280px;
    height:152px;
    flex-direction:row;

`;
const ProfileContainer=styled.View`
    background-color:red;
    
`;
const ProfileBox=styled.View``;
const ProfileImage=styled.Image``;
const OtherContainer=styled.View``;
const OtherNameText=styled.Text``;
const OtherFirstTextBox=styled.View``;
const OtherText=styled.Text``;
const OtherNotFirstTextBox=styled.View``;
const OtherTimeText=styled.View``;
