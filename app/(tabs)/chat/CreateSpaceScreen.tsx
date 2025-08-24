import React, { useState } from "react";
import styled from "styled-components/native";
import Feather from '@expo/vector-icons/Feather';
import {StatusBar} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CreateSpaceScreen=()=>{
    const [text,onChangeText]=useState('');
   
    return(
        <SafeArea>
            <StatusBar barStyle="light-content" />
            <Container>
                <HeaderContainer>
                    <Feather name="arrow-left" size={23} color="#CCCFD0" />
                    <HeaderTitleText>Create Space</HeaderTitleText>
                    <SaveText>Save</SaveText>
                </HeaderContainer>
                <ProfileContainer>
                    <ProfileBox>
                        <ProfileImage source={require("@/assets/images/character3.png")}/>
                        <CameraContainer>
                            <FontAwesome name="camera" size={17} color="black" />
                        </CameraContainer>
                    </ProfileBox>
                </ProfileContainer>
                <SpaceNameContainer>
                    <SpaceNameText>Space Name</SpaceNameText>
                    <SpaceNamelengthText>0/20</SpaceNamelengthText>
                </SpaceNameContainer>
                <EnterSpaceNameContainer
                    value={text}
                    onChangeText={onChangeText}
                    maxLength={20}
                    placeholder="Enter Space name"
                    placeholderTextColor="#848687"/>
                    <SpaceDecContainer>
                        <SpaceDecText>Space Description</SpaceDecText>
                    </SpaceDecContainer>
                    <EnterDecContainer>
                        <EnterDecInput
                            placeholder="Describe space here"
                            placeholderTextColor="#848687"
                            maxLength={70}
                        />
                        <LimitWrapper>
                            <LimitCount>0/200 limit</LimitCount>
                        </LimitWrapper>
                    </EnterDecContainer>
            </Container>
        </SafeArea>

    );

};



export default CreateSpaceScreen


const SafeArea=styled.SafeAreaView`
    flex:1;
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
    justify-content:space-between;
`;
const HeaderTitleText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:16px;

`;
const SaveText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_500Medium;
    font-size:15px;
`;
const ProfileContainer=styled.View`
    height:30%;    
    align-items:center;
    justify-content:center;
`;
const ProfileBox=styled.View`
    width:150px;
    height:150px;

`;
const CameraContainer=styled.View`
    position:absolute;
    bottom:20px;
    right:5px;
    width:32px;
    height:32px;
    border-radius:30px;
    background-color:#02F59B;
    justify-content:center;
    align-items:center;
    z-index:999;
`;
const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;
const SpaceNameContainer=styled.View`
    height:40px;
    justify-content:space-between;
    flex-direction:row;
    align-items:center;
`;
const SpaceNameText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
`;
const SpaceNamelengthText=styled.Text`
    color:#CCCFD0;
    font-family:PlusJakartaSans_400Regular;
    font-size:13px;
`;
const EnterSpaceNameContainer=styled.TextInput`
    background-color:#353637;
    height:50px;
    padding-left:10px;
    border-radius:4px;
    color: #EDEDED;
`;
const SpaceDecContainer=styled.View`
    height:40px;
    justify-content:center;
`;
const SpaceDecText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
    margin-top:10px;
`;

const EnterDecContainer=styled.View`
    background-color:#353637;
    height:200px;
    border-radius:4px;
    color: #EDEDED;
    padding-left:10px;
    position: relative;
    margin-top:3px;

`;
const EnterDecInput=styled.TextInput`
    flex:1;
    color: #EDEDED;
    font-size: 16px;
    line-height: 24px;
    font-family:PlusJakartaSans_400Regular;
    text-align-vertical: top;
`;

const LimitWrapper = styled.View`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const LimitCount = styled.Text`
  color: #848687;
  font-size: 12px;
  font-family: PlusJakartaSans_500Medium;
`;

