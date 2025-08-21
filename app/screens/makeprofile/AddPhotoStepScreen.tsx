import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

// ------------------------
// AddPhotoStepScreen
// ------------------------
export default function AddPhotoStepScreen({ navigation }) {
  const [selectedAvatar, setSelectedAvatar] = useState(-1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhoto,setisPhoto]=useState(false);
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
   
  };

  // 권한 요청 함수
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert('권한 필요', '카메라와 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  // 카메라 버튼 클릭 시
  const PickProfilePhoto = async () => {
    const hasPermission = await requestPermissions(); // 권한 
    if (!hasPermission) return;

    Alert.alert(
      "Pick photo",
      "How to pick your profile photo?",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "cancel", style: "cancel" }
      ]
    );
  };

  // 카메라에서 사진 촬영
  const openCamera = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'Images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  // 5. 사진 선택 시 상태 업데이트
  if (!result.canceled) {
    setSelectedPhoto(result.assets[0].uri);
    setSelectedAvatar(-1); // 아바타 선택 해제
  }
};


  // 갤러리에서 사진 선택
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
      setSelectedAvatar(-1); // 아바타 선택 해제
    }
  };

 

  const handleNext = () => {
    router.push({
      pathname: './PurposeStepScreen'
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
                  <FontAwesome6 name="check" size={19} color="black" />
                </CheckmarkContainer>
              )}
            </AvatarContainer>
          ))}
          
          <AvatarContainer onPress={PickProfilePhoto}>
            {selectedPhoto ? (
              <>
                <PhotoContainer selected={!!selectedPhoto}>
                  <PhotoAvatar source={{ uri: selectedPhoto }} />
                </PhotoContainer>
                {selectedPhoto && (
                  <CheckmarkContainer>
                    <FontAwesome6 name="check" size={19} color="black" />
                  </CheckmarkContainer>
                )}
              </>
            ) : (
              <CameraAvatar>
                 <Fontisto name="camera" size={30} color='#b3b2ad' />
              </CameraAvatar>
            )}
          </AvatarContainer>
        </AvatarGrid>

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

const PhotoContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  border: ${props => props.selected ? '4px solid #02F59B' : '4px solid transparent'};
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const PhotoAvatar = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
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
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
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