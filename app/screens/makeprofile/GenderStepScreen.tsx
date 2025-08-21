import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// ------------------------
// NameStepScreen
// ------------------------
export default function GenderStepScreen({ navigation}) {
  const [FemaleClicked, setFemaleClicked] = useState(false);
  const [MaleClicked,setMaleClicked]=useState(false);
  const [NotSayingClicked,setNotSayingClicked]=useState(false);

  const canProceed = FemaleClicked||MaleClicked||NotSayingClicked
  const router=useRouter();

  const handleGenderClick = (gender) => {
  setFemaleClicked(gender === 'Female');
  setMaleClicked(gender === 'Male');
  setNotSayingClicked(gender === 'NotSaying');
};
  const handleNext=()=>{
  //  router.push({
  //     pathname: './GenderStepScreen',
  //     params: { firstName, lastName }, // userData 대신 개별 필드
  //   });
  router.push({
    pathname:'./CountryStepScreen'
  })
    console.log("버튼 눌림")
  }

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
        <Container>
          <StepText>Step 2 / 9</StepText>

          <TitleWrapper>
            <Title>What is</Title>
            <Title>your gender?</Title>
          </TitleWrapper>

          <Subtitle>This is how it’ll appear on your profile.</Subtitle>
          <Form>
          <GenderWrapper
            onPress={()=>handleGenderClick('Female')}
            active={FemaleClicked}>
           <GenderText>Female</GenderText>
            {FemaleClicked &&<AntDesign name="check" size={20} color="#02F59B" />}
          </GenderWrapper>
          <GenderWrapper  onPress={()=>handleGenderClick('Male')}
            active={MaleClicked}>
             <GenderText>Male</GenderText>
            {MaleClicked &&<AntDesign name="check" size={20} color="#02F59B" />}
              
          </GenderWrapper>
            <GenderWrapper  
            onPress={()=>handleGenderClick('NotSaying')}
            active={NotSayingClicked}>
             <GenderText>Prefer not to say</GenderText>
            {NotSayingClicked &&<AntDesign name="check" size={20} color="#02F59B" />}    
          </GenderWrapper>
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
  margin-top:40px;
`;

const TitleWrapper = styled.View`
  margin-top: 30px;
`;

const Title = styled.Text`
  color: #FFFFFF;
  font-size: 40px;
  line-height: 45px;
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
const GenderWrapper=styled.TouchableOpacity`
  width:100%;
  height:44px;
  border-radius:4px;
  background-color: #353637 ;
  flex-direction:row;
  align-items:center;
  margin-top:16px;
  padding: 0px 12px 0px 0px;
  opacity: ${(props) => (props.active ? 1 : 0.4)};
`;
const GenderText = styled.Text`
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
  opacity: ${(props) => (props.canProceed ? 1 : 0.4)};
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
