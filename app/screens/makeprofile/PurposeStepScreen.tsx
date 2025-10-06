import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5, AntDesign, Feather } from '@expo/vector-icons';
import { useProfile } from '../../contexts/ProfileContext';

export default function PurposeStepScreen({ navigation }) {
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const router = useRouter();
  const { profileData, updateProfile } = useProfile();

  // Journey purposes with vector icons and age ranges
  const purposes = [
    {
      id: 1,
      iconFamily: 'MaterialIcons',
      iconName: 'school',
      title: 'Study',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Educational exchange',
    },
    {
      id: 2,
      iconFamily: 'MaterialIcons',
      iconName: 'work',
      title: 'Work',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Professional opportunities',
    },
    {
      id: 3,
      iconFamily: 'AntDesign',
      iconName: 'heart',
      title: 'Marriage',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Finding life partner',
    },
    {
      id: 4,
      iconFamily: 'FontAwesome5',
      iconName: 'plane',
      title: 'Travel',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Exploring Korea',
    },
    {
      id: 5,
      iconFamily: 'MaterialIcons',
      iconName: 'business',
      title: 'Business',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Business ventures',
    },
    {
      id: 6,
      iconFamily: 'MaterialIcons',
      iconName: 'family-restroom',
      title: 'Family',
      ageRange: 'D-2, D-4, D-2-5',
      description: 'Family reunion',
    },
  ];

  const canProceed = selectedPurpose !== null;

  const handlePurposeSelect = (purpose) => {
    setSelectedPurpose(purpose);
  };

  const handleNext = () => {
    if (canProceed) {
      updateProfile('purpose', selectedPurpose.title);
      router.push('./TagStepScreen');
    }
  };

  const renderIcon = (iconFamily, iconName) => {
    const iconProps = {
      name: iconName,
      size: 24,
      color: '#FFFFFF',
    };

    switch (iconFamily) {
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} />;
      case 'AntDesign':
        return <AntDesign {...iconProps} />;
      case 'Feather':
        return <Feather {...iconProps} />;
      default:
        return <MaterialIcons {...iconProps} />;
    }
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
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
                  <AntDesign name="infocirlceo" size={16} color="#949899" />
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

const PurposeCard = styled.TouchableOpacity`
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
