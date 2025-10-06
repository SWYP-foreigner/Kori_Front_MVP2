import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { useProfile } from '../../contexts/ProfileContext';
// ------------------------
// NameStepScreen
// ------------------------
export default function NameStepScreen() {
  const [AboutMe, setAboutMe] = useState('');
  const { profileData, updateProfile } = useProfile();
  const router = useRouter();
  const maxLength = 70;

  const isOverLimit = AboutMe.length == 70;
  const canProceed = AboutMe.trim().length > 0 && !isOverLimit;

  const handleNext = () => {
    if (canProceed) {
      updateProfile('introduction', AboutMe);
      router.push('./BirthStepScreen');
    }
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <StepText>Step 5 / 9</StepText>

        <TitleWrapper>
          <Title>About me</Title>
        </TitleWrapper>

        <Subtitle>Tell us about your short story.</Subtitle>

        <Form>
          <InputWrapper>
            <Input
              value={AboutMe}
              onChangeText={setAboutMe}
              placeholder="Describe myself here"
              placeholderTextColor="#616262"
              returnKeyType="done"
              multiline
              textAlignVertical="top"
              maxLength={70} // 소프트 리미트보다 약간 높게 설정
              submitBehavior="blurAndSubmit"
            />

            <CharacterCountWrapper>
              <CharacterCount isError={isOverLimit}>
                {AboutMe.length}/{maxLength} limit
              </CharacterCount>
            </CharacterCountWrapper>
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
  height: 199px;
  border-radius: 10px;
  background-color: #353637;
  margin-top: 16px;
  padding: 16px;
  position: relative;
`;

const Input = styled.TextInput`
  flex: 1;
  color: #ededed;
  font-size: 16px;
  line-height: 24px;
  font-family: PlusJakartaSans_400Regular;
  text-align-vertical: top;
`;

const CharacterCountWrapper = styled.View`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const CharacterCount = styled.Text`
  color: ${(props) => (props.isError ? '#FF6B6B' : '#666')};
  font-size: 12px;
  font-family: 'PlusJakartaSans-Regular';
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
