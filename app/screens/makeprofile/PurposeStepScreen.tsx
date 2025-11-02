import { useProfile } from '@/app/contexts/ProfileContext';
import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import SkipHeader from './components/SkipHeader';

export default function PurposeStepScreen({ navigation }) {
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const router = useRouter();
  const { profileData, updateProfile } = useProfile();

  type Purpose = {
    id: number;
    iconName: string; // 🔑 renderIcon에서 비교할 키
    title: string;
    ageRange: string;
    description: string;
  };

  // Journey purposes with vector icons and age ranges
  const purposes: Purpose[] = [
    {
      id: 1,
      iconName: 'edit',
      title: 'Study',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Educational exchange',
    },
    {
      id: 2,
      iconName: 'business',
      title: 'Work',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Professional opportunities',
    },
    {
      id: 3,
      iconName: 'heartNonSelected',
      title: 'Marriage',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Finding life partner',
    },
    {
      id: 4,
      iconName: 'send',
      title: 'Travel',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Exploring Korea',
    },
    {
      id: 5,
      iconName: 'purpose',
      title: 'Business',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Business ventures',
    },
    {
      id: 6,
      iconName: 'person',
      title: 'Family',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Family reunion',
    },
  ];

  const canProceed = selectedPurpose !== null;

  const handlePurposeSelect = (purpose) => {
    setSelectedPurpose(purpose);
  };

  const handleSkip = () => {
    updateProfile('purpose', '');
    router.push('./TagStepScreen');
  };

  const handleNext = () => {
    if (canProceed) {
      updateProfile('purpose', selectedPurpose.title);
      router.push('./TagStepScreen');
    }
  };

  const renderIcon = (iconFamily: string, iconName: string) => {
    const isSelected = selectedPurpose?.iconName === iconName;
    const color = isSelected ? theme.colors.primary.mint : theme.colors.primary.white;

    // theme.colors.primary.white 키가 없을 수 있으니 안전하게 #FFFFFF 권장
    return <Icon type={iconName} size={24} color={color} />;
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <SkipHeader onSkip={handleSkip} />
        <StepText>Step 7 / 9</StepText>

        <TitleWrapper>
          <Title>What brings you</Title>
          <Title>to Korea?</Title>
        </TitleWrapper>

        <Subtitle>find friends who get your journey</Subtitle>

        <PurposeGrid>
          {purposes.map((purpose) => (
            <PurposeCard
              key={purpose.id}
              isSelected={selectedPurpose?.id === purpose.id}
              onPress={() => handlePurposeSelect(purpose)}
            >
              <IconContainer>
                <PurposeIconContainer>{renderIcon(purpose.iconFamily, purpose.iconName)}</PurposeIconContainer>
                <InfoButton>
                  <Icon type="info" size={16} color={theme.colors.gray.gray_1} />
                </InfoButton>
              </IconContainer>

              <PurposeTitle>{purpose.title}</PurposeTitle>
              <AgeRange>{purpose.ageRange}</AgeRange>
            </PurposeCard>
          ))}
        </PurposeGrid>

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

const PurposeGrid = styled.View`
  margin-top: 40px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const PurposeCard = styled.TouchableOpacity<{ isSelected: boolean }>`
  width: 48%;
  height: 120px;
  background-color: ${(props) => (props.isSelected ? '#2A2B2D' : '#1A1B1D')};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: ${(props) => (props.isSelected ? '2px' : '1px')};
  border-color: ${(props) => (props.isSelected ? '#02F59B' : '#2A2B2D')};
  position: relative;
`;

const IconContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const PurposeIconContainer = styled.View`
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
`;

const InfoButton = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

const PurposeTitle = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: 'PlusJakartaSans-SemiBold';
  margin-bottom: 4px;
`;

const AgeRange = styled.Text`
  color: #949899;
  font-size: 12px;
  font-family: 'PlusJakartaSans-Regular';
  line-height: 16px;
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
