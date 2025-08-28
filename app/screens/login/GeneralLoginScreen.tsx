import React, { useState } from "react";
import styled from "styled-components/native";
import {StatusBar,TouchableOpacity} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
const GeneralLoginScreen=()=>{
    const router = useRouter();


    return(<SafeArea>
            <StatusBar barStyle="light-content" />
            <Container>
                <HeaderContainer>
                    <HeaderBox>
                    <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={23} color="#CCCFD0" />
                      </TouchableOpacity>
                    <HeaderTitleText>Continue with email</HeaderTitleText>
                    </HeaderBox>
                </HeaderContainer>
                <GeneralLoginContainer>
                    <TitleContainer>
                        <TitleText>Email</TitleText>
                    </TitleContainer>
                    <InputBox
                        placeholder="Enter email address"
                        placeholderTextColor={"#616262"}
                    />
                        <TitleContainer>
                        <TitleText>Password</TitleText>
                    </TitleContainer>
                      <InputBox
                        placeholder="Enter Password"
                        placeholderTextColor={"#616262"}
                    />
                <ForgotContainer>
                    <ForgotText>
                        Forgot Password?
                    </ForgotText>
                </ForgotContainer>
                </GeneralLoginContainer>
                <LoginButtonContainer>
                    <LoginText>Login</LoginText>
                </LoginButtonContainer>
                <CNAContainter>
                    <CNAText>Create new account</CNAText>
                </CNAContainter>
            </Container>
            </SafeArea>);
};


export default GeneralLoginScreen;


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
`;

const HeaderBox=styled.View`
    flex-direction:row;
    width:72%;
    height:50px;
    align-items:center;
    justify-content:space-between;
`;

const HeaderTitleText=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:16px;
`;

const GeneralLoginContainer=styled.View`
    flex:1;
`;

const TitleContainer=styled.View`
    justify-content:flex-end;
    height:50px;

`;
const TitleText=styled.Text`
    color:#848687;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:13px;
    margin-bottom:5px;
`;

const InputBox=styled.TextInput`
    background-color:#353637;
    height:50px;
    border-radius:4px;
    font-size:13px;
    font-family:PlusJakartaSans_400Regular;
    margin-top:5px;
`;

const ForgotContainer=styled.View`
    align-items:center;
    justify-content:center;
    height:80px;

`;
const ForgotText=styled.Text`
    color:#CCCFD0;
    font-size:13px;
    font-family:PlusJakartaSans_500Medium;
    text-decoration-line: underline;
`;

const LoginButtonContainer=styled(ForgotContainer)`
    background-color:#02F59B;
    border-radius:8px;
    height:50px;
`;
const LoginText=styled.Text`
    color:#1D1E1F;
    font-size:15px;
    font-family:PlusJakartaSans_500Medium;
`;
const CNAContainter=styled(ForgotContainer)`
    margin-bottom:30px;    
    height:80px;

`;
const CNAText=styled(ForgotText)`
    color:#ffffff;
`;

