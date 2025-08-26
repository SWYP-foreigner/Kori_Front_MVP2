import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert ,ScrollView} from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import {useProfile} from '../../contexts/ProfileContext'
import axios from "axios";
import { Platform } from 'react-native';

const HobbyBox = ({ imogi = [], title, tags, selectedTags, selectTag }) => {
  return (
    <>
      <TagTitle>
        <TagTitleText>{title}</TagTitleText>
        {title === 'Entertainment & Hobbies' && (
          <SelectedText selected={selectedTags.length > 0}>
            {selectedTags.length}/5 selected
          </SelectedText>
        )}
      </TagTitle>

      <HobbyTagWrapper>
        {tags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          const emoji = imogi[index] ?? ''; // 안전하게 꺼내기

          return (
            <HobbyTag
              key={tag}
              onPress={() => selectTag(tag)}
              selected={isSelected}
            >
              {emoji !== '' && <Imogi>{emoji}</Imogi>}
              <HobbyTagText selected={isSelected}>{tag}</HobbyTagText>
              {isSelected && (
                <AntDesign name="close" size={14} color="#02F59B" />
              )}
            </HobbyTag>
          );
        })}
      </HobbyTagWrapper>
    </>
  );
};

export default function TagStepScreen() {
  const router = useRouter();
  const maxSelections = 5;
  const [selectedTags, setSelectedTags] = useState([]);
  const { profileData, updateProfile } = useProfile();

  const selectTag = (tag) => {
    if (selectedTags.includes(tag)) {
      // 이미 선택되어 있으면 제거
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      // 최대 선택 개수 제한
      if (selectedTags.length >= maxSelections) {
        Alert.alert(`You can only \nchoose up to ${maxSelections} tags !`);
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };
  const handleNext=()=>{
    router.push('./AddPhotoStepScreen');
  };
  const handleDone=async()=>{
    try {
    const formData = new FormData();

    // 1. 텍스트 데이터(JSON으로 묶어서 보내기)
    const { photo, ...textData } = profileData;
    formData.append('data', JSON.stringify(textData));

    // 2. 파일 데이터
    if (photo && photo.uri) {
      formData.append('photo', {
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        name: photo.name || 'profile.jpg',
        type: photo.typeMime || 'image/jpeg',
      });
    }
    console.log("formData",formData);
    // 3. Axios POST
    // const response = await axios.post(
    //   'http://YOUR_SERVER_IP:8080/api/profile', // 서버 API
    //   formData,
    //   {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   }
    // );

    // console.log('서버 응답:', response.data);
  } catch (error) {
    console.error('전송 실패:', error);
  }
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <ScrollableContainer>
        <HeaderSection>
          <StepText>Step 8 / 9</StepText>

          <TitleWrapper>
            <Title>Tell us about</Title>
            <Title>your interest</Title>
          </TitleWrapper>
          <Subtitle>You can choose up to {maxSelections} interests.</Subtitle>
        </HeaderSection>

          <TagContainer>
            <HobbyBox
              imogi={["🎵","🎬","📚","🎬","🎮"]}
              title="Entertainment & Hobbies"
              tags={['Music','Movies','Reading','Anime','Gaming']}
              selectedTags={selectedTags}
              selectTag={selectTag}
            />
            <HobbyBox
              imogi={["🍺","☕️","✈️","🧩","🛍️","💄️","🛏️"]}
              title="LifeStyle & Social"
              tags={['Drinking','Exploring Cafes','Traveling','Board Games','Shopping','Beauty','Doing Nothing']}
              selectedTags={selectedTags}
              selectTag={selectTag}
            />
            <HobbyBox
              imogi={["🧘","🏃","🏋️","🥾","💃","⛰️"]}
              title="Activities & Wellness"
              tags={['Yoga','Running','Fitness','Camping','Dancing','Hiking']}
              selectedTags={selectedTags}
              selectTag={selectTag}
            />
            <HobbyBox
              imogi={["🎨","🎤","🍳","🐶","💼","📸"]}
              title="Creativity & Personal Growth"
              tags={['Exhibition','Singing','Cooking','Pets','Career','Photography']}
              selectedTags={selectedTags}
              selectTag={selectTag}
            />
            <HobbyBox
              imogi={["💖","💖","🍚"]}
              title="Korean Culture"
              tags={['K-Pop Lover','K-Drama Lover','K-Food Lover']}
              selectedTags={selectedTags}
              selectTag={selectTag}
            />
          </TagContainer>
        </ScrollableContainer>

        <ButtonSection>
          <NextButton
            onPress={handleNext}
            disabled={selectedTags.length === 0}
          >
            <ButtonText>Next</ButtonText>
          </NextButton>
        </ButtonSection>
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
  padding: 0px 20px;
`;

const HeaderSection = styled.View``;

const ScrollableContainer = styled.ScrollView.attrs(() => ({
  showsVerticalScrollIndicator: false, 
}))`
  flex: 1;
`;

const ButtonSection = styled.View`
  padding-bottom: 8px;
`;

const StepText = styled.Text`
  color: #5BD08D;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans-Regular';
  margin-top:40px;
`;

const TitleWrapper = styled.View`
  margin-top: 30px;
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

const TagContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  margin-top:30px;
`;

const TagTitle = styled.View`
  margin-top:10px;
  margin-bottom: 8px;
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const TagTitleText = styled.Text`
  color: #848687;
  padding-right: 20px;
  font-size: 14px;
  font-weight: 600;
  font-family:  PlusJakartaSans_600SemiBold
`;
const SelectedText=styled.Text`
  color:${props => (props.selected ? '#02F59B' : '#848687')};
`;
const HobbyTagWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;


const HobbyTag = styled.TouchableOpacity`
  margin: 5px 10px 5px 0px;
  padding: 5px 10px;
  height: 35px;
  border-radius: 30px;
  justify-content: center;
  border-color: ${props => (props.selected ? '#02F59B' : '#848687')};
  border-width: 1px;
  flex-direction: row;
  align-items: center;
`;
const Imogi = styled.Text`

`;
const HobbyTagText = styled.Text`
  color: ${props => (props.selected ? '#02F59B' : '#ffffff')};
  font-size: 13px;
  margin:0px 7px;
  font-family: PlusJakartaSans-Regular;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
  margin-bottom: 8px;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;