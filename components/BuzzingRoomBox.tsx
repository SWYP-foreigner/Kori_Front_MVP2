import React from "react";
import styled from "styled-components/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';


const BuzzingRoomBox=({data})=>{
    const router = useRouter();
    const onhandleNext=()=>{
      router.push({
      pathname: '../screens/chatscreen/LinkedSpaceDetail',
      params: { 
        roomId: data.roomId,       // props에서 바로 가져옴
      },
    });
    };

   
    return(
    <BuzzingBox onPress={onhandleNext}>
                <BuzzingImageContainer>
                    <BuzzingImage source={{ uri: data.roomImageUrl }}/>
                </BuzzingImageContainer>
                <BuzzingTitleContainer>
                    <BuzzingTitle>{data.roomName}</BuzzingTitle>
                    <BuzzingTitleContent>{data.description}</BuzzingTitleContent>
                </BuzzingTitleContainer>
                <BuzzingMemberContainer>
                    <MaterialIcons name="person-outline" size={18} color='#ffffff' />
                    <BuzzingMemberCount>{data.userCount} members in</BuzzingMemberCount>
                </BuzzingMemberContainer>
    </BuzzingBox>);

};

export default BuzzingRoomBox;


const BuzzingBox=styled.TouchableOpacity`
    background-color:#353637;
    width:200px;
    border-radius:8px;
    height:236px;
    flex-direction:column;
    margin-right:7px;
`;
const BuzzingImageContainer=styled.View`
    width:70px;
    height:70px;
    border-radius:100px;
    margin:20px 0px 10px 15px;
    align-items:center;
    justify-content:center;
     overflow: hidden;
    
`;
const BuzzingImage=styled.Image`
  width:100%;
  height:100%;
  resize-mode:contain;
`;

const BuzzingTitleContainer=styled.View`
    width:75%;
    margin-left:20px;
    `;
const BuzzingTitle=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:14px;
`;

const BuzzingTitleContent=styled.Text`
    color:#CCCFD0;
    font-family: PlusJakartaSans_300Light;
    
`;
const BuzzingMemberContainer=styled.View`
    
    align-items:center;
    flex-direction:row;
    margin:45px 0px 10px 20px`;

const BuzzingMemberCount=styled.Text`
    font-size:12px;
    color:#CCCFD0;
    margin-left:2px;
    font-family:PlusJakartaSans_600SemiBold;
`;