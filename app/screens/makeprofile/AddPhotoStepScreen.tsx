import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';

// ------------------------
// AddPhotoStepScreen
// ------------------------
export default function AddPhotoStepScreen({ navigation }) {
  const [selectedAvatar, setSelectedAvatar] = useState(-1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoSelection, setShowPhotoSelection] = useState(false);
  const canProceed = selectedAvatar !== -1 || selectedPhoto !== null;
  const router = useRouter();

  const avatarData = [
    { 
      image: require('../../../assets/images/character1.png'), // 초록색 캐릭터
      bgColor: '#2d5a3d' 
    },
    { 
      image: require('../../../assets/images/character2.png'), // 보라색 캐릭터 
      bgColor: '#4a4aff' 
    },
    { 
      image: require('../../../assets/images/character3.png'), // 파란색 캐릭터
      bgColor: '#2266aa' 
    }
  ];

  const handleAvatarSelect = (index) => {
    setSelectedAvatar(index);
    setSelectedPhoto(null);
    setShowPhotoSelection(false);
  };

  const handleCameraPress = () => {
    setShowPhotoSelection(true);
  };

  const handleSelectFromAlbum = () => {
    const options = {
      mediaType: 'photo',
      quality: 1.0, // 최고 품질
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedPhoto(response.assets[0].uri);
        setSelectedAvatar(-1);
        setShowPhotoSelection(false);
      }
    });
  };

  const handleCancel = () => {
    setShowPhotoSelection(false);
  };

  const handleNext = () => {
    console.log("버튼 눌림");
    router.push({
      pathname: './GenderStepScreen'
    });
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <StepText>Step 6 / 9</StepText>

        <TitleWrapper>
          <Title>Let's add</Title>
          <Title>your photo</Title>
        </TitleWrapper>

        <Subtitle>This is how it'll appear on your profile.</Subtitle>

        <AvatarGrid>
          {avatarData.map((avatar, index) => (
            <AvatarContainer 
              key={index} 
              onPress={() => handleAvatarSelect(index)}
            >
              <ImageContainer selected={selectedAvatar === index && !selectedPhoto}>
                <CharacterImage source={avatar.image} />
              </ImageContainer>
              {selectedAvatar === index && !selectedPhoto && (
                <CheckmarkContainer>
                  <Checkmark>✓</Checkmark>
                </CheckmarkContainer>
              )}
            </AvatarContainer>
          ))}
          
          <AvatarContainer onPress={handleCameraPress}>
            {selectedPhoto ? (
              <>
                <PhotoAvatar 
                  source={{ uri: selectedPhoto }} 
                  selected={!!selectedPhoto}
                />
                {selectedPhoto && (
                  <CheckmarkContainer>
                    <Checkmark>✓</Checkmark>
                  </CheckmarkContainer>
                )}
              </>
            ) : (
              <CameraAvatar>
                <CameraIcon>📷</CameraIcon>
              </CameraAvatar>
            )}
          </AvatarContainer>
        </AvatarGrid>

        <Spacer />

        {showPhotoSelection && (
          <PhotoSelectionContainer>
            <AlbumButton onPress={handleSelectFromAlbum}>
              <AlbumText>Select from the album</AlbumText>
            </AlbumButton>
            <CancelButton onPress={handleCancel}>
              <CancelText>Cancel</CancelText>
            </CancelButton>
          </PhotoSelectionContainer>
        )}

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
  margin-top: 40px;
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

const AvatarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 50px;
`;

const AvatarContainer = styled.TouchableOpacity`
  width: 48%;
  aspect-ratio: 1;
  margin-bottom: 20px;
  position: relative;
  justify-content: center;
  align-items: center;
`;

const Avatar = styled.View`
  flex: 1;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.bgColor};
  border: ${props => props.selected ? '3px solid #02F59B' : '3px solid transparent'};
`;

const ImageContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  border: ${props => props.selected ? '4px solid #02F59B' : '4px solid transparent'};
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const CharacterImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: contain;
`;

const CameraAvatar = styled.View`
  width: 95%;
  height: 95%;
  border-radius: 1000px;
  justify-content: center;
  align-items: center;
  background-color: #353637;
  border: 4px solid transparent;
`;

const CameraIcon = styled.Text`
  color: #949899;
  font-size: 30px;
`;

const PhotoAvatar = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: contain;
`;

const CheckmarkContainer = styled.View`
  position: absolute;
  top: 5%;
  right: 5%;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #02F59B;
  justify-content: center;
  align-items: center;
  border: 3px solid #0F0F10;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const Checkmark = styled.Text`
  color: #1D1E1F;
  font-size: 18px;
  font-weight: bold;
`;

const PhotoSelectionContainer = styled.View`
  margin-bottom: 20px;
`;

const AlbumButton = styled.TouchableOpacity`
  align-items: center;
  margin-bottom: 15px;
`;

const AlbumText = styled.Text`
  color: #5BD08D;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const CancelButton = styled.TouchableOpacity`
  align-items: center;
`;

const CancelText = styled.Text`
  color: #5BD08D;
  font-size: 15px;
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