import React from "react";
import styled from "styled-components/native";
import {TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


const MembersBox=({ name, onPressMore,isHost,imageUrl })=>{
    const router = useRouter();
    return(<MemberContainer>   
                    <ProfileBox>
                        <ProfileImage source={{uri:imageUrl}}/>
                    </ProfileBox>
                    <Memberbox>
                        <MemberisHostBox>
                            <MemberNameText>{name}</MemberNameText>
                            {isHost&&
                            <HostBox>
                                <HostText>Host</HostText>
                            </HostBox>}
                        </MemberisHostBox>
                        <TouchableOpacity onPress={onPressMore}>
                        <AntDesign name="ellipsis1" size={24} color="#848687" />
                        </TouchableOpacity>
                    </Memberbox>
                </MemberContainer>);

};


export default MembersBox;




const MemberContainer=styled.View`
    height:70px;
    flex-direction:row;
    margin:8px 0px;
    align-items:center;
`;
const ProfileBox=styled.View`
    width:20%;
    height:80%;
    

`;
const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;
const Memberbox=styled.View`
    flex:1;
    flex-direction:row;
    justify-content: space-between; /* 양쪽 끝으로 요소 배치 */
    align-items: center;        /* 세로 가운데 정렬 */
    padding-right:6px;
    
`;
const MemberisHostBox=styled.View`
    flex-direction:row;
    justify-content:center;
    align-content:center;

`;
const HostBox=styled.View`
    background-color:#02F59B40;
    border-radius:4px;
    justify-content:center;
    align-items:center;
    margin-left:7px;
    width:36px;
    height:20px;
`;
const HostText=styled.Text`
    color:#FFFFFF;
    font-size:11px;
    font-family:PlusJakartaSans_500Medium;
`;
const MemberNameText=styled.Text`
    margin-left:10px;
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:14px;
`;