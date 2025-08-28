import React, { useState } from "react";
import styled from "styled-components/native";
import {StatusBar,TouchableOpacity} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

const CreateAccountScreen=()=>{
    const router = useRouter();
    const [email,setEmail]=useState('');
    const [password, setPassword]=useState('');
    const [repeatPassword,setRepeatPassword]=useState('');
    const [firstCheck,setFirstCheck]=useState('');
    const [lookPassword, setLookPassword] = useState(true);
    const [lookRepeatPassword,setLookRepeatPassword]=useState(true);
    const isFull=(email&&password);

    // Verify 버튼 눌렀을때
    const VerifyEmail=()=>{
        console.log("이메일 검증");

    };

    // 이메일 형식에 맞는지 체크
    const CheckEmail=()=>{

    };
    
    

    return(<SafeArea>
            <StatusBar barStyle="light-content" />
            <Container>
                <HeaderContainer>
                    <HeaderBox>
                    <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={23} color="#CCCFD0" />
                      </TouchableOpacity>
                    <HeaderTitleText>Create your account</HeaderTitleText>
                    </HeaderBox>
                </HeaderContainer>
                <GeneralLoginContainer>
                    <TitleContainer>
                        <TitleText>Email</TitleText>
                    </TitleContainer>
                    <VerifyContainer>
                    <EmailContainer>
                        <EmailInputBox
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email address"
                            placeholderTextColor={"#616262"}
                        />
                        <CloseErrorBox>
                             <Ionicons name="close-sharp" size={27} color="#FF4F4F" />
                        </CloseErrorBox>
                    </EmailContainer>
                    <VerifyButton>
                        <VerifyText>Verify</VerifyText>
                    </VerifyButton>
                    </VerifyContainer>
                    <ErrorBox>
                        <Ionicons name="information-circle-outline" size={18} color="#FF4F4F" />
                        <ErrorText>This email is already in use. </ErrorText>
                    </ErrorBox>
                    <TitleContainer>
                        <TitleText>Password</TitleText>
                    </TitleContainer>
                       <PasswordContainer>
                            <PasswordInputBox
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter Password"
                            placeholderTextColor={"#616262"}
                            secureTextEntry={lookPassword}
                        />
                        <EyeIconBox>
                            <TouchableOpacity onPress={()=>{setLookPassword(!lookPassword)}}>
                             <Ionicons
                                name={lookPassword ? "eye-off-outline" : "eye-outline"}
                                size={25}
                                color="#616262"
                            />
                            </TouchableOpacity>
                        </EyeIconBox>
                       </PasswordContainer>
                    <CheckPasswordContainer>
                        <CheckPasswordBox>
                            <AntDesign name="check" size={18} color="#02F59B" />
                            <CheckPasswordText>Use all case letters</CheckPasswordText>
                        </CheckPasswordBox>
                        <CheckPasswordBox>
                            <AntDesign name="check" size={18} color="#02F59B" />
                            <CheckPasswordText>Enter 8-12 letters</CheckPasswordText>
                        </CheckPasswordBox>
                        <CheckPasswordBox>
                            <AntDesign name="check" size={18} color="#02F59B" />
                            <CheckPasswordText>Enter special letters (@/!/~)</CheckPasswordText>
                        </CheckPasswordBox>
                    </CheckPasswordContainer>
                    <TitleContainer>
                        <TitleText>Repeat Password</TitleText>
                    </TitleContainer>
                     <PasswordContainer>
                            <PasswordInputBox
                            value={repeatPassword}
                            onChangeText={setRepeatPassword}
                            placeholder="Enter Password"
                            placeholderTextColor={"#616262"}
                            secureTextEntry={lookRepeatPassword}
                        />
                        <EyeIconBox>
                            <TouchableOpacity onPress={()=>{setLookRepeatPassword(!lookRepeatPassword)}}>
                             <Ionicons
                                name={lookRepeatPassword ? "eye-off-outline" : "eye-outline"}
                                size={25}
                                color="#616262"
                            />
                            </TouchableOpacity>
                        </EyeIconBox>
                       </PasswordContainer>
                     <ErrorBox>
                        <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                        <ErrorText>Your password do not match. </ErrorText>
                    </ErrorBox>
                </GeneralLoginContainer>
                
                <NextButtonContainer 
                    // isFull={isFull} 
                    // disabled={!isFull}
                    // onPress={goLogin}
                    >
                    <NextText>Next</NextText>
                </NextButtonContainer>
                <BottomSpacer/>
            </Container>
            </SafeArea>);
};


export default CreateAccountScreen;


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
const PasswordContainer=styled.View`
    background-color:#353637;
    height:50px;
    border-radius:4px;
    flex-direction:row;
    margin-top:5px;
`;
const PasswordInputBox=styled.TextInput`
    color:#ffffff;
    width:85%;
    height:50px;
    border-radius:4px;
    font-size:13px;
    font-family:PlusJakartaSans_400Regular;
    padding-left:10px;
    
`;
const EyeIconBox=styled.View`
    background-color:#353637;
    border-radius:4px;
    height:50px;
    width:15%;
    align-items:center;
    justify-content:center;
`;

const VerifyContainer=styled.View`
    margin-top:5px;
    height:50px;
    flex-direction:row;
`;

const EmailContainer=styled.View`
    background-color:#353637;
    width:75%;
    height:50px;
    border-radius:4px;
    flex-direction:row;
    align-items:center;
`;

const EmailInputBox=styled.TextInput`
    width:80%;
    color:#ffffff;
    height:50px;
    font-size:13px;
    font-family:PlusJakartaSans_400Regular;
    padding-left:10px;
`;

const CloseErrorBox=styled.View`
    height:50px;
    width:20%;
    align-items:center;
    justify-content:center;
`;

const VerifyButton=styled.TouchableOpacity`
    background-color:#02F59B;
    width:20%;
    border-radius:4px;
    height:50px;
    font-size:13px;
    font-family:PlusJakartaSans_400Regular;
    align-items:center;
    justify-content:center;
    margin-left:5px;
`;
const VerifyText=styled.Text`
    color:#1D1E1F;
    font-size:13px;
    font-family:PlusJakartaSans_600SemiBold;
`;

const ErrorBox=styled.View`
    height:20px;
    margin-top:10px;
    flex-direction:row;
`;
const ErrorText=styled.Text`
    color:#ffffff;
    font-family:PlusJakartaSans_500Medium;
    font-size:11px;
    margin-left:5px;
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

const CheckPasswordContainer=styled.View`
    margin:20px 0px;
    height:70px;
`;
const CheckPasswordBox=styled.View`
    flex-direction:row;
    height:20px;
    margin:2px 0px;
`;
const CheckPasswordText=styled.Text`
    margin-left:9px;
    color:#ffffff;
    font-size:13px;
    font-family:PlusJakartaSans_400Regular;
    
`;


const NextButtonContainer=styled.TouchableOpacity`
    background-color:#02F59B;
    border-radius:8px;
    height:50px;
    opacity: ${(props) => (props.isFull ? 1 : 0.5)};
    align-items:center;
    justify-content:center;
`;
const NextText=styled.Text`
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

const BottomSpacer=styled.View`    
    height:50px;
`;