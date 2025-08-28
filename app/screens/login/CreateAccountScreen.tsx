import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import {
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

const CreateAccountScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [lookPassword, setLookPassword] = useState(true);
  const [lookRepeatPassword, setLookRepeatPassword] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState(false);

  const isSamePassword = repeatPassword === password;

  const [checks, setChecks] = useState({
    isnull: true,
    uppercase: false,
    length: false,
    special: false,
  });

  const [EmailChecks, setEmailChecks] = useState({
    isnull: true,
    isEmail: false,
    isVerified: false,
  });

  const completeCondition =
    verifyEmail && checks.length && checks.uppercase && checks.special && isSamePassword;

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
      isVerified: verifyEmail,
    });
  }, [email]);

  const isEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const VerifyEmail = () => {
    console.log("이메일 검증 API 요청");
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
        <KeyboardAvoidingView>
          {/* ScrollView 안에는 입력 폼만 */}
          <ScrollView
             contentContainerStyle={{ flexGrow: 1 }}
             keyboardShouldPersistTaps="handled"
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
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={"#616262"}
                  />
                  <CloseErrorBox>
                    {!EmailChecks.isEmail && !EmailChecks.isnull && (
                      <Ionicons name="close-sharp" size={27} color="#FF4F4F" />
                    )}
                  </CloseErrorBox>
                </EmailContainer>
                <VerifyButton
                  onPress={VerifyEmail}
                  disabled={!EmailChecks.isEmail}
                  canVerify={EmailChecks.isEmail}
                >
                  <VerifyText>Verify</VerifyText>
                </VerifyButton>
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
              </ErrorBox>

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
              {!isSamePassword && (
                <ErrorBox>
                  <Ionicons name="close-sharp" size={18} color="#FF4F4F" />
                  <ErrorText>Your password do not match.</ErrorText>
                </ErrorBox>
              )}
            </GeneralLoginContainer>
          </ScrollView>
          </KeyboardAvoidingView>
          <NextButtonContainer
            disabled={!completeCondition}
            completeCondition={completeCondition}
          >
            <NextText>Next</NextText>
          </NextButtonContainer>
        </Container>
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

const CheckPasswordContainer = styled.View`
  margin: 20px 0px;
  height: 70px;
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
