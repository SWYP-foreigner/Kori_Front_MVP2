import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import {
  StatusBar
} from "react-native";
import { useRouter } from 'expo-router';

const ProfileSetUpDoneScreen=()=>{
    const router=useRouter();
    const startKori=()=>{
        router.replace('../../(tabs)');
    };

    return( <SafeArea>
          <StatusBar barStyle="light-content" />
          <Container source={require('@/assets/images/ProfileSetUpDone.png')} resizeMode="cover">
                <TitleText>Profile set up Done!</TitleText>
                <SubTitleText>Now,you can use Kori</SubTitleText>
                <Button 
                    onPress={startKori}
                >
                    <ButtonText>Start Kori!</ButtonText>
                </Button>
            </Container>
          </SafeArea>);

};



export default ProfileSetUpDoneScreen;



const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.ImageBackground`
  flex: 1;
  width: 100%;
  height: 100%;
  align-items:center;
`;

const TitleText=styled.Text`
    color:#FFFFFF;
    font-size:50px;
    font-family:InstrumentSerif_400Regular;
    position:absolute;
    top:100;
`;
const SubTitleText=styled.Text`
    color:#CCCFD0;
    font-size:17px;
    font-family:PlusJakartaSans_300Light;
    position:absolute;
    top:170;
`;
const Button=styled.TouchableOpacity`
    position:absolute;
    align-self:center;
    bottom:50;
    background-color:#02F59B;
    width:90%;
    height:50px;
    border-radius:8px;
    align-items:center;
    justify-content:center;
`;
const ButtonText=styled.Text`
   color:#1D1E1F;
   font-size:16px;
   font-family:PlusJakartaSans_500Medium;
`;