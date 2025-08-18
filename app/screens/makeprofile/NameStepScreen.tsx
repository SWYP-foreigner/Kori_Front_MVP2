import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// ------------------------
// NameStepScreen
// ------------------------
export default function NameStepScreen({ navigation}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [FirstNameSubmitted,setFirstNameSubmitted]=useState(false);
  const [LastNameSubmitted,setLastNameSubmitted]=useState(false);
  const canProceed = FirstNameSubmitted && LastNameSubmitted;
  const router=useRouter();
  const handleNext=()=>{
  //  router.push({
  //     pathname: './GenderStepScreen',
  //     params: { firstName, lastName }, // userData 대신 개별 필드
  //   });
    console.log("버튼 눌림")
    router.push({
      pathname:'./GenderStepScreen'
    })
  }

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
        <Container>
          <StepText>Step 1 / 9</StepText>

          <TitleWrapper>
            <Title>Tell us</Title>
            <Title>about your name.</Title>
          </TitleWrapper>

          <Subtitle>This is how it’ll appear on your profile.</Subtitle>
          <Form>
          <InputWrapper>
          
           <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#616262"
              autoCapitalize="words"
              returnKeyType="Next"
              onFocus={() => setFirstNameSubmitted(false)}
              onSubmitEditing={()=>{
               setFirstNameSubmitted(true);
    
              }}
            />
            {FirstNameSubmitted&&firstName.trim().length > 0 && <AntDesign name="check" size={20} color="#02F59B" />}
          </InputWrapper>
          <InputWrapper>
             <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#616262"
              autoCapitalize="words"
              returnKeyType="Done"
              onFocus={() => setLastNameSubmitted(false)}
              onSubmitEditing={()=>{
               setLastNameSubmitted(true);
              }}
            />
            {LastNameSubmitted&&lastName.trim().length > 0 && <AntDesign name="check" size={20} color="#02F59B" />}
          </InputWrapper>
        
          </Form>

          <Spacer />
          <NextButton
          onPress={handleNext}
            disabled={!canProceed}
            canProceed={canProceed}
          >
            <ButtonText>Next</ButtonText>
          </NextButton>

          <BottomSpacer />
        </Container>
    </SafeArea>
  );
}

// ------------------------
// Styled Components
// ------------------------
const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.bgColor || '#000'};
`;

const Container = styled.View`
  flex: 1;
  padding: 0px 20px;
`;

const StepText = styled.Text`
  color: #5BD08D;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans-Regular';
  margin-top:87px;
`;

const TitleWrapper = styled.View`
  margin-top: 46px;
`;

const Title = styled.Text`
  color: #FFFFFF;
  font-size: 40px;
  line-height: 40px;
  letter-spacing: 0.2px;
  font-family: 'InstrumentSerif-Regular';
`;

const Subtitle = styled.Text`
  margin-top: 15px;
  color: #949899;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Light';
`;

const Form = styled.View`
  margin-top: 50px;
`;
const InputWrapper=styled.View`
  width:335px;
  height:44px;
  border-radius:4px;
  background-color: #353637 ;
  flex-direction:row;
  align-items:center;
  margin-top:16px;
  padding: 0px 12px 0px 0px;
`;
const Input = styled.TextInput`
  flex:1;
  padding: 0 16px;
  color: #EDEDED;
`;

const Spacer = styled.View`
  flex: 1;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
  margin-bottom: 8px;
  opacity: ${(props) => (props.canProceed ? 1 : 0.5)};
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';

`;

const BottomSpacer = styled.View`
  height: 25px;
`;
