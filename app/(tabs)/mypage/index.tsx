import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Image as RNImage,
  ImageSourcePropType
} from 'react-native';
import styled from 'styled-components/native';

import api from '@/api/axiosInstance';
import { useDeleteAccount } from '@/hooks/mutations/useDeleteAccount';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import useMyProfile from '@/hooks/queries/useMyProfile';
import { uploadLocalImageAndGetKey } from '@/lib/mypage/uploadImage';
import { Config } from '@/src/lib/config';
import { useFocusEffect } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';

const AVATARS: ImageSourcePropType[] = [
  require('@/assets/images/character1.png'),
  require('@/assets/images/character2.png'),
  require('@/assets/images/character3.png'),
];

const AVATAR_KEYS = [
  'avatars/character1.png',
  'avatars/character2.png',
  'avatars/character3.png',
];

const toUrl = (u?: string) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  const base =
    (Config as any).EXPO_PUBLIC_NCP_PUBLIC_BASE_URL ||
    (Config as any).NCP_PUBLIC_BASE_URL ||
    (Config as any).EXPO_PUBLIC_IMAGE_BASE_URL ||
    (Config as any).IMAGE_BASE_URL ||
    '';
  return base
    ? `${String(base).replace(/\/+$/, '')}/${String(u).replace(/^\/+/, '')}`
    : undefined;
};

export default function MyPageScreen() {
  const { data: me, isLoading } = useMyProfile();
  const deleteAccountMut = useDeleteAccount();
  const updateProfile = useUpdateProfile();

  const [pendingReceived, setPendingReceived] = useState<number>(0);
  const [pendingSent, setPendingSent] = useState<number>(0);
  const pendingFetchOnce = useRef(false);

  const extractCounts = (raw: any) => {
    const obj = raw?.data?.data ?? raw?.data ?? raw;

    const recv =
      obj?.received ??
      obj?.receivedCount ??
      obj?.followers ??
      obj?.incoming ??
      obj?.toMe ??
      obj?.requestReceived ??
      0;

    const sent =
      obj?.sent ??
      obj?.sentCount ??
      obj?.followings ??
      obj?.outgoing ??
      obj?.fromMe ??
      obj?.requestSent ??
      0;

    return {
      received: Number.isFinite(Number(recv)) ? Number(recv) : 0,
      sent: Number.isFinite(Number(sent)) ? Number(sent) : 0,
    };
  };

  const fetchPendingCounts = async () => {
    try {
      const res = await api.get('/api/v1/mypage/follows/pending/count');
      const { received, sent } = extractCounts(res);
      setPendingReceived(received);
      setPendingSent(sent);
      console.log('[pending/count] received:', received, 'sent:', sent);
    } catch (e: any) {
      console.log('[pending/count] error', e?.response?.data || e?.message || e);
      setPendingReceived(0);
      setPendingSent(0);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchPendingCounts();
      return undefined;
    }, [])
  );

  useEffect(() => {
    const refresh = () => fetchPendingCounts();

    const subs = [
      DeviceEventEmitter.addListener('FOLLOW_REQUEST_SENT', refresh),
      DeviceEventEmitter.addListener('FOLLOW_REQUEST_CANCELLED', refresh),
      DeviceEventEmitter.addListener('FOLLOW_REQUEST_ACCEPTED', refresh),
      DeviceEventEmitter.addListener('FOLLOW_REQUEST_DECLINED', refresh),
      DeviceEventEmitter.addListener('UNFOLLOW_ACCEPTED', refresh),
    ];

    return () => subs.forEach(s => s.remove());
  }, []);

  const fullName = useMemo(() => {
    if (isLoading) return 'Loading...';
    const name = [me?.firstname, me?.lastname].filter(Boolean).join(' ');
    return name || '—';
  }, [me, isLoading]);

  const initialKeyOrUrl = (me as any)?.imageUrl || (me as any)?.imageKey || undefined;
  const [avatarKeyOrUrl, setAvatarKeyOrUrl] = useState<string | undefined>(initialKeyOrUrl);
  useEffect(() => {
    setAvatarKeyOrUrl((me as any)?.imageUrl || (me as any)?.imageKey || undefined);
  }, [me?.imageUrl, (me as any)?.imageKey]);

  const displayAvatarUrl = toUrl(avatarKeyOrUrl);

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
                  try {
                    await SecureStore.deleteItemAsync('jwt');
                  } catch { }
                  Alert.alert('Account deleted', 'Your account has been removed.', [
                    { text: 'OK', onPress: () => router.replace('/login') },
                  ]);
                },
                onError: (e: any) => {
                  const msg =
                    e?.response?.data?.message ??
                    e?.message ??
                    'Failed to delete account. Please try again.';
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
    const currentAssetIdx = AVATARS.findIndex(
      img => (RNImage.resolveAssetSource(img)?.uri ?? '') === (displayAvatarUrl ?? ''),
    );
    if (currentAssetIdx >= 0) {
      setTempIdx(currentAssetIdx);
      setCustomPhotoUri(undefined);
    } else if (displayAvatarUrl) {
      setTempIdx(-1);
      setCustomPhotoUri(displayAvatarUrl);
    } else {
      setTempIdx(0);
      setCustomPhotoUri(undefined);
    }
    setShowAvatarSheet(true);
  };

  const saveAvatar = async () => {
    try {
      let imageKey: string | undefined;
      let uriToShow: string | undefined;

      if (tempIdx === -1 && customPhotoUri) {
        imageKey = await uploadLocalImageAndGetKey(customPhotoUri);
        uriToShow = customPhotoUri;
      } else if (tempIdx >= 0 && tempIdx < AVATAR_KEYS.length) {
        imageKey = AVATAR_KEYS[tempIdx];
        const src = RNImage.resolveAssetSource(AVATARS[tempIdx]);
        uriToShow = src?.uri;
      } else {
        throw new Error('Invalid avatar selection');
      }

      await updateProfile.mutateAsync({ imageKey });

      setAvatarKeyOrUrl(imageKey || uriToShow);
      setShowAvatarSheet(false);
      Alert.alert('Saved', 'Profile image updated.');
    } catch (e: any) {
      const raw = e?.detail || e?.response?.data || e?.message || e;
      const msg =
        typeof raw === 'string' ? raw : raw?.message || raw?.error || '이미지 업로드에 실패했습니다.';
      Alert.alert('Upload error', String(msg));
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setCustomPhotoUri(result.assets[0].uri);
      setTempIdx(-1);
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
      setTempIdx(-1);
    }
  };

  const pickFromCameraOrGallery = () =>
    Alert.alert('Pick photo', 'How to pick your profile photo?', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);

  // 로그아웃
  const AccountLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`${Config.SERVER_URL}/api/v1/member/logout`);
              await SecureStore.deleteItemAsync("jwt");
              await SecureStore.deleteItemAsync("refresh");
              router.replace("/login");
            } catch (error) {
              console.error("로그아웃 실패", error);
            }
          },
        },
      ]
    );
  };

  return (
    <Safe>
      <Scroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Header>
          <Title>My page</Title>
          <IconImage source={require('@/assets/images/IsolationMode.png')} />
        </Header>

        <ProfileView>
          <AvatarPress onPress={openAvatarSheet}>
            <Avatar uri={toUrl(avatarKeyOrUrl)} />
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
            <CountNumber>{pendingReceived}</CountNumber>
          </CountItem>
          <Divider />
          <CountItem onPress={() => router.push('/mypage/follows?tab=sent')}>
            <CountLabel>Sent</CountLabel>
            <CountNumber>{pendingSent}</CountNumber>
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

        <RowLink onPress={AccountLogout}>
          <RowLeft>Account Logout</RowLeft>
          <Chevron>›</Chevron>
        </RowLink>
        <RowSeparator />

        <DeletePressable onPress={confirmDelete} disabled={deleteAccountMut.isPending}>
          <DeleteText>{deleteAccountMut.isPending ? 'Deleting...' : 'Delete Account'}</DeleteText>
        </DeletePressable>
      </Scroll>


    </Safe>
  );
}

// ===== 스타일 (기존 그대로) =====
const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1D1E1F;
`;
const Scroll = styled.ScrollView``;

const Header = styled.View`
  padding: 12px 16px 8px 16px;
  flex-direction: row;
  align-items: center;
`;
const Title = styled.Text`
  font-family: 'InstrumentSerif_400Regular';
  font-size: 32px;
  color: #ffffff;
  margin-right: 8px;
`;
const IconImage = styled.Image`
  width: 22px;
  height: 22px;
  resize-mode: contain;
  transform: translateY(-3px);
`;

const ProfileView = styled.View`
  align-items: center;
  padding: 8px 16px 12px 16px;
`;
const AvatarPress = styled.Pressable`position: relative;`;
const Name = styled.Text`
  margin-top: 10px;
  color: #ffffff;
  font-size: 18px;
  line-height: 22px;
  font-family: 'PlusJakartaSans_700Bold';
  max-width: 80%;
  text-align: center;
`;
const EditButtonWrap = styled.View`
  align-self: stretch;
  padding: 12px 16px 0 16px;
  height: 48px;
  justify-content: center;
  position: relative; 
  z-index: 1;
`;

const SectionTitle = styled.Text`
  color: #9aa0a6;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const SectionTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 28px 16px 10px 16px;
`;
function SectionTitleIcon() {
  return <Ionicons name="person-outline" size={12} color="#9aa0a6" style={{ marginRight: 6, transform: [{ translateY: 1 }] }} />;
}
function SectionTitleIconGlobe() {
  return (
    <Image
      source={require('@/assets/icons/global.png')}
      resizeMode="contain"
      style={{ width: 12, height: 12, marginRight: 6, tintColor: '#9aa0a6', transform: [{ translateY: 1 }] }}
    />
  );
}

const RowLink = styled.Pressable`
  padding: 14px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const RowLeft = styled.Text`
  color: #e9ecef;
  font-size: 15px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const Chevron = styled.Text`
  color: #b8bdc2;
  font-size: 18px;
  margin-left: 8px;
`;

const RowHeader = styled.Text`
  margin: 20px 16px 8px 16px;
  color: #e9ecef;
  font-size: 15px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const RowSeparator = styled.View`
  height: 1px;
  margin: 4px 16px 18px 16px;
  background: #2a2b2c;
  opacity: 0.6;
`;

const CountCard = styled.View`
  margin: 10px 16px 12px 16px;
  background: #2a2f33;
  border-radius: 14px;
  padding: 10px;
  flex-direction: row;
  align-items: stretch;
`;
const Divider = styled.View`
  width: 1px;
  background: #454a4f;
  margin: 6px 4px;
`;
const CountItem = styled.Pressable`
  flex: 1;
  padding: 6px 8px;
  align-items: center;
  justify-content: center;
`;
const CountLabel = styled.Text`
  color: #c7cbcf;
  font-size: 15px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const CountNumber = styled.Text`
  margin-top: 2px;
  color: #ffffff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const DeletePressable = styled.Pressable<{ disabled?: boolean }>`
  padding: 16px;
  margin-top: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const DeleteText = styled.Text`
  color: #ff5a5a;
  font-size: 14px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

