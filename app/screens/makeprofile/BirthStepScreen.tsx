import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function BirthdaySelectionScreen({ navigation }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tempDate, setTempDate] = useState({
    month: 'September',
    day: 17,
    year: 2021
  });
  const router = useRouter();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

  const canProceed = selectedDate !== null;

  const handleDateSelect = () => {
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    const monthIndex = months.indexOf(tempDate.month) + 1;
    setSelectedDate(`${String(monthIndex).padStart(2, '0')}/${String(tempDate.day).padStart(2, '0')}/${tempDate.year}`);
    setShowDatePicker(false);
  };

  const handleNext = () => {
    if (canProceed) {
      console.log("Selected birthday:", selectedDate);
      router.push({
        pathname: './NextStepScreen'
      });
    }
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return 'MM/DD/YYYY';
    return selectedDate;
  };

  if (showDatePicker) {
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
          
          <DateInputSection>
            <DateInput onPress={() => setShowDatePicker(false)} hasValue={true}>
              <DateText hasValue={true}>
                MM/DD/YYYY
              </DateText>
              <AntDesign name="up" size={16} color="#616262" />
            </DateInput>
          </DateInputSection>

          <PickerSection>
            <PickerHandle />
            
            <PickerContainer>
              <PickerColumn>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 20 }}
                >
                  {months.map((month) => (
                    <PickerItem 
                      key={month}
                      isSelected={tempDate.month === month}
                      onPress={() => setTempDate({...tempDate, month})}
                    >
                      <PickerText isSelected={tempDate.month === month}>
                        {month}
                      </PickerText>
                    </PickerItem>
                  ))}
                </ScrollView>
              </PickerColumn>
              
              <PickerColumn>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 20 }}
                >
                  {days.map((day) => (
                    <PickerItem 
                      key={day}
                      isSelected={tempDate.day === day}
                      onPress={() => setTempDate({...tempDate, day})}
                    >
                      <PickerText isSelected={tempDate.day === day}>
                        {day}
                      </PickerText>
                    </PickerItem>
                  ))}
                </ScrollView>
              </PickerColumn>
              
              <PickerColumn>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 20 }}
                >
                  {years.map((year) => (
                    <PickerItem 
                      key={year}
                      isSelected={tempDate.year === year}
                      onPress={() => setTempDate({...tempDate, year})}
                    >
                      <PickerText isSelected={tempDate.year === year}>
                        {year}
                      </PickerText>
                    </PickerItem>
                  ))}
                </ScrollView>
              </PickerColumn>
            </PickerContainer>
            
            <ConfirmButton onPress={handleDateConfirm}>
              <ConfirmButtonText>Confirm</ConfirmButtonText>
            </ConfirmButton>
          </PickerSection>
        </Container>
      </SafeArea>
    );
  }

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
        
        <DateInputSection>
          <DateInput onPress={handleDateSelect} hasValue={selectedDate !== null}>
            <DateText hasValue={selectedDate !== null}>
              {formatDisplayDate()}
            </DateText>
            <AntDesign 
              name="down" 
              size={16} 
              color={selectedDate ? "#FFFFFF" : "#616262"} 
            />
          </DateInput>
        </DateInputSection>

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
  line-height: 22px;
`;

const DateInputSection = styled.View`
  margin-top: 50px;
`;

const DateInput = styled.TouchableOpacity`
  height: 56px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.hasValue ? '#02F59B' : '#2A2B2D'};
  background-color: ${props => props.hasValue ? '#1A1B1D' : '#353637'};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
`;

const DateText = styled.Text`
  color: ${props => props.hasValue ? '#FFFFFF' : '#616262'};
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
`;

const Spacer = styled.View`
  flex: 1;
  min-height: 40px;
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
  height: 34px;
`;

// Picker Section (화면 하단에 직접 표시)
const PickerSection = styled.View`
  flex: 1;
  background-color: #2A2B2D;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  margin-top: 20px;
  padding: 20px;
`;

const PickerHandle = styled.View`
  width: 40px;
  height: 4px;
  background-color: #616262;
  border-radius: 2px;
  align-self: center;
  margin-bottom: 20px;
`;

const PickerContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PickerColumn = styled.View`
  flex: 1;
  margin: 0px 10px;
`;

const PickerItem = styled.TouchableOpacity`
  padding: 12px 8px;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const PickerText = styled.Text`
  color: ${props => props.isSelected ? '#FFFFFF' : '#616262'};
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
  font-weight: ${props => props.isSelected ? '600' : '400'};
`;

const ConfirmButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
`;

const ConfirmButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 16px;
  font-weight: 600;
  font-family: 'PlusJakartaSans-SemiBold';
`;