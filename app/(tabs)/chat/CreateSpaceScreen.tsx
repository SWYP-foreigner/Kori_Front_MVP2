import Icon from '@/components/common/Icon';
import CustomButton from '@/components/CustomButton';
import { theme } from '@/src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Image as RNImage,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';

const MOCK_ME = {
  name: 'Alice Kori, Kim',
  email: 'Kori@gmail.com',
  avatarUrl: undefined as string | undefined,
};

const AVATARS: ImageSourcePropType[] = [
  require('@/assets/images/character1.png'),
  require('@/assets/images/character2.png'),
  require('@/assets/images/character3.png'),
];

const CreateSpaceScreen = () => {
  const [text, onChangeText] = useState('');
  const [explainText, onChangeExplainText] = useState('');
  const router = useRouter();

  // 상태 분리
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number>(0); // AVATARS 선택
  const [customPhotoUri, setCustomPhotoUri] = useState<string | undefined>(undefined); // 카메라/갤러리
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(MOCK_ME.avatarUrl);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);

  const openAvatarSheet = () => {
    if (avatarUrl) {
      const cur = AVATARS.findIndex((img) => (RNImage.resolveAssetSource(img)?.uri ?? '') === avatarUrl);
      if (cur >= 0) {
        setSelectedAvatarIdx(cur);
        setCustomPhotoUri(undefined);
      } else {
        setSelectedAvatarIdx(-1);
        setCustomPhotoUri(avatarUrl);
      }
    } else {
      setSelectedAvatarIdx(0);
      setCustomPhotoUri(undefined);
    }
    setShowAvatarSheet(true);
  };

  const saveAvatar = async () => {
    if (customPhotoUri) {
      setAvatarUrl(customPhotoUri);
    } else if (selectedAvatarIdx >= 0) {
      const asset = Asset.fromModule(AVATARS[selectedAvatarIdx]);
      await asset.downloadAsync();
      if (asset.localUri) setAvatarUrl(asset.localUri);
    }
    setShowAvatarSheet(false);
  };

  const requestPermissions = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = cam.status === 'granted' && lib.status === 'granted';
    if (!granted) {
      Alert.alert(
        'Permission required',
        'Camera and photo library access is needed.\n\nYour photo will be used in Linked Space chatting room profile.',
      );
    }
    return granted;
  };

  const openCamera = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setCustomPhotoUri(result.assets[0].uri);
      setSelectedAvatarIdx(-1);
    }
  };

  const openGallery = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setCustomPhotoUri(result.assets[0].uri);
      setSelectedAvatarIdx(-1);
    }
  };

  const pickFromCameraOrGallery = () => {
    Alert.alert(
      'Pick photo',
      'How to pick your profile photo?\n\nYour photo will be used in Linked Space hatting room profile.',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleSave = () => {
    router.push({
      pathname: '/screens/chatscreen/NewSpaceCreated',
      params: {
        spaceName: text,
        spaceDescription: explainText,
        spaceImageUrl: avatarUrl,
        index: selectedAvatarIdx.toString(),
      },
    });
  };

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <HeaderContainer>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon type='previous' size={24} color={theme.colors.primary.white}/>
          </TouchableOpacity>
          <HeaderTitleText>Create Space</HeaderTitleText>
          <TouchableOpacity onPress={handleSave}>
            <SaveText>Save</SaveText>
          </TouchableOpacity>
        </HeaderContainer>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // 네비게이션 헤더 있으면 조정
        >
          <ProfileContainer>
            <ProfileBox onPress={openAvatarSheet}>
              <ProfileImage source={avatarUrl ? { uri: avatarUrl } : AVATARS[0]} />
              <CameraContainer>
                <Icon type='cameraColored' size={20} color={theme.colors.primary.black}/>
              </CameraContainer>
            </ProfileBox>
          </ProfileContainer>

          <SpaceNameContainer>
            <SpaceNameText>Space Name</SpaceNameText>
            <SpaceNamelengthText>{text.length}/20</SpaceNamelengthText>
          </SpaceNameContainer>

          <EnterSpaceNameContainer
            value={text}
            onChangeText={onChangeText}
            maxLength={20}
            placeholder="Enter Space name"
            placeholderTextColor="#848687"
          />

          <SpaceDecContainer>
            <SpaceDecText>Space Description</SpaceDecText>
          </SpaceDecContainer>

          <EnterDecContainer>
            <EnterDecInput
              value={explainText}
              onChangeText={onChangeExplainText}
              placeholder="Describe space here"
              placeholderTextColor="#848687"
              returnKeyType="done"
              multiline
              submitBehavior="blurAndSubmit"
              textAlignVertical="top"
              maxLength={200}
            />
            <LimitWrapper>
              <LimitCount>{explainText.length}/200 limit</LimitCount>
            </LimitWrapper>
          </EnterDecContainer>
        </KeyboardAvoidingView>

        {/* Avatar Modal */}
        <Modal
          visible={showAvatarSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAvatarSheet(false)}
        >
          <SheetOverlay onPress={() => setShowAvatarSheet(false)} activeOpacity={1}>
            <Sheet onStartShouldSetResponder={() => true}>
              <Handle />
              <SheetTitle>Select Space Image</SheetTitle>

              <AvatarRow>
                {/* AVATARS 선택 */}
                {AVATARS.map((img, idx) => {
                  const selected = idx === selectedAvatarIdx && !customPhotoUri; // 🔹 customPhotoUri 있으면 선택 해제
                  return (
                    <AvatarItem
                      key={idx}
                      onPress={() => {
                        setSelectedAvatarIdx(idx);
                        setCustomPhotoUri(undefined);
                      }}
                    >
                      <AvatarCircle selected={selected}>
                        <AvatarImg source={img} />
                        {selected && (
                          <CheckBadge>
                            <Icon type="check" size={16} color={theme.colors.primary.black} />
                          </CheckBadge>
                        )}
                      </AvatarCircle>
                    </AvatarItem>
                  );
                })}

                {/* 카메라/갤러리 선택 */}
                <AvatarItem onPress={pickFromCameraOrGallery}>
                  <AvatarCircle selected={!!customPhotoUri}>
                    {customPhotoUri ? (
                      <AvatarImg source={{ uri: customPhotoUri }} />
                    ) : (
                      <CameraCircleInner>
                        <Ionicons name="camera" size={22} color="#cfd4da" />
                      </CameraCircleInner>
                    )}
                    {!!customPhotoUri && (
                      <CheckBadge>
                        <Ionicons name="checkmark" size={14} color="#0f1011" />
                      </CheckBadge>
                    )}
                  </AvatarCircle>
                </AvatarItem>
              </AvatarRow>

              <ButtonRow>
                <CustomButton label="Cancel" filled={false} onPress={() => setShowAvatarSheet(false)} />
                <Gap />
                <CustomButton label="Save" tone="mint" filled onPress={saveAvatar} />
              </ButtonRow>
            </Sheet>
          </SheetOverlay>
        </Modal>
      </Container>
    </SafeArea>
  );
};

export default CreateSpaceScreen;

const SafeArea = styled.SafeAreaView`
  flex: 1;
`;
const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;
const HeaderContainer = styled.View`
  flex-direction: row;
  height: 70px;
  align-items: center;
  justify-content: space-between;
`;
const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;
const SaveText = styled.Text`
  color: #02f59b;
  font-family: PlusJakartaSans_500Medium;
  font-size: 15px;
`;
const ProfileContainer = styled.View`
  height: 30%;
  align-items: center;
  justify-content: center;
`;
const ProfileBox = styled.Pressable`
  width: 150px;
  height: 150px;
`;
const CameraContainer = styled.View`
  position: absolute;
  bottom: 20px;
  right: 5px;
  width: 32px;
  height: 32px;
  border-radius: 30px;
  background-color: #02f59b;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 75px; /* 반지름을 width/2 값으로 */
  resize-mode: contain; /* 사진을 꽉 채우게 */
`;
const SpaceNameContainer = styled.View`
  height: 40px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;
const SpaceNameText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
`;
const SpaceNamelengthText = styled.Text`
  color: #cccfd0;
  font-family: PlusJakartaSans_400Regular;
  font-size: 13px;
`;
const EnterSpaceNameContainer = styled.TextInput`
  background-color: #353637;
  height: 50px;
  padding-left: 10px;
  border-radius: 4px;
  color: #ededed;
`;
const SpaceDecContainer = styled.View`
  height: 40px;
  justify-content: center;
`;
const SpaceDecText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
  margin-top: 10px;
`;

const EnterDecContainer = styled.View`
  background-color: #353637;
  height: 200px;
  border-radius: 4px;
  color: #ededed;
  padding-left: 10px;
  position: relative;
  margin-top: 3px;
`;
const EnterDecInput = styled.TextInput`
  flex: 1;
  color: #ededed;
  font-size: 16px;
  line-height: 24px;
  font-family: PlusJakartaSans_400Regular;
  text-align-vertical: top;
`;

const LimitWrapper = styled.View`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const LimitCount = styled.Text`
  color: #848687;
  font-size: 12px;
  font-family: PlusJakartaSans_500Medium;
`;

const SheetOverlay = styled.TouchableOpacity`
  flex: 1;
  background: rgba(0, 0, 0, 0.55);
  justify-content: flex-end;
`;

const Sheet = styled.View`
  background: #353637;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  padding: 16px 16px 20px 16px;
`;

const Handle = styled.View`
  align-self: center;
  width: 54px;
  height: 4px;
  border-radius: 2px;
  background: #9aa0a6;
  margin-bottom: 10px;
`;

const SheetTitle = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
  text-align: center;
  margin-bottom: 16px;
`;

const AvatarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 18px;
`;

const AvatarItem = styled.Pressable``;

const AvatarCircle = styled.View<{ selected: boolean }>`
  width: 68px;
  height: 68px;
  border-radius: 34px;
  background: #1f2021;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${({ selected }) => (selected ? '#30F59B' : 'transparent')};
  position: relative;
`;

const AvatarImg = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 32px;
`;

const CheckBadge = styled.View`
  position: absolute;
  right: -2px;
  top: -2px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: #353637;
`;

const CameraCircleInner = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  align-items: center;
  justify-content: center;
  background: #1f2021;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  padding-bottom: 28px;
`;

const Gap = styled.View`
  width: 12px;
`;
