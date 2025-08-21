import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function BirthdaySelectionScreen({ navigation }) {
    const router=useRouter();
    const [text,setText]=useState('');

    const handleChange=()=>{
      
      if(text.length===10){
        if(!validateDate(text)){
          Alert.alert(
            'Invalid Birthday',
            'Please enter a valid birthday.'
          );
          return 
        }
      }
      router.push('./TagStepScreen')

    };

    const validateDate=(input)=>{
      const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!regex.test(input)) return false;

      // 2. 실제 날짜 존재 여부
      const [month, day, year] = input.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
        ) return false;

      // 3. 미래 날짜 방지
      const today = new Date();
      if (date > today) return false;

      return true;
    };


    return (
      <SafeArea bgColor="#0F0F10">
        <StatusBar barStyle="light-content" />
        <Container>
          <StepText>Step 8 / 9</StepText>

          <TitleWrapper>
            <Title>When is your</Title>
            <Title>Birthday?</Title>
          </TitleWrapper>

          <Subtitle>
            Don't worry. Only your age will be shown{'\n'}
            on your profile.
          </Subtitle>
          <BirthBox>
            <BirthInput
             value={text}
            onChangeText={setText}
            placeholder='MM/DD/YYYY'
            placeholderTextColor="#616262"
            maxLength={10}
            isText={text}/>
          </BirthBox>
          
          <Spacer />
          <NextButton
          onPress={handleChange}
          canProceed={(text.length===10)}
          // onPress={handleNext}
            disabled={text.length<10}
          //   canProceed={canProceed}
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
  margin-top: 87px;
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
  line-height: 22px;
`;

const BirthBox=styled.View`
  background-color:#353637;
  width:100%;
  height:50px;
  margin-top:50px;
  justify-content:center;
  
`;

const BirthInput=styled.TextInput`
  padding-left:12px;
  color:${(props)=>(props.isText.length>0) ? '#ffffff':'#616262'};

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