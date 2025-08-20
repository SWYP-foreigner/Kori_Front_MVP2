import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Tag from '@/components/Tag';


const HobbyBox = ({ title, tags }) => {
  return (
    <>
      <TagTitle>
        <TagTitleText>{title}</TagTitleText>
      </TagTitle>
      <TagWrapper>
        {tags.map((tag, index) => (
          <HobbyTag key={index}>
            <Imogi/>
            <HobbyTagText>{tag}</HobbyTagText>
          </HobbyTag>
        ))}
      </TagWrapper>
    </>
  );
};


export default function TagStepScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const maxSelections = 5;

  

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <StepText>Step 9 / 9</StepText>

          <TitleWrapper>
            <Title>Tell us about</Title>
            <Title>your interest</Title>
          </TitleWrapper>
          <Subtitle>You can choose up to 5 interests.</Subtitle>
          <TagContainer>
            <HobbyBox 
            title="Entertainment & Hobbies"
            tags={['Music','Movies','Reading','Anime','Gaming']}
            />
            <HobbyBox 
            title="LifeStyle & Social"
            tags={['Drinking','Exploring Cafes','Traveling','Board Games',
              'Shopping','Beauty','Doing Nothing'
            ]}
            />
            <HobbyBox 
            title="Activities & Wellness"
            tags={['Yoga','Running','Fitness','Camping','Dancing','Hiking']}
            />
            <HobbyBox 
            title="Creativity & Personal Growth"
            tags={['Exhibition','Singing','Cooking','Pets'
              ,'Career','Photography'
            ]}
            />
            <HobbyBox 
            title="Korean Culture"
            tags={['K-Pop Lover','K-Drama Lover','K-Food Lover']}
            />
          </TagContainer>
          <Spacer />
          <NextButton
          // onPress={handleNext}
          //   disabled={!canProceed}
          //   canProceed={canProceed}
          >
            <ButtonText>Done</ButtonText>
          </NextButton>

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
const Container=styled.View`
  flex:1;
  padding: 0px 20px;
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
 const TagContainer=styled.View`
    flex:1;
 `;

 const TagTitle=styled.View` 
    margin-top:10px;
    width:100%;
    height:20px;
    background-color:red;
    justify-content:space-between;
    flex-direction:row;
    align-items:center;
    
 `;

 const TagTitleText=styled.Text`
    color:#848687;
    padding-right:20px;
 `;

 const SelectedText=styled.Text`
    color:#848687;
 `;
 
 const TagWrapper=styled.View`
    background-color:blue;
    width:100%;
    flex-direction:row;
    flex-wrap: wrap;
 `;

 const Imogi=styled.View`
  background-color:black;
  width:10px;
  height:10px;

 `;
const HobbyTag=styled.TouchableOpacity`
  margin:5px 5px 5px 5px;
  padding:5px 5px 5px 5px;
  background-color:yellow;
  height:30px;
  border-radius: 12px;
  justify-content:center;
  border-color:black;
  border-width:1px;
  flex-direction:row;
  align-items:center;
  
`;
const HobbyTagText=styled.Text`
   color:black;
   font-size:10px;
   margin-left:3px;
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
  opacity: ${(props) => (props.canProceed ? 1 : 1)};
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';

`;
