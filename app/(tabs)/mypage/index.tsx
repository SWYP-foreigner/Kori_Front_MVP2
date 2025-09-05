import CustomButton from '@/components/CustomButton';
import EditAvatar from '@/components/EditAvatar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Image as RNImage,
  ImageSourcePropType,
  Modal
} from 'react-native';
import styled from 'styled-components/native';

import { useDeleteAccount } from '@/hooks/mutations/useDeleteAccount';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import useMyProfile from '@/hooks/queries/useMyProfile';
import { uploadBundledAvatarAndGetKey, uploadImageAndGetKey } from '@/lib/mypage/uploadImage';

const AVATARS: ImageSourcePropType[] = [
  require('@/assets/images/character1.png'),
  require('@/assets/images/character2.png'),
  require('@/assets/images/character3.png'),
];

export default function MyPageScreen() {
  const { data: me, isLoading } = useMyProfile();
  const deleteAccountMut = useDeleteAccount();
  const updateProfile = useUpdateProfile();

  const fullName = useMemo(() => {
    if (isLoading) return 'Loading...';
    const name = [me?.firstname, me?.lastname].filter(Boolean).join(' ');
    return name || '—';
  }, [me, isLoading]);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(me?.imageUrl);

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [tempIdx, setTempIdx] = useState<number>(0);
  const [customPhotoUri, setCustomPhotoUri] = useState<string | undefined>(undefined);

  const confirmDelete = () => {
    Alert.alert(
      'Are you sure you want to leave the this app?',
      'After deleting it, you cannot restore it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTimeout(() => {
              deleteAccountMut.mutate(undefined, {
                onSuccess: async () => {
                  try { await SecureStore.deleteItemAsync('jwt'); } catch (e) { console.log('[DeleteAccount] token clear error', e); }
                  Alert.alert('Account deleted', 'Your account has been removed.', [
                    { text: 'OK', onPress: () => router.replace('/login') },
                  ]);
                },
                onError: (e: any) => {
                  const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to delete account. Please try again.';
                  Alert.alert('Error', msg);
                },
              });
            }, 0);
          },
        },
      ],
    );
  };

  const openAvatarSheet = () => {
    const cur = AVATARS.findIndex(
      img => (RNImage.resolveAssetSource(img)?.uri ?? '') === (avatarUrl ?? ''),
    );
    if (cur >= 0) {
      setTempIdx(cur);
      setCustomPhotoUri(undefined);
    } else if (avatarUrl) {
      setTempIdx(-1);
      setCustomPhotoUri(avatarUrl);
    } else {
      setTempIdx(0);
      setCustomPhotoUri(undefined);
    }
    setShowAvatarSheet(true);
  };

  const saveAvatar = async () => {
    try {
      let uriToShow: string | undefined;
      let imageKey: string | undefined;

      if (tempIdx === -1 && customPhotoUri) {
        imageKey = await uploadImageAndGetKey(customPhotoUri);
        uriToShow = customPhotoUri;
      } else {
        const chosen = AVATARS[tempIdx];
        imageKey = await uploadBundledAvatarAndGetKey(chosen as unknown as number);
        const src = RNImage.resolveAssetSource(chosen);
        uriToShow = src?.uri;
      }

      if (imageKey) {
        await updateProfile.mutateAsync({ imageKey });
      }

      if (uriToShow) setAvatarUrl(uriToShow);
      setShowAvatarSheet(false);
      Alert.alert('Saved', 'Profile image updated.');
    } catch (e: any) {
      console.log('[avatar:save] error', e?.response?.data || e);
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to update profile.');
    }
  };

  const requestPermissions = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = cam.status === 'granted' && lib.status === 'granted';
    if (!granted) Alert.alert('Permission required', 'Camera and photo library access is needed.');
    return granted;
  };

  const openCamera = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCustomPhotoUri(uri);
      setTempIdx(-1);
    }
  };

  const openGallery = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCustomPhotoUri(uri);
      setTempIdx(-1);
    }
  };

  const pickFromCameraOrGallery = () =>
    Alert.alert('Pick photo', 'How to pick your profile photo?', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <Safe>
      <Scroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Header>
          <Title>My page</Title>
          <IconImage source={require('@/assets/images/IsolationMode.png')} />
        </Header>

        <ProfileView>
          <AvatarPress onPress={openAvatarSheet}>
            <EditAvatar uri={avatarUrl || me?.imageUrl} />
          </AvatarPress>

          <Name numberOfLines={1} ellipsizeMode="tail">
            {fullName}
          </Name>

          <EditButtonWrap>
            <CustomButton
              label="Edit Profile"
              tone="mint"
              filled
              onPress={() => router.push('/mypage/edit')}
            />
          </EditButtonWrap>
        </ProfileView>

        <SectionTitleRow>
          <SectionTitleIcon />
          <SectionTitle>My Friends</SectionTitle>
        </SectionTitleRow>

        <RowLink onPress={() => router.push('/mypage/friends')}>
          <RowLeft>Friends List</RowLeft>
          <Chevron>›</Chevron>
        </RowLink>
        <RowSeparator />

        <RowHeader>Follow List</RowHeader>

        <CountCard>
          <CountItem onPress={() => router.push('/mypage/follows?tab=received')}>
            <CountLabel>Received</CountLabel>
            <CountNumber>{0}</CountNumber>
          </CountItem>
          <Divider />
          <CountItem onPress={() => router.push('/mypage/follows?tab=sent')}>
            <CountLabel>Sent</CountLabel>
            <CountNumber>{0}</CountNumber>
          </CountItem>
        </CountCard>

        <SectionTitleRow>
          <SectionTitleIconGlobe />
          <SectionTitle>Translate Setting</SectionTitle>
        </SectionTitleRow>

        <RowLink onPress={() => router.push('/mypage/translate')}>
          <RowLeft>Chat Translation Language</RowLeft>
          <Chevron>›</Chevron>
        </RowLink>
        <RowSeparator />

        <SectionTitleRow>
          <SectionTitleIconGlobe />
          <SectionTitle>My Account</SectionTitle>
        </SectionTitleRow>

        <RowLink onPress={() => { /* TODO: logout */ }}>
          <RowLeft>Account Logout</RowLeft>
          <Chevron>›</Chevron>
        </RowLink>
        <RowSeparator />

        <DeletePressable onPress={confirmDelete} disabled={deleteAccountMut.isPending}>
          <DeleteText>{deleteAccountMut.isPending ? 'Deleting...' : 'Delete Account'}</DeleteText>
        </DeletePressable>
      </Scroll>

      <Modal
        visible={showAvatarSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarSheet(false)}
      >
        <SheetOverlay onPress={() => setShowAvatarSheet(false)} activeOpacity={1}>
          <Sheet onStartShouldSetResponder={() => true}>
            <Handle />
            <SheetTitle>Select Profile</SheetTitle>

            <AvatarRow>
              {AVATARS.map((img, idx) => {
                const selected = idx === tempIdx;
                return (
                  <AvatarItem
                    key={idx}
                    onPress={() => {
                      setTempIdx(idx);
                      setCustomPhotoUri(undefined);
                    }}
                  >
                    <AvatarCircle selected={selected}>
                      <AvatarImg source={img} />
                      {selected && (
                        <CheckBadge>
                          <Ionicons name="checkmark" size={14} color="#0f1011" />
                        </CheckBadge>
                      )}
                    </AvatarCircle>
                  </AvatarItem>
                );
              })}

              <AvatarItem onPress={pickFromCameraOrGallery}>
                <AvatarCircle selected={tempIdx === -1 && !!customPhotoUri}>
                  {customPhotoUri ? (
                    <AvatarImg source={{ uri: customPhotoUri }} />
                  ) : (
                    <CameraCircleInner>
                      <Ionicons name="camera" size={22} color="#cfd4da" />
                    </CameraCircleInner>
                  )}
                  {tempIdx === -1 && !!customPhotoUri && (
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
    </Safe>
  );
}

const Safe = styled.SafeAreaView`flex: 1; background: #1D1E1F;`;
const Scroll = styled.ScrollView``;

const Header = styled.View`padding: 12px 16px 8px 16px; flex-direction: row; align-items: center;`;
const Title = styled.Text`font-family: 'InstrumentSerif_400Regular'; font-size: 32px; color: #ffffff; margin-right: 8px;`;
const IconImage = styled.Image`width: 22px; height: 22px; resize-mode: contain; transform: translateY(-3px);`;

const ProfileView = styled.View`align-items: center; padding: 8px 16px 12px 16px;`;
const AvatarPress = styled.Pressable`position: relative;`;
const Name = styled.Text`margin-top: 10px; color: #ffffff; font-size: 18px; line-height: 22px; font-family: 'PlusJakartaSans_700Bold'; max-width: 80%; text-align: center;`;
const EditButtonWrap = styled.View`align-self: stretch; padding: 12px 16px 0 16px;`;

const SectionTitle = styled.Text`color: #9aa0a6; font-size: 14px; line-height: 18px; letter-spacing: 0.2px; font-family: 'PlusJakartaSans_600SemiBold';`;
const SectionTitleRow = styled.View`flex-direction: row; align-items: center; margin: 22px 16px 10px 16px;`;

function SectionTitleIcon() { return <Ionicons name="person-outline" size={12} color="#9aa0a6" style={{ marginRight: 6, transform: [{ translateY: 1 }] }} />; }
function SectionTitleIconGlobe() {
  return <Image source={require('@/assets/icons/global.png')} resizeMode="contain" style={{ width: 12, height: 12, marginRight: 6, tintColor: '#9aa0a6', transform: [{ translateY: 1 }] }} />;
}

const RowLink = styled.Pressable`padding: 14px 16px; flex-direction: row; justify-content: space-between; align-items: center;`;
const RowLeft = styled.Text`color: #e9ecef; font-size: 15px; font-family: 'PlusJakartaSans_400Regular';`;
const Chevron = styled.Text`color: #b8bdc2; font-size: 18px; margin-left: 8px;`;

const RowHeader = styled.Text`margin: 20px 16px 8px 16px; color: #e9ecef; font-size: 15px; font-family: 'PlusJakartaSans_400Regular';`;
const RowSeparator = styled.View`height: 1px; margin: 4px 16px 18px 16px; background: #2a2b2c; opacity: 0.6;`;

const CountCard = styled.View`margin: 10px 16px 12px 16px; background: #2a2f33; border-radius: 14px; padding: 10px; flex-direction: row; align-items: stretch;`;
const Divider = styled.View`width: 1px; background: #454a4f; margin: 6px 4px;`;
const CountItem = styled.Pressable`flex: 1; padding: 6px 8px; align-items: center; justify-content: center;`;
const CountLabel = styled.Text`color: #c7cbcf; font-size: 15px; font-family: 'PlusJakartaSans_400Regular';`;
const CountNumber = styled.Text`margin-top: 2px; color: #ffffff; font-size: 16px; font-family: 'PlusJakartaSans_700Bold';`;

const DeletePressable = styled.Pressable<{ disabled?: boolean }>`padding: 16px; margin-top: 8px; opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};`;
const DeleteText = styled.Text`color: #ff5a5a; font-size: 14px; font-family: 'PlusJakartaSans_600SemiBold';`;

const SheetOverlay = styled.TouchableOpacity`flex: 1; background: rgba(0, 0, 0, 0.55); justify-content: flex-end;`;
const Sheet = styled.View`background: #353637; border-top-left-radius: 22px; border-top-right-radius: 22px; padding: 16px 16px 20px 16px;`;
const Handle = styled.View`align-self: center; width: 54px; height: 4px; border-radius: 2px; background: #9aa0a6; margin-bottom: 10px;`;
const SheetTitle = styled.Text`color: #ffffff; font-size: 18px; font-family: 'PlusJakartaSans_700Bold'; text-align: center; margin-bottom: 16px;`;

const AvatarRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between; padding: 0 8px; margin-bottom: 18px;`;
const AvatarItem = styled.Pressable``;
const AvatarCircle = styled.View<{ selected: boolean }>`width: 68px; height: 68px; border-radius: 34px; background: #1f2021; align-items: center; justify-content: center; border-width: 2px; border-color: ${({ selected }) => (selected ? '#30F59B' : 'transparent')}; position: relative;`;
const AvatarImg = styled.Image`width: 64px; height: 64px; border-radius: 32px;`;
const CheckBadge = styled.View`position: absolute; right: -2px; top: -2px; width: 20px; height: 20px; border-radius: 10px; background: #30F59B; align-items: center; justify-content: center; border-width: 2px; border-color: #353637;`;

const CameraCircleInner = styled.View`width: 64px; height: 64px; border-radius: 32px; align-items: center; justify-content: center; background: #1f2021;`;

const ButtonRow = styled.View`flex-direction: row; align-items: center; margin-top: 10px; padding-bottom: 28px;`;
const Gap = styled.View`width: 12px;`;
