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
  const [AboutMe, setAboutMe] = useState('');
  const router = useRouter();
  const maxLength = 70;
  
  const isOverLimit = AboutMe.length > maxLength;
  const canProceed = AboutMe.trim().length > 0 && !isOverLimit;
  
  const handleNext = () => {
    if (canProceed) {
      console.log("버튼 눌림");
      router.push({
        pathname: './GenderStepScreen'
      });
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
          <InputWrapper isEmpty={AboutMe.length === 0} isError={isOverLimit}>
            <Input
              value={AboutMe}
              onChangeText={setAboutMe}
              placeholder="Describe myself here"
              placeholderTextColor="#616262"
              autoCapitalize="sentences"
              returnKeyType="done"
              multiline
              textAlignVertical="top"
              maxLength={100} // 소프트 리미트보다 약간 높게 설정
            />
            
            <CharacterCountWrapper>
              <CharacterCount isError={isOverLimit}>
                {AboutMe.length}/{maxLength} limit
              </CharacterCount>
            </CharacterCountWrapper>
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
`;

const Form = styled.View`
  margin-top: 50px;
`;

const InputWrapper = styled.View`
  width: 335px;
  height: 199px;
  border-radius: 10px;
  background-color: #353637;
  margin-top: 16px;
  padding: 16px;
  position: relative;
`;

const Input = styled.TextInput`
  flex: 1;
  color: #EDEDED;
  font-size: 16px;
  line-height: 24px;
  font-family: 'PlusJakartaSans-Regular';
  text-align-vertical: top;
`;

const CharacterCountWrapper = styled.View`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const CharacterCount = styled.Text`
  color: ${props => props.isError ? '#FF6B6B' : '#666'};
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