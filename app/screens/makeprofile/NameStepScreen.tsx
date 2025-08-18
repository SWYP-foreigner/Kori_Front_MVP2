import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

// ------------------------
// NameStepScreen
// ------------------------
export default function NameStepScreen({ navigation, onNext }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const canProceed = useMemo(
    () => firstName.trim().length > 0 && lastName.trim().length > 0,
    [firstName, lastName]
  );

  const handleNext = () => {
    if (!canProceed) return;
    if (typeof onNext === 'function') {
      onNext({ firstName: firstName.trim(), lastName: lastName.trim() });
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('NextStep', { firstName: firstName.trim(), lastName: lastName.trim() });
    }
  };

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
            />
            <AntDesign name="check" style={{ marginLeft: 8 }} size={24} color="#02F59B" />
          </InputWrapper>
          <InputWrapper>
             <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#616262"
              autoCapitalize="words"
              returnKeyType="Done"
            />
            <AntDesign name="check" size={24} color="#02F59B" />
          </InputWrapper>
        
          </Form>

          <Spacer />

          <NextButton
            activeOpacity={0.8}
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
  background-color: ${(props) => (props.canProceed ? '#02F59B' : '#02F59B')};
  margin-bottom: 8px;
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
