import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useProfile } from '../../contexts/ProfileContext';
import { Asset } from 'expo-asset';
import * as Crypto from 'expo-crypto';
import api from '@/api/axiosInstance';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import SkipHeader from './components/SkipHeader';

// ------------------------
// AddPhotoStepScreen
// ------------------------
export default function AddPhotoStepScreen({}) {
  const [Loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(-1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { profileData, updateProfile } = useProfile();
  const canProceed = selectedAvatar !== -1 || selectedPhoto !== null;
  const router = useRouter();

  const avatarData = [
    {
      image: require('../../../assets/images/character1.png'), // 초록색 캐릭터
      bgColor: '#2d5a3d',
    },
    {
      image: require('../../../assets/images/character2.png'), // 보라색 캐릭터
      bgColor: '#4a4aff',
    },
    {
      image: require('../../../assets/images/character3.png'), // 파란색 캐릭터
      bgColor: '#2266aa',
    },
  ];

  const handleAvatarSelect = async (index) => {
    console.log('index', index);
    setSelectedAvatar(index);
    setSelectedPhoto(null);

    // 로컬 이미지 URI 가져오기
    const asset = Asset.fromModule(avatarData[index].image);
    await asset.downloadAsync(); // 캐시된 로컬 파일 확보
    const uri = asset.localUri || asset.uri;

    updateProfile('photo', {
      type: 'avatar',
      uri,
      name: `avatar${index + 1}.png`,
      typeMime: 'image/png',
    });
  };

  // 권한 요청 함수
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera and gallery access are required.\n\nYour photo will be used in Friend Recommendations, Chatting, and Community features.',
      );
      return false;
    }
    return true;
  };

  // 카메라 버튼 클릭 시
  const PickProfilePhoto = async () => {
    const hasPermission = await requestPermissions(); // 권한
    if (!hasPermission) return;

    Alert.alert(
      'Pick a Photo',
      'How would you like to set your profile picture?\n\nYour photo will be used in Friend Recommendations, Chatting, and Community features.',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
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

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedPhoto(uri);
      setSelectedAvatar(-1); // 아바타 선택 해제

      // profileData.photo 업데이트
      updateProfile('photo', {
        type: 'custom',
        uri: uri,
        name: 'UserProfile.jpg',
        typeMime: 'image/jpeg',
      });
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
      const uri = result.assets[0].uri;
      setSelectedPhoto(uri);
      setSelectedAvatar(-1); // 아바타 선택 해제

      // profileData.photo 업데이트
      updateProfile('photo', {
        type: 'custom', // 사용자가 선택한 사진
        uri: uri,
        name: 'UserProfilePhoto.jpg',
        typeMime: 'image/jpeg',
      });
    }
  };

  // 프로필 등록
  const doneProfile = async () => {
    setLoading(true);
    if (selectedPhoto !== null) {
      const filename = profileData.photo.name;
      const uploadSessionId = Crypto.randomUUID();
      const contentType = profileData.photo.typeMime;

      const requestBody = {
        imageType: 'USER',
        uploadSessionId: uploadSessionId,
        files: [
          {
            filename: filename,
            contentType: contentType,
          },
        ],
      };

      // presigned url 발급 받음
      try {
        const res = await api.post('/api/v1/images/presign', requestBody);
        const presignedInfo = res.data.data[0]; // 첫 번째 파일 정보
        const photo = profileData.photo;

        // ncp에 이미지 전송
        await SendImage(presignedInfo, photo);
        // 프로필 등록 완료
        await CompleteProfile(presignedInfo.key);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('API 요청 실패:', err);
      }
    } else {
      // 기본 아이콘 선택시
      let url;
      if (selectedAvatar === 0) {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_01.png';
      } else if (selectedAvatar === 1) {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_02.png';
      } else {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_03.png';
      }
      await CompleteProfile(url);
      setLoading(false);
    }
  };

  const SendImage = async (presignedInfo, photo) => {
    try {
      // 1️⃣ Base64 인코딩된 파일 읽기
      const fileData = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2️⃣ Base64 → Buffer 변환
      const buffer = Buffer.from(fileData, 'base64');

      // 3️⃣ PUT 요청
      await axios.put(presignedInfo.putUrl, buffer, {
        headers: {
          ...presignedInfo.headers,
          'Content-Type': photo.typeMime,
        },
      });
    } catch (err) {
      console.error('❌ 업로드 실패:', err);
    }
  };

  // 프로필 완전 등록
  const CompleteProfile = async (imageKey: string) => {
    try {
      // photo 제외하고 나머지 데이터만 추출
      const { photo, ...profileWithoutPhoto } = profileData;

      // imageKey 추가
      const payload = {
        ...profileWithoutPhoto,
        imageKey,
      };

      // 서버로 전송
      const res = await api.patch('/api/v1/member/profile/setup', payload);
      console.log('프로필 업데이트 성공', res);
      router.dismissAll(); // 네비게이션 스택 다 비움
      router.replace('/screens/makeprofile/ProfileSetUpDoneScreen');
    } catch (err) {
      console.error('프로필 업데이트 실패', err);
      console.log('error', err);
      throw err;
    }
  };

  const handleSkip = () => {
    router.replace('./ProfileSetUpDoneScreen');
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <SkipHeader onSkip={handleSkip} />
        <StepText>Step 9 / 9</StepText>

        <TitleWrapper>
          <Title>Let's add</Title>
          <Title>your photo</Title>
        </TitleWrapper>

        <Subtitle>This is how it'll appear on your profile.</Subtitle>

        <AvatarGrid>
          {avatarData.map((avatar, index) => (
            <AvatarContainer key={index} onPress={() => handleAvatarSelect(index)}>
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
                <Fontisto name="camera" size={30} color="#b3b2ad" />
              </CameraAvatar>
            )}
          </AvatarContainer>
        </AvatarGrid>

        <Spacer />

        <NextButton onPress={doneProfile} disabled={!canProceed} canProceed={canProceed}>
          {Loading ? <ActivityIndicator size="large" color="#000000" /> : <ButtonText>Done</ButtonText>}
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
  background-color: ${(props) => props.bgColor};
  border: ${(props) => (props.selected ? '3px solid #02F59B' : '3px solid transparent')};
`;

const ImageContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
  border: ${(props) => (props.selected ? '4px solid #02F59B' : '4px solid transparent')};
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
  border: ${(props) => (props.selected ? '4px solid #02F59B' : '4px solid transparent')};
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
  background-color: #02f59b;
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
  color: #5bd08d;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const CancelButton = styled.TouchableOpacity`
  align-items: center;
`;

const CancelText = styled.Text`
  color: #5bd08d;
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
