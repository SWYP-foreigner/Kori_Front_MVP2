import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import {
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from "axios";
import { Config } from "@/src/lib/config";
import Entypo from '@expo/vector-icons/Entypo';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

enum isDuplicatedEmail {
  Init = "Init",
  Exist = "Exist",
  NotExist = "NotExist",
}

enum isCorrectCode{
  Init = "Init",
  Fail = "Fail",
  Success = "Success",
}



const CreateAccountScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [lookPassword, setLookPassword] = useState(true);
  const [lookRepeatPassword, setLookRepeatPassword] = useState(true);
  const [isExistEmail,setIsExistEmail]=useState<isDuplicatedEmail>(isDuplicatedEmail.Init);
  const [isCorrect,setIsCorrect]=useState<isCorrectCode>(isCorrectCode.Init);
  const [code,setCode]=useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [allCheck,setAllCheck]=useState(false);
  const [check1,setCheck1]=useState(false);
  const [check2,setCheck2]=useState(false);
  const [check3,setCheck3]=useState(false);

  const [checks, setChecks] = useState({
    isnull: true,
    uppercase: false,
    length: false,
    special: false,
  });

  const [EmailChecks, setEmailChecks] = useState({
    isnull: true,
    isEmail: false,
  });

  const [isSamePassword,setIsSamePassword]=useState({
      isnull:true,
      isSame:false
  });
  
  const completeCondition =
    (isCorrect===isCorrectCode.Success) && checks.length && checks.uppercase && checks.special && (isSamePassword.isSame===true);
  
  useEffect(() => {
    setChecks({
      isnull: password.length === 0,
      length: password.length >= 8 && password.length <= 12,
      uppercase: /[A-Z]/.test(password),
      special: /[@!~]/.test(password),
    });
  }, [password]);

  useEffect(() => {
    setEmailChecks({
      isnull: email.length === 0,
      isEmail: isEmail(),
    });
  }, [email]);

  useEffect(()=>{
    setIsSamePassword({
      isnull:repeatPassword.length===0,
      isSame:repeatPassword===password
    });
  },[repeatPassword]);

  const isEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
 
  // 가입된 이메일 중복 체크 후 -> 이메일 인증 코드 발송
  const VerifyEmail = async() => {
      try {
      const res = await axios.post(`${Config.SERVER_URL}/api/v1/member/email/check`, { email:email });
      const {exists}=res.data.data;
      if(exists)
      {
        setIsExistEmail(isDuplicatedEmail.Exist);
      }
      else{
        // 이메일 인증 시작
        const res=await axios.post(`${Config.SERVER_URL}/api/v1/member/send-verification-email`,{email:email,lang:"en"});
        setIsExistEmail(isDuplicatedEmail.NotExist);
        console.log("이메일 인증 코드 발송",res.data);
       
      }
    } catch (err) {
      console.error("이메일 확인 중 에러 발생", err);
    }
  };

  // 이메일 인증 코드 보내서 검증 받음 
  const verifyCode=async()=>{
      try{
         const res=await axios.post(`${Config.SERVER_URL}/api/v1/member/verify-code`,
          {email:email,verificationCode:code});
          console.log("이메일 인증 코드 검증",res.data);
          const data=res.data.data
          console.log("잘왔나?",data);
          if(data)
          {
             setIsCorrect(isCorrectCode.Success);
          }
          else{
            setIsCorrect(isCorrectCode.Fail);
          }
      }catch(err){
         console.error("코드 확인 중 에러 발생", err);
      }
  }

  const JoinMember = async () => {
  try {
    const res = await axios.post(`${Config.SERVER_URL}/api/v1/member/signup`, {
      email: email,
      password: password,
      agreedToTerms: true,
    });

    // 서버에서 성공 응답 코드 확인 (예: status 200)
    if (res.status === 200) {
      console.log("회원가입 성공", res.data);
      router.replace("./SignUpDoneScreen");
    } else {
      console.log("회원가입 실패", res.data);
      Alert.alert("Signup Failed","Please try again.");
    }
  } catch (err) {
    console.error("회원가입 중 에러 발생", err);
    // 에러 처리
  }
};

   const showModal = () => {
    setModalVisible(true); // Next 버튼 클릭 시 모달 열기
  };

  const showTermsAndConditions=()=>{
      router.push("./TermsAndConditionsScreen");
  };
  
  const showPrivacyPolicy=()=>{
    router.push("./PrivacyPolicyScreen");
  };

  return (
    <SafeArea>
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
          {/* ScrollView 안에는 입력 폼만 */}
            <KeyboardAwareScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              extraScrollHeight={20} // 입력창 위로 조금만 올리기
              enableOnAndroid={true}
>
            <GeneralLoginContainer>
              {/* Email */}
              <TitleContainer>
                <TitleText>Email</TitleText>
              </TitleContainer>
              <VerifyContainer>
                <EmailContainer>
                  <EmailInputBox
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setIsExistEmail(isDuplicatedEmail.Init); // 입력값 바뀔 때마다 초기화
                      }}
                    placeholder="Enter email address"
                    placeholderTextColor={"#616262"}
                  />
                  <CloseErrorBox>
                    {!EmailChecks.isEmail && !EmailChecks.isnull && (
                      <Ionicons name="close-sharp" size={27} color="#FF4F4F" />
                    )}
                  </CloseErrorBox>
                </EmailContainer>

                {isExistEmail===isDuplicatedEmail.NotExist?(

                   <ShowVerifiedBox>
                    <Entypo name="check" size={24} color="#949899" />
                </ShowVerifiedBox>

                ):(
                      <VerifyButton
                        onPress={VerifyEmail}
                        disabled={!EmailChecks.isEmail}
                        canVerify={EmailChecks.isEmail}
                      >
                        <VerifyText>Verify</VerifyText>
                      </VerifyButton>
                )}
              
               
              </VerifyContainer>
              <ErrorBox>
                {!EmailChecks.isEmail && !EmailChecks.isnull && (
                      <>
                        <Ionicons
                          name="information-circle-outline"
                          size={18}
                          color="#FF4F4F"
                        />
                        <ErrorText>Not the correct email format.</ErrorText>
                      </>
                    )}

                    {EmailChecks.isEmail && (isExistEmail===isDuplicatedEmail.Exist) && (
                      <>
                        <Ionicons
                          name="information-circle-outline"
                          size={18}
                          color="#FF4F4F"
                        />
                        <ErrorText>This email is already in use.</ErrorText>
                      </>
                    )}
              </ErrorBox>
             {/* Code Verification Box */}
              <TitleContainer>
                <TitleText>Code Verification</TitleText>
              </TitleContainer>
              <VerifyContainer>
                <CodeVerifyContainer>
                  <CodeInputBox
                    value={code}
                    onChangeText={(text)=>{
                      setCode(text);
                      setIsCorrect(isCorrectCode.Init);
                    }
                    }
                    placeholder="Enter Code"
                    placeholderTextColor={"#616262"}
                  />
                  
                </CodeVerifyContainer>
                {isCorrect===isCorrectCode.Success ? (  
                  <ShowVerifiedBox>
                    <Entypo name="check" size={24} color="#949899" />
                </ShowVerifiedBox>)
                :(
                  <VerifyButton
                  onPress={verifyCode}
                  disabled={(isExistEmail===isDuplicatedEmail.Exist)}
                  canVerify={isExistEmail===isDuplicatedEmail.NotExist}
                >
                  <VerifyText>Verify</VerifyText>
                </VerifyButton>
                )}
              
              </VerifyContainer>
              {(isCorrect===isCorrectCode.Fail)&&(
                <>
               <ErrorBox>
                <Ionicons
                          name="information-circle-outline"
                          size={18}
                          color="#FF4F4F"
                        />
                        <ErrorText>Fail Code Verification</ErrorText>
              </ErrorBox>
              </>
                )}
                {(isCorrect===isCorrectCode.Success)&&(
                  <>
                  <NotErrorBox>
                  <AntDesign name="check" size={18} color="#02F59B" />
                  <NotErrorText>Authentication successful</NotErrorText>
                </NotErrorBox>
                  </>
                )}

              {/* Password */}
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
                  <TouchableOpacity onPress={() => setLookPassword(!lookPassword)}>
                    <Ionicons
                      name={lookPassword ? "eye-off-outline" : "eye-outline"}
                      size={25}
                      color="#616262"
                    />
                  </TouchableOpacity>
                </EyeIconBox>
              </PasswordContainer>

              {/* Password 체크 */}
              <CheckPasswordContainer>
                {/* Uppercase */}
                <CheckPasswordBox>
                  {checks.isnull ? (
                    <>
                      <AntDesign name="check" size={18} color="#848687" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.uppercase}>
                        Use all case letters
                      </CheckPasswordText>
                    </>
                  ) : checks.uppercase ? (
                    <>
                      <AntDesign name="check" size={18} color="#02F59B" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.uppercase}>
                        Use all case letters
                      </CheckPasswordText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.uppercase}>
                        Use all case letters
                      </CheckPasswordText>
                    </>
                  )}
                </CheckPasswordBox>

                {/* Length */}
                <CheckPasswordBox>
                  {checks.isnull ? (
                    <>
                      <AntDesign name="check" size={18} color="#848687" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.length}>
                        Enter 8-12 letters
                      </CheckPasswordText>
                    </>
                  ) : checks.length ? (
                    <>
                      <AntDesign name="check" size={18} color="#02F59B" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.length}>
                        Enter 8-12 letters
                      </CheckPasswordText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.length}>
                        Enter 8-12 letters
                      </CheckPasswordText>
                    </>
                  )}
                </CheckPasswordBox>

                {/* Special */}
                <CheckPasswordBox>
                  {checks.isnull ? (
                    <>
                      <AntDesign name="check" size={18} color="#848687" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.special}>
                        Enter special letters (@/!/~)
                      </CheckPasswordText>
                    </>
                  ) : checks.special ? (
                    <>
                      <AntDesign name="check" size={18} color="#02F59B" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.special}>
                        Enter special letters (@/!/~)
                      </CheckPasswordText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                      <CheckPasswordText isnull={checks.isnull} check={checks.special}>
                        Enter special letters (@/!/~)
                      </CheckPasswordText>
                    </>
                  )}
                </CheckPasswordBox>
              </CheckPasswordContainer>

              {/* Repeat Password */}
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
                  <TouchableOpacity
                    onPress={() => setLookRepeatPassword(!lookRepeatPassword)}
                  >
                    <Ionicons
                      name={lookRepeatPassword ? "eye-off-outline" : "eye-outline"}
                      size={25}
                      color="#616262"
                    />
                  </TouchableOpacity>
                </EyeIconBox>
              </PasswordContainer>
              {!(isSamePassword.isnull)&&(isSamePassword.isSame) && 
                <NotErrorBox>
                  <AntDesign name="check" size={18} color="#02F59B" />
                  <NotErrorText>Your password match.</NotErrorText>
                </NotErrorBox>}

              {!(isSamePassword.isnull)&&!(isSamePassword.isSame)&&
              <ErrorBox>
                  <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                  <ErrorText>Your password do not match.</ErrorText>
                </ErrorBox>}
            </GeneralLoginContainer>
            </KeyboardAwareScrollView>
          <NextButtonContainer
            disabled={!completeCondition}
            completeCondition={completeCondition}
            onPress={showModal}
          >
            <NextText>Next</NextText>
          </NextButtonContainer>
          
          
        </Container>
         <Modal
                  visible={modalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setModalVisible(false)}
                >
                  <ModalOverlay  activeOpacity={1}>
                    <BottomSheetContent>
                      <BottomSheetHeader>
                        <BottomSheetHandle />
                      </BottomSheetHeader>
                       <BottomSheetTitle>Please agree to the terms to continue.</BottomSheetTitle>
                        <AllCheckBoxContainer>
                          <CheckBox
                            onPress={() => {
                              const newValue = !allCheck; // 토글 후 값
                              setAllCheck(newValue);
                              setCheck1(newValue);
                              setCheck2(newValue);
                              setCheck3(newValue);
                              
                            }}
                            check={allCheck}
                          >{allCheck&&<Entypo name="check" size={15} color="#02F59B" />}</CheckBox><AllCheckText>I agree to all.</AllCheckText>

                        </AllCheckBoxContainer>
                        <Divider/>
                        <CheckBoxContainer>
                          <CheckBox
                             onPress={() =>setCheck1(!check1)}
                            check={check1}
                          >{check1&&<Entypo name="check" size={15} color="#02F59B" />}</CheckBox><CheckText>(Required) I am over 14 years old.</CheckText>

                        </CheckBoxContainer>
                        <CheckBoxContainer>
                           <CheckBox onPress={() =>setCheck2(!check2)}
                             check={check2}
                            >
                            {check2&&<Entypo name="check" size={15} color="#02F59B" />}
                            </CheckBox><CheckText>(Required) Terms & Conditions</CheckText>
                            <TouchableOpacity onPress={showTermsAndConditions}>
                            <MaterialIcons name="navigate-next" size={35} color="#848687" /></TouchableOpacity>
                        </CheckBoxContainer>
                        <CheckBoxContainer>
                           <CheckBox onPress={() =>setCheck3(!check3)}
                            check={check3}
                            >
                            {check3&&<Entypo name="check" size={15} color="#02F59B" />}
                            </CheckBox><CheckText>(Required) Privacy Policy</CheckText>
                            <TouchableOpacity onPress={showPrivacyPolicy}>
                            <MaterialIcons name="navigate-next" size={35} color="#848687" /></TouchableOpacity>
                        </CheckBoxContainer>
                     <ConfirmButton 
                      disabled={!allCheck}
                      allCheck={allCheck}
                      onPress={JoinMember}
                      >
                      <ConfirmText>Confirm</ConfirmText>
                     </ConfirmButton>
                    </BottomSheetContent>
                  </ModalOverlay>
                </Modal>
    </SafeArea>
  );
};

export default CreateAccountScreen;

/* 스타일 */
const SafeArea = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10%;
  align-items: center;
`;

const HeaderBox = styled.View`
  flex-direction: row;
  width: 72%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;

const GeneralLoginContainer = styled.View`
  flex: 1;
`;

const TitleContainer = styled.View`
  
  justify-content: flex-end;
  height: 50px;
`;

const TitleText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
  margin-bottom: 5px;
`;

const PasswordContainer = styled.View`
  background-color: #353637;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  margin-top: 5px;
`;

const PasswordInputBox = styled.TextInput`
  color: #ffffff;
  width: 85%;
  height: 50px;
  border-radius: 4px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const EyeIconBox = styled.View`
  background-color: #353637;
  border-radius: 4px;
  height: 50px;
  width: 15%;
  align-items: center;
  justify-content: center;
`;

const VerifyContainer = styled.View`
  margin-top: 5px;
  height: 50px;
  flex-direction: row;
`;

const EmailContainer = styled.View`
  
  background-color: #353637;
  width: 75%;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
`;

const EmailInputBox = styled.TextInput`
  width: 80%;
  color: #ffffff;
  height: 50px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const CloseErrorBox = styled.View`
  height: 50px;
  width: 20%;
  align-items: center;
  justify-content: center;
`;

const VerifyButton = styled.TouchableOpacity`
  background-color: #02f59b;
  width: 20%;
  border-radius: 4px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  opacity: ${(props) => (props.canVerify ? 1 : 0.5)};
`;
const ShowVerifiedBox =styled.View`
  width: 20%;
  border-radius: 4px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  border-color:#949899;
  border-width: 2px; 
    
`;

const VerifyText = styled.Text`
  color: #1d1e1f;
  font-size: 13px;
  font-family: PlusJakartaSans_600SemiBold;
`;

const ErrorBox = styled.View`
  
  height: 20px;
  margin-top: 10px;
  flex-direction: row;
`;

const ErrorText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 11px;
  margin-left: 5px;
`;

const NotErrorBox=styled.View`
  height: 20px;
  margin-top: 10px;
  flex-direction: row;
`;

const NotErrorText=styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 11px;
  margin-left: 5px;
`;
const CodeVerifyContainer=styled.View`
  background-color: #353637;
  width: 75%;
  height: 50px;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
`;
const CodeInputBox=styled.TextInput`
  width: 80%;
  color: #ffffff;
  height: 50px;
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
  padding-left: 10px;
`;

const CheckPasswordContainer = styled.View`

  margin: 10px 0px;
  height: 70px;
`;
const CodeInput=styled.TextInput`
  width: 80%;
  height:50px;

`;

const CheckPasswordBox = styled.View`
  flex-direction: row;
  height: 20px;
  margin: 2px 0px;
`;

const CheckPasswordText = styled.Text`
  margin-left: 9px;
  color: ${(props) =>
    props.isnull ? "#848687" : props.check ? "#ffffff" : "#FF4F4F"};
  font-size: 13px;
  font-family: PlusJakartaSans_400Regular;
`;

const NextButtonContainer = styled.TouchableOpacity`
  position: absolute;
  background-color: #02f59b;
  border-radius: 8px;
  width: 100%;
  height: 50px;
  bottom: 50px;
  opacity: ${(props) => (props.completeCondition ? 1 : 0.5)};
  align-items: center;
  justify-content: center;
  align-self: center;
`;

const NextText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheetContent = styled.View`
  background-color: #353637;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 60%;
  padding-bottom: 40px;
`;

const BottomSheetHeader = styled.View`
  align-items: center;
  padding: 15px 20px 10px 20px;
`;

const BottomSheetHandle = styled.View`
  width: 45px;
  height: 6px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const BottomSheetTitle = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-family:PlusJakartaSans_600SemiBold;
  margin-left:30px;
`;

  const AllCheckBoxContainer=styled.View`
    height:60px;
    margin:20px 5px 10px 5px;
    flex-direction:row;
    padding-left:20px;
    align-items:center;

  `;
  const AllCheckText=styled.Text`
    color: #FFFFFF;
    font-size:15px;
    font-family:PlusJakartaSans_600SemiBold;
    margin-left:15px;
    
  `;

  const Divider=styled.View`
    width: 90%;
    align-self:center;
    height: 2px;
    background-color: #616262;
    margin-bottom:10px;
  `;

  const CheckBoxContainer=styled.View`
   
    height:50px;
    margin:5px;
    flex-direction:row;
    align-items:center;
    padding-left:20px;
    padding-right: 15px;
  `;

const CheckBox=styled.TouchableOpacity`
    border-color: ${(props) => (props.check ? "#02F59B" : "#CCCFD0")};
    border-width:1.25px;
    width:20px;
    height:20px;
    align-items:center;
    justify-content:center;

`;
const CheckText=styled.Text`
    color: #FFFFFF;
    font-size:13px;
    font-family:PlusJakartaSans_500Medium;
    margin-left:15px;
    flex:1;
`;

const ConfirmButton=styled.TouchableOpacity`
    opacity:${(props)=>(props.allCheck? 1 : 0.5)};
    background-color:#02F59B;
    height:50px;
    width:90%;
    align-self:center;
    border-radius:8px;
    align-items:center;
    justify-content:center;
    margin:20px 0px;
`;

const ConfirmText=styled.Text`
    color:#1D1E1F;
    font-size:15px;
    font-family:PlusJakartaSans_500Medium;
`;
