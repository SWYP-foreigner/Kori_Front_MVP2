import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

// 비율 기반 사이즈
const scale = height / 812; // iPhone 11 Pro (812pt) 기준
const wp = (size) => Math.round((width / 375) * size);
const hp = (size) => Math.round((height / 812) * size);

export default function InterestSelectionScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const maxSelections = 5;

  const interestCategories = [
    { title: 'Entertainment & Hobbies', interests: ['Music', 'Movies', 'Reading', 'Anime', 'Gaming'] },
    { title: 'Lifestyle & Social', interests: ['Drinking', 'Exploring Cafes', 'Traveling', 'Board Games', 'Shopping', 'Beauty', 'Doing Nothing'] },
    { title: 'Activities & Wellness', interests: ['Yoga', 'Running', 'Fitness', 'Camping', 'Dancing', 'Hiking'] },
    { title: 'Creativity & Personal Growth', interests: ['Exhibition', 'Singing', 'Cooking', 'Pets', 'Career', 'Photography'] },
    { title: 'Korean Culture', interests: ['K-Pop Lover', 'K-Drama Lover', 'K-Food Lover'] },
  ];

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      if (selectedInterests.length < maxSelections) {
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        Alert.alert('Maximum Selection', `You can choose up to ${maxSelections} interests.`);
      }
    }
  };

  const handleDone = () => {
    if (selectedInterests.length > 0) {
      router.push({
        pathname: './NextStepScreen',
        params: { interests: JSON.stringify(selectedInterests) }
      });
    } else {
      Alert.alert('Selection Required', 'Please select at least one interest.');
    }
  };

  const renderInterestTag = (interest) => {
    const isSelected = selectedInterests.includes(interest);

    return (
      <InterestTag
        key={interest}
        isSelected={isSelected}
        onPress={() => handleInterestToggle(interest)}
        activeOpacity={0.7}
      >
        <InterestText isSelected={isSelected}>{interest}</InterestText>
        {isSelected && <SelectedIndicator>×</SelectedIndicator>}
      </InterestTag>
    );
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <Header>
          <StepText>Step 9 / 9</StepText>
          <TitleWrapper>
            <Title>Tell us about</Title>
            <Title>your interest</Title>
          </TitleWrapper>
          <Subtitle>You can choose up to {maxSelections} interests.</Subtitle>
          <CounterText>{selectedInterests.length}/{maxSelections} selected</CounterText>
        </Header>

        <InterestsWrapper>
          {interestCategories.map((category) => (
            <CategorySection key={category.title}>
              <CategoryTitle>{category.title}</CategoryTitle>
              <TagsContainer>
                {category.interests.map(renderInterestTag)}
              </TagsContainer>
            </CategorySection>
          ))}
        </InterestsWrapper>

        <DoneButton
          onPress={handleDone}
          hasSelection={selectedInterests.length > 0}
          activeOpacity={selectedInterests.length > 0 ? 0.8 : 1}
        >
          <DoneButtonText hasSelection={selectedInterests.length > 0}>
            Done
          </DoneButtonText>
        </DoneButton>
      </Container>
    </SafeArea>
  );
}

// ------------------------
// Styled Components
// ------------------------
const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: #0F0F10;
`;

const Container = styled.View`
  flex: 1;
  justify-content: space-between; /* 상단 - 중간 - 하단 자동 분배 */
  padding: ${hp(10)}px ${wp(15)}px;
`;

const Header = styled.View``;

const StepText = styled.Text`
  color: #5BD08D;
  font-size: ${hp(12)}px;
`;

const TitleWrapper = styled.View`
  margin-top: ${hp(10)}px;
`;

const Title = styled.Text`
  color: #FFFFFF;
  font-size: ${hp(26)}px;
  line-height: ${hp(28)}px;
`;

const Subtitle = styled.Text`
  margin-top: ${hp(5)}px;
  color: #949899;
  font-size: ${hp(12)}px;
`;

const CounterText = styled.Text`
  margin-top: ${hp(5)}px;
  color: #5BD08D;
  font-size: ${hp(12)}px;
  text-align: right;
`;

const InterestsWrapper = styled.View`
  flex: 1;
  margin-top: ${hp(10)}px;
`;

const CategorySection = styled.View`
  margin-bottom: ${hp(5)}px;
`;

const CategoryTitle = styled.Text`
  color: #949899;
  font-size: ${hp(11)}px;
  margin-bottom: ${hp(3)}px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${wp(4)}px;
`;

const InterestTag = styled.TouchableOpacity`
  background-color: ${props => props.isSelected ? '#02F59B20' : '#2A2B2D'};
  border: ${props => props.isSelected ? '1px solid #02F59B' : '1px solid #2A2B2D'};
  border-radius: ${hp(10)}px;
  padding: ${hp(4)}px ${wp(8)}px;
  flex-direction: row;
  align-items: center;
`;

const InterestText = styled.Text`
  color: ${props => props.isSelected ? '#02F59B' : '#FFFFFF'};
  font-size: ${hp(11)}px;
`;

const SelectedIndicator = styled.Text`
  color: #02F59B;
  font-size: ${hp(11)}px;
  font-weight: bold;
  margin-left: ${wp(2)}px;
  transform: rotate(45deg);
`;

const DoneButton = styled.TouchableOpacity`
  height: ${hp(44)}px;
  border-radius: ${hp(6)}px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.hasSelection ? '#02F59B' : '#2A2B2D'};
`;

const DoneButtonText = styled.Text`
  color: ${props => props.hasSelection ? '#1D1E1F' : '#616262'};
  font-size: ${hp(13)}px;
`;
