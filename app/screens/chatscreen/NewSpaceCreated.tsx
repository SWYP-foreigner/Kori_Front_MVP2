import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useLocalSearchParams } from 'expo-router';
import api from '@/api/axiosInstance';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

const NewSpaceCreated = () => {
  const { spaceName, spaceDescription, spaceImageUrl } = useLocalSearchParams<{
    spaceName: string;
    spaceDescription: string;
    spaceImageUrl: string;
  }>();
  const { index } = useLocalSearchParams<{ index: string }>();
  const [Loading, setLoading] = useState(false);
  const router = useRouter();
  console.log('spaceName', spaceName);
  console.log('spaceDescription', spaceDescription);
  console.log('spaceIamgeUrl', spaceImageUrl);
  console.log('index', index);

  const doneCreateSpace = async () => {
    setLoading(true);
    const isIcon = Number(index);
    if (isIcon === -1) {
      const uploadSessionId = Crypto.randomUUID();
      const requestBody = {
        imageType: 'POST',
        uploadSessionId: uploadSessionId,
        files: [
          {
            filename: 'SpacePhoto.jpg',
            contentType: 'image/jpeg',
          },
        ],
      };
      // presigned url 발급 받음
      try {
        const res = await api.post('/api/v1/images/presign', requestBody);
        const presignedInfo = res.data.data[0]; // 첫 번째 파일 정보

        // ncp에 이미지 전송
        await SendImage(presignedInfo, spaceImageUrl);
        // 프로필 등록 완료
        await CompleteCreateNewSpace(presignedInfo.key);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Try Again',
        });
      }
    } else {
      // 기본 아이콘 선택시
      let url;
      if (isIcon === 0) {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_01.png';
      } else if (isIcon === 1) {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_02.png';
      } else {
        url = 'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_03.png';
      }
      await CompleteCreateNewSpace(url);
    }
    setLoading(false);
  };

  const SendImage = async (presignedInfo, spaceImageUrl) => {
    try {
      // 1️⃣ Base64 인코딩된 파일 읽기
      const fileData = await FileSystem.readAsStringAsync(spaceImageUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2️⃣ Base64 → Buffer 변환
      const buffer = Buffer.from(fileData, 'base64');

      // 3️⃣ PUT 요청
      await axios.put(presignedInfo.putUrl, buffer, {
        headers: {
          ...presignedInfo.headers,
          'Content-Type': 'image/jpeg',
        },
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Upload Fail',
      });
    }
  };

  // CreateSpace 완전 등록
  const CompleteCreateNewSpace = async (imageKey: string) => {
    try {
      // imageKey 추가
      const payload = {
        roomName: spaceName,
        description: spaceDescription,
        roomImageUrl: imageKey,
      };

      // 서버로 전송
      const res = await api.post('/api/v1/chat/rooms/group', payload);
      router.replace('/(tabs)/chat');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Fail New Space Created',
      });
      throw err;
    }
  };

  return (
    <Background source={require('@/assets/images/background2.png')} resizeMode="cover">
      <ProfileBox>
        <ProfileImage source={{ uri: spaceImageUrl }} />
      </ProfileBox>
      <TextBox>
        <BigText>New Spaces Created</BigText>
        <SmallText>Bring people together and share your interests</SmallText>
      </TextBox>
      <NextButton onPress={doneCreateSpace}>
        {Loading ? <ActivityIndicator size="large" color="#000000" /> : <ButtonText>Done</ButtonText>}
      </NextButton>

      <BottomSpacer />
    </Background>
  );
};

export default NewSpaceCreated;

const Background = styled.ImageBackground`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  padding-top: 200px;
`;
const ProfileBox = styled.View`
  width: 160px;
  height: 160px;
  overflow: hidden;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: contain;
  border-radius: 100px;
`;

const TextBox = styled.View`
  margin-top: 80px;
  height: 100px;
  align-items: center;
  justify-content: center;
`;
const BigText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 24px;
`;
const SmallText = styled.Text`
  color: #949899;
  font-family: PlusJakartaSans_400Regular;
  font-size: 13px;
`;

const NextButton = styled.TouchableOpacity`
  width: 90%;
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02f59b;
  margin: 150px;
`;

const ButtonText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;
`;

const BottomSpacer = styled.View`
  height: 25px;
`;
