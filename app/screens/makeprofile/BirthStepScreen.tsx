import { useProfile } from '@/app/contexts/ProfileContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import SkipHeader from './components/SkipHeader';

export default function BirthdaySelectionScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [validbirth, setValidBirth] = useState(false);
  const { profileData, updateProfile } = useProfile();

  const handleChange = (value) => {
    // 1. 입력값에서 숫자만 추출합니다. (백스페이스 등 처리)
    const digits = value.replace(/\D/g, '');

    // 2. 길이에 따라 MM/DD/YYYY 형식으로 포맷팅합니다.
    let formattedValue = digits;
    if (digits.length > 2 && digits.length <= 4) {
      // "1234" -> "12/34"
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      // "12345678" -> "12/34/5678"
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    // 3. 포맷팅된 값으로 상태를 업데이트합니다.
    setText(formattedValue);

    // 4. 포맷팅된 값을 기준으로 유효성을 검사합니다. (기존 로직)
    if (formattedValue.length === 10) {
      if (validateDate(formattedValue)) {
        setValidBirth(true);
      } else {
        setValidBirth(false);
      }
    } else {
      setValidBirth(false);
    }
  };

  const validateDate = (input) => {
    // 1. MM/DD/YYYY 형식 체크
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(input)) return false;

    // 2. 실제 날짜 존재 여부
    const [month, day, year] = input.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;

    // 3. 미래 날짜 방지
    const today = new Date();
    if (date > today) return false;

    return true;
  };

  const handleSkip = () => {
    router.push('./PurposeStepScreen');
  };

  const moveNextScreen = () => {
    updateProfile('birthday', text);
    router.push('./PurposeStepScreen');
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <SkipHeader onSkip={handleSkip} />
        <StepText>Step 6 / 9</StepText>

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
            onChangeText={handleChange}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#616262"
            maxLength={10}
            isValid={validbirth}
            isText={text}
            returnKeyType="done"
            keyboardType="number-pad"
          />
          {validbirth && text.length === 10 ? (
            <AntDesign name="check" size={20} color="#02F59B" />
          ) : !validbirth && text.length === 10 ? (
            <AntDesign name="close" size={20} color="red" />
          ) : null}
        </BirthBox>

        {!validbirth && text.length === 10 && (
          <ErrorWrapper>
            <ErrorBox>
              <AntDesign name="close" size={17} color="red" />
              <ErrorText>Please insert a valid date</ErrorText>
            </ErrorBox>
          </ErrorWrapper>
        )}

        <Spacer />

        <NextButton onPress={moveNextScreen} disabled={!validbirth} isDone={validbirth}>
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
  margin-top: 87px;
`;

const TitleWrapper = styled.View`
  margin-top: 46px;
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
  line-height: 22px;
`;

const BirthBox = styled.View`
  background-color: #353637;
  border-radius: 4px;
  width: 100%;
  height: 50px;
  margin-top: 50px;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  padding: 0px 12px 0px 0px;
`;

const BirthInput = styled.TextInput`
  flex: 1;
  padding-left: 16px;
  color: ${(props) => (props.isText?.length === 10 ? (props.isValid ? '#ffffff' : '#FF4F4F') : '#ffffff')};
`;

const ErrorWrapper = styled.View`
  width: 100%;
  margin-top: 210px;
  align-items: center;
`;

const ErrorBox = styled.View`
  background-color: #171818cc;
  width: 60%;
  height: 36px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  border-radius: 8px;
`;

const ErrorText = styled.Text`
  color: #ffffff;
  margin-left: 12px;
  font-family: 'PlusJakartaSans-Medium';
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
  opacity: ${(props) => (props.isDone ? 1 : 0.5)};
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
