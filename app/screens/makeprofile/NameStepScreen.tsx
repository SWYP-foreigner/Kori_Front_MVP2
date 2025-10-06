import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useProfile } from '../../contexts/ProfileContext';
import { useRouter } from 'expo-router';

// ------------------------
// NameStepScreen
// ------------------------
export default function NameStepScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const canProceed = firstName && lastName;
  const router = useRouter();
  const { profileData, updateProfile } = useProfile();

  const handleNext = () => {
    updateProfile('firstname', firstName);
    updateProfile('lastname', lastName);
    router.push('./GenderStepScreen');
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
            />
            {firstName && firstName.trim().length > 0 && <AntDesign name="check" size={20} color="#02F59B" />}
          </InputWrapper>
          <InputWrapper>
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#616262"
              autoCapitalize="words"
            />
            {lastName && lastName.trim().length > 0 && <AntDesign name="check" size={20} color="#02F59B" />}
          </InputWrapper>
        </Form>

        <Spacer />
        <NextButton onPress={handleNext} disabled={!canProceed} canProceed={canProceed}>
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
  color: #5bd08d;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans-Regular';
  margin-top: 40px;
`;

const TitleWrapper = styled.View`
  margin-top: 30px;
`;

const Title = styled.Text`
  color: #ffffff;
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
const InputWrapper = styled.View`
  width: 100%;
  height: 44px;
  border-radius: 4px;
  background-color: #353637;
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
  padding: 0px 12px 0px 0px;
`;
const Input = styled.TextInput`
  flex: 1;
  padding: 0 16px;
  color: #ededed;
`;

const Spacer = styled.View`
  flex: 1;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02f59b;
  margin-bottom: 8px;
  opacity: ${(props) => (props.canProceed ? 1 : 0.5)};
`;

const ButtonText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;

const BottomSpacer = styled.View`
  height: 25px;
`;
