import Avatar from '@/components/Avatar';
import BottomSheetTagPicker, { TagSection } from '@/components/BottomSheetTagPicker';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Buffer } from 'buffer';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/native';

import CountryPicker, { CountryDropdownButton, CountryDropdownText } from '@/components/CountryPicker';
import GenderPicker, { GenderDropdownButton, GenderDropdownText } from '@/components/GenderPicker';
import LanguagePicker, {
  LanguageDropdownButton,
  LanguageDropdownText
} from '@/components/LanguagePicker';
import PurposePicker, { PurposeDropdownButton, PurposeDropdownText } from '@/components/PurposePicker';
import useProfileEdit from '@/hooks/mutations/useProfileEdit';
import useMyProfile from '@/hooks/queries/useMyProfile';
import { Config } from '@/src/lib/config';

import api from '@/api/axiosInstance';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Modal, Image as RNImage } from 'react-native';

const INPUT_HEIGHT = 50;
const INPUT_RADIUS = 8;
const INPUT_BG = '#353637';
const INPUT_BORDER = '#FFFFFF';
const ERROR_COLOR = '#FF6B6B';

const toUrl = (u?: string) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  if (/^(asset|file|data):/i.test(u)) return u;
  const base =
    (Config as any).EXPO_PUBLIC_NCP_PUBLIC_BASE_URL ||
    (Config as any).NCP_PUBLIC_BASE_URL ||
    (Config as any).EXPO_PUBLIC_IMAGE_BASE_URL ||
    (Config as any).IMAGE_BASE_URL ||
    '';
  return base ? `${String(base).replace(/\/+$/, '')}/${String(u).replace(/^\/+/, '')}` : undefined;
};

const AVATARS = [
  require('@/assets/images/character1.png'),
  require('@/assets/images/character2.png'),
  require('@/assets/images/character3.png'),
] as const;

const AVATAR_URLS = [
  'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_01.png',
  'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_02.png',
  'https://kr.object.ncloudstorage.com/foreigner-bucket/default/character_03.png',
] as const;

const CAMERA_IMG = require('@/assets/images/camera.png');

const stripHost = (keyOrUrl?: string) => {
  if (!keyOrUrl) return undefined;
  if (/^https?:\/\//i.test(keyOrUrl)) {
    try {
      const u = new URL(keyOrUrl);
      return u.pathname.replace(/^\/+/, '');
    } catch {
      return keyOrUrl;
    }
  }
  return keyOrUrl;
};

const detectPresetIndex = (keyOrUrl?: string) => {
  const path = stripHost(keyOrUrl);
  if (!path) return -1;
  return AVATAR_URLS.findIndex((k) => path.endsWith(k));
};

async function uploadLocalImageAndGetKeyInline(uri: string, mime = 'image/jpeg') {
  const filename = uri.split('/').pop() || 'profile.jpg';

  const pres = await api.post('/api/v1/images/presign', {
    imageType: 'USER',
    uploadSessionId: String(Date.now()),
    files: [{ filename, contentType: mime }],
  });
  const info = pres.data?.data?.[0];
  if (!info?.putUrl || !info?.headers || !info?.key) {
    throw new Error('Invalid presign response');
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const buffer = Buffer.from(base64, 'base64');

  const res = await axios.put(info.putUrl, buffer, {
    headers: { ...info.headers, 'Content-Type': mime },
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`PUT failed: ${res.status}`);
  }
  return info.key as string;
}

const TAG_SECTIONS: TagSection[] = [
  {
    title: 'Entertainment & Hobbies',
    items: ['Music', 'Movies', 'Reading', 'Anime', 'Gaming'],
    emojis: ['🎵', '🎬', '📚', '🎬', '🎮'],
  },
  {
    title: 'LifeStyle & Social',
    items: ['Drinking', 'Exploring Cafes', 'Traveling', 'Board Games', 'Shopping', 'Beauty', 'Doing Nothing'],
    emojis: ['🍺', '☕️', '✈️', '🧩', '🛍️', '💄️', '🛏️'],
  },
  {
    title: 'Activities & Wellness',
    items: ['Yoga', 'Running', 'Fitness', 'Camping', 'Dancing', 'Hiking'],
    emojis: ['🧘', '🏃', '🏋️', '🥾', '💃', '⛰️'],
  },
  {
    title: 'Creativity & Personal Growth',
    items: ['Exhibition', 'Singing', 'Cooking', 'Pets', 'Career', 'Photography'],
    emojis: ['🎨', '🎤', '🍳', '🐶', '💼', '📸'],
  },
  { title: 'Korean Culture', items: ['K-Pop Lover', 'K-Drama Lover', 'K-Food Lover'], emojis: ['☕️', '🎬', '🍜'] },
];

export default function EditProfileScreen() {
  const [showTagPicker, setShowTagPicker] = useState(false);

  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMyProfile();
  const editMutation = useProfileEdit();

  const [name, setName] = useState('');
  const [email] = useState('');
  const [country, setCountry] = useState('');
  const [showCountry, setShowCountry] = useState(false);

  const [gender, setGender] = useState('');
  const [showGender, setShowGender] = useState(false);

  const [langs, setLangs] = useState<string[]>([]);
  const [showLang, setShowLang] = useState(false);

  const [birth, setBirth] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showPurpose, setShowPurpose] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState('');

  const [avatarKeyOrUrl, setAvatarKeyOrUrl] = useState<string | undefined>(undefined);

  const displayAvatarUrl = useMemo(() => {
    const idx = detectPresetIndex(avatarKeyOrUrl);
    if (idx >= 0) return RNImage.resolveAssetSource(AVATARS[idx])?.uri;
    return toUrl(avatarKeyOrUrl);
  }, [avatarKeyOrUrl]);

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [tempIdx, setTempIdx] = useState<number | null>(null);
  const [customPhotoUri, setCustomPhotoUri] = useState<string | undefined>(undefined);
  const [sheetSaving, setSheetSaving] = useState(false);

  const [pendingImageKey, setPendingImageKey] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const ErrorText = styled.Text`
  color: ${ERROR_COLOR};
  font-size: 12px;
  margin-top: 4px;
  padding-left: 16px;
`;
  useEffect(() => {
    if (!me) return;
    const full = [me.firstname, me.lastname].filter(Boolean).join(' ');
    setName(full);
    setCountry(me.country ?? '');
    setBirth(me.birthday ?? '');
    setPurpose(me.purpose ?? '');
    setLangs(me.language ?? []);
    setSelectedInterests(me.hobby ?? []);
    setAboutMe(me.introduction ?? '');
    setGender(me.gender ?? '');

    const initial = (me as any)?.imageKey || (me as any)?.imageUrl || undefined;
    setAvatarKeyOrUrl(initial);
    setPendingImageKey(undefined);
  }, [me]);
  const handleBlur = (fieldName: string) => () => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };
  const languagesDisplay = useMemo(() => {
    if (!langs.length) return 'Select your language';
    const codes = langs.map((l) => {
      const m = l.match(/\(([^)]+)\)/);
      return (m ? m[1] : l).trim();
    });
    return codes.join(' / ');
  }, [langs]);

  const splitName = (full: string) => {
    const trimmed = (full || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) return { firstname: '', lastname: '' };
    const parts = trimmed.split(' ');
    if (parts.length === 1) return { firstname: parts[0], lastname: '' };
    return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
  };

  // ✅ 필수 필드 유효성 검사
  const isFormValid = useMemo(() => {
    const hasName = name.trim().length > 0;
    const hasGender = gender.trim().length > 0;
    const hasCountry = country.trim().length > 0;
    const hasBirth = birth.trim().length > 0;
    const hasPurpose = purpose.trim().length > 0;
    const hasLanguage = langs.length > 0;
    const hasInterests = selectedInterests.length > 0;
    const hasAboutMe = aboutMe.trim().length > 0;

    return hasName && hasGender && hasCountry && hasBirth && hasPurpose && hasLanguage && hasInterests && hasAboutMe;
  }, [name, gender, country, birth, purpose, langs, selectedInterests, aboutMe]);

const errors = useMemo(() => {
  if (isFormValid) return {};

  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const hasSpace = /\s/.test(trimmedName);
  const nameError = 
    trimmedName.length === 0 
      ? 'Please enter your full name.' // 이름을 입력해주세요.
      : !hasSpace 
        ? 'Please separate your first and last name with a space. (e.g., John Smith)' // 이름과 성을 공백으로 구분해주세요.
        : undefined;

  return {
    name: nameError, 
    gender: gender.trim().length === 0 ? 'Please select your gender.' : undefined, // 성별을 선택해주세요.
    country: country.trim().length === 0 ? 'Please select your country.' : undefined, // 국가를 선택해주세요.
    birth: birth.trim().length === 0 ? 'Please enter your date of birth.' : undefined, // 생년월일을 입력해주세요.
    purpose: purpose.trim().length === 0 ? 'Please select your purpose.' : undefined, // 목적을 선택해주세요.
    language: langs.length === 0 ? 'Please select at least one language.' : undefined, // 언어를 선택해주세요.
    interests: selectedInterests.length === 0 ? 'Please select at least one interest.' : undefined, // 관심사를 하나 이상 선택해주세요.
    aboutMe: aboutMe.trim().length === 0 ? 'Please introduce yourself (About Me).' : undefined, // 자기소개를 입력해주세요.
  };
}, [isFormValid, name, gender, country, birth, purpose, langs, selectedInterests, aboutMe]);

  const formatBirth = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const onSave = async () => {
    // ✅ 저장 전 유효성 검사
    if (!isFormValid) {
      Alert.alert('필수 정보 입력', '모든 필드를 입력해주세요.');
      return;
    }

    const { firstname, lastname } = splitName(name);
    const language = langs.map((l) => {
      const m = l.match(/\(([^)]+)\)/);
      return (m ? m[1] : l).trim();
    });

    const body: any = {
      firstname,
      lastname,
      gender: gender || '',
      birthday: birth || '',
      country: country || '',
      introduction: aboutMe || '',
      purpose: purpose || '',
      language,
      hobby: selectedInterests ?? [],
    };
    if (pendingImageKey) {
      body.imageKey = pendingImageKey;
    }
    try {
      await editMutation.mutateAsync(body);
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
      router.back();
    } catch (error) {
      console.error('[Profile Save Error]', error);
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  const openAvatarSheet = () => {
    setTempIdx(null);
    setCustomPhotoUri(undefined);
    setShowAvatarSheet(true);
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
    Alert.alert('Pick photo', 'How to pick your profile photo?\n\nThis photo will be used as your profile picture.', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const saveAvatarSelection = async () => {
    try {
      setSheetSaving(true);

      if (tempIdx === -1) {
        if (!customPhotoUri) throw new Error('No custom photo selected');
        const key = await uploadLocalImageAndGetKeyInline(customPhotoUri);
        const publicUrl = toUrl(key);
        setPendingImageKey(key);
        setAvatarKeyOrUrl(publicUrl || customPhotoUri);
      } else if (tempIdx !== null && tempIdx >= 0) {
        const url = AVATAR_URLS[tempIdx];
        setPendingImageKey(url);
        setAvatarKeyOrUrl(url);
      } else {
        return;
      }

      setShowAvatarSheet(false);
    } catch (e: any) {
      const raw = e?.detail || e?.response?.data || e?.message || e;
      const msg = typeof raw === 'string' ? raw : raw?.message || raw?.error || 'Upload failed.';
      Alert.alert('Upload error', String(msg));
    } finally {
      setSheetSaving(false);
    }
  };

  return (
    <Safe>
      <Header>
        <Side onPress={() => router.back()} hitSlop={12} style={{ left: -4 }}>
          <Ionicons name="chevron-back" size={22} color="#cfd4da" />
        </Side>
        <Title>My Profile</Title>
        <Side onPress={isFormValid ? onSave : undefined} hitSlop={12} style={{ right: -4 }}>
          <SaveText disabled={!isFormValid}>{isFormValid ? 'Save' : 'Complete all'}</SaveText>
        </Side>
      </Header>
      <Scroll showsVerticalScrollIndicator={false}>
        <Center>
          <AvatarPress onPress={openAvatarSheet}>
            <Avatar uri={displayAvatarUrl} />
            <CameraBadge>
              <CameraBadgeImg source={CAMERA_IMG} />
            </CameraBadge>
          </AvatarPress>
          <NameText numberOfLines={1} ellipsizeMode="tail">
            {name || (isLoading ? 'Loading...' : '—')}
          </NameText>
          {!!email && <EmailText>{email}</EmailText>}
        </Center>

        <Field>
            <LabelText error={!!errors.name}>Full Name</LabelText>
            
            <NameInput
                value={name}
                onChangeText={setName}
                onBlur={handleBlur('name')} 
                error={!!(errors.name && touched.name)}
                placeholder="e.g. John Smith" 
                placeholderTextColor="#EDEDED99"
            />
            {errors.name && touched.name && <ErrorText>{errors.name}</ErrorText>}
        </Field>

        <Field>
          <LabelText error={!!errors.gender}>Gender</LabelText>
          <GenderDropdownButton 
            selected={!!gender} 
            onPress={() => { setShowGender(true); handleBlur('gender'); }} 
            error={!!(errors.gender && touched.gender)} 
          >
            <GenderDropdownText selected={!!gender}>{gender || 'Select your gender'}</GenderDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </GenderDropdownButton>
          
          {errors.gender && touched.gender && <ErrorText>{errors.gender}</ErrorText>}
        </Field>
        <Field>
          <LabelText error={!!errors.country}>Country</LabelText> 
          <CountryDropdownButton 
            selected={!!country} 
            onPress={() => { setShowCountry(true); handleBlur('country'); }} 
            error={!!(errors.country && touched.country)} 
          >
            <CountryDropdownText selected={!!country}>{country || 'Select your country'}</CountryDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </CountryDropdownButton>
          {errors.country && touched.country && <ErrorText>{errors.country}</ErrorText>}
        </Field>

        <Field>
          <LabelText error={!!errors.birth}>Birth</LabelText>
          <BirthInput
            value={birth}
            onChangeText={(t: string) => setBirth(formatBirth(t))}
            placeholder="MM/DD/YY"
            placeholderTextColor="#EDEDED99"
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="done"
            onBlur={handleBlur('birth')}
            error={!!(errors.birth && touched.birth)} 
          />
          
          {errors.birth && touched.birth && <ErrorText>{errors.birth}</ErrorText>}
        </Field>

        <Field>
          <LabelText error={!!errors.purpose}>Purpose</LabelText>
          
          <PurposeDropdownButton 
            selected={!!purpose} 
            onPress={() => { setShowPurpose(true); handleBlur('purpose'); }}
            error={!!(errors.purpose && touched.purpose)}
          >
            <PurposeDropdownText selected={!!purpose}>{purpose || 'Select purpose'}</PurposeDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </PurposeDropdownButton>
   
          {errors.purpose && touched.purpose && <ErrorText>{errors.purpose}</ErrorText>}
        </Field>
        <Field>
            <LabelRow>
                <LabelText error={!!errors.language}>Language</LabelText>
            </LabelRow>
            
            <LanguageDropdownButton 
                selected={langs.length > 0} 
                onPress={() => setShowLang(true)}
                error={!!(errors.language && touched.language)} 
            >
                <LanguageDropdownText selected={langs.length > 0}>{languagesDisplay}</LanguageDropdownText>
                <AntDesign name="down" size={16} color="#949899" />
            </LanguageDropdownButton>
            
            {errors.language && touched.language && <ErrorText>{errors.language}</ErrorText>}
        </Field>
          <Field>
        <TopRow>
          <LabelText error={!!errors.interests}>Personality</LabelText> 
          <SmallMuted>{selectedInterests.length}/5 selected</SmallMuted>
        </TopRow>

        <TagsWrap>
          {selectedInterests.map((t) => (
            <PreviewTag key={t}>
              <PreviewTagText>{t}</PreviewTagText>
            </PreviewTag>
          ))}
        </TagsWrap>

        <EditRow>
          <EditOutlineBtn 
            onPress={() => { setShowTagPicker(true); handleBlur('interests'); }} 
          >
            <AntDesign name="plus" size={12} color="#30F59B" />
            <EditOutlineText>Edit</EditOutlineText>
          </EditOutlineBtn>
        </EditRow>
        {errors.interests && touched.interests && <ErrorText>{errors.interests}</ErrorText>}
      </Field>

      <Field>
        <LabelText error={!!errors.aboutMe}>About Me</LabelText>
        
        <TextArea
          value={aboutMe}
          onChangeText={setAboutMe}
          onBlur={handleBlur('aboutMe')} // ✅ handleBlur 추가
          placeholder="Introduce yourself"
          placeholderTextColor="#EDEDED99"
          multiline
          error={!!(errors.aboutMe && touched.aboutMe)} 
        />
        {errors.aboutMe && touched.aboutMe && <ErrorText>{errors.aboutMe}</ErrorText>}
      </Field>
        <BottomPad />
      </Scroll>
      <CountryPicker
        visible={showCountry}
        value={country}
        onClose={() => setShowCountry(false)}
        onSelect={(c) => {
          setCountry(c);
          setShowCountry(false);
        }}
      />
      <LanguagePicker visible={showLang} value={langs} onClose={() => setShowLang(false)} onChange={setLangs} />
      <PurposePicker
        visible={showPurpose}
        value={purpose}
        onClose={() => setShowPurpose(false)}
        onSelect={(p) => {
          setPurpose(p);
          setShowPurpose(false);
        }}
      />
      <GenderPicker
        visible={showGender}
        value={gender}
        onClose={() => setShowGender(false)}
        onSelect={(g) => {
          setGender(g);
          setShowGender(false);
        }}
      />

      <BottomSheetTagPicker
        visible={showTagPicker}
        value={selectedInterests}
        onClose={() => setShowTagPicker(false)}
        onChange={setSelectedInterests}
        sections={TAG_SECTIONS}
        max={5}
        title="Select your interests"
      />
      {showAvatarSheet && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowAvatarSheet(false)}>
          <SheetOverlay activeOpacity={1} onPress={() => setShowAvatarSheet(false)}>
            <Sheet onStartShouldSetResponder={() => true} onTouchEnd={(e: any) => e.stopPropagation()}>
              <Handle />
              <SheetTitle>Select Profile</SheetTitle>

              <AvatarRow>
                {AVATARS.map((src, i) => {
                  const selected = tempIdx === i;
                  return (
                    <AvatarItem
                      key={i}
                      onPress={() => {
                        setTempIdx(i);
                        setCustomPhotoUri(undefined);
                      }}
                    >
                      <AvatarCircle selected={selected}>
                        <AvatarImg source={src} />
                        {selected && (
                          <CheckBadge>
                            <AntDesign name="check" size={12} color="#0f1011" />
                          </CheckBadge>
                        )}
                      </AvatarCircle>
                    </AvatarItem>
                  );
                })}

                <AvatarItem
                  onPress={pickFromCameraOrGallery}
                  onLongPress={() => {
                    setCustomPhotoUri(undefined);
                    setTempIdx(null);
                  }}
                >
                  <AvatarCircle selected={tempIdx === -1 && !!customPhotoUri}>
                    {customPhotoUri ? (
                      <>
                        <AvatarImg source={{ uri: customPhotoUri }} />
                        <CheckBadge>
                          <AntDesign name="check" size={12} color="#0f1011" />
                        </CheckBadge>
                      </>
                    ) : (
                      <CameraCircleInner>
                        <Ionicons name="camera" size={22} color="#e8eaed" />
                      </CameraCircleInner>
                    )}
                  </AvatarCircle>
                </AvatarItem>
              </AvatarRow>

              <ButtonRow>
                <SheetBtn onPress={() => setShowAvatarSheet(false)}>
                  <SheetBtnText>Cancel</SheetBtnText>
                </SheetBtn>
                <Gap />
                <SheetBtnMint
                  disabled={sheetSaving || tempIdx === null || (tempIdx === -1 && !customPhotoUri)}
                  onPress={saveAvatarSelection}
                >
                  <SheetBtnMintText>{sheetSaving ? 'Saving…' : 'Save'}</SheetBtnMintText>
                </SheetBtnMint>
              </ButtonRow>
            </Sheet>
          </SheetOverlay>
        </Modal>
      )}
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #171818;
`;
const Scroll = styled.ScrollView`
  padding: 0 16px;
`;
const Header = styled.View`
  height: 52px;
  align-items: center;
  justify-content: center;
  position: relative;
`;
const Title = styled.Text`
  color: #fff;
  font-size: 20px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const Side = styled.Pressable`
  position: absolute;
  top: 0;
  bottom: 0;
  justify-content: center;
  padding: 0 12px;
`;
const SaveText = styled.Text<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? '#7e848a' : '#30f59b')};
  font-family: 'PlusJakartaSans_600SemiBold';
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const Center = styled.View`
  align-items: center;
  padding: 8px 0 16px 0;
`;
const AvatarPress = styled.Pressable`
  position: relative;
`;
const NameText = styled.Text`
  margin-top: 8px;
  color: #fff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
  max-width: 82%;
  text-align: center;
`;
const EmailText = styled.Text`
  margin-top: 2px;
  color: #b7babd;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const Field = styled.View`
  margin-bottom: 14px;
`;
const LabelRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;
const LabelText = styled.Text<{ error?: boolean }>` 
  color: ${({ error }) => (error ? ERROR_COLOR : '#e9ecef')};
  font-size: 13px;
  margin-bottom: 6px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const Count = styled.Text`
  color: #7e848a;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const NameInput = styled.TextInput<{ error?: boolean }>`
  height: ${INPUT_HEIGHT}px;
  border-radius: ${INPUT_RADIUS}px;
  background: ${INPUT_BG};
  padding: 0 16px;
  color: #fff;
  border-width: 0.48px;
  border-color: ${({ error }) => (error ? ERROR_COLOR : INPUT_BORDER)};
  font-family: 'PlusJakartaSans_400Regular';
`;
const BirthInput = styled.TextInput<{ error?: boolean }>`
  height: ${INPUT_HEIGHT}px;
  border-radius: ${INPUT_RADIUS}px;
  background: ${INPUT_BG};
  padding: 0 16px;
  color: #fff;
  border-width: 0.48px;
  border-color: ${({ error }) => (error ? ERROR_COLOR : INPUT_BORDER)};
  font-family: 'PlusJakartaSans_400Regular';
`;
const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;
const SmallMuted = styled.Text`
  color: #7e848a;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const TagsWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;
const PreviewTag = styled.View`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #2a2b2c;
  background: #121314;
`;
const PreviewTagText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const TextArea = styled.TextInput<{ error?: boolean }>`
  background: ${INPUT_BG};
  border-radius: ${INPUT_RADIUS}px;
  padding: 12px 14px;
  color: #fff;
  border-width: 1px;
  border-color: ${({ error }) => (error ? ERROR_COLOR : INPUT_BORDER)};
  font-family: 'PlusJakartaSans_400Regular';
  min-height: 110px;
  text-align-vertical: top;
`;
const BottomPad = styled.View`
  height: 20px;
`;

const SheetOverlay = styled.TouchableOpacity`
  flex: 1;
  background: rgba(0, 0, 0, 0.55);
  justify-content: flex-end;
`;

const Sheet = styled.View`
  background: #3a3b3c;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 14px 16px 20px 16px;
`;

const Handle = styled.View`
  align-self: center;
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: #8d9296;
  margin-bottom: 10px;
`;

const SheetTitle = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
  text-align: center;
  margin-bottom: 14px;
`;

const AvatarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  margin: 0 6px 18px 6px;
`;

const AvatarItem = styled.Pressable``;

const AvatarCircle = styled.View<{ selected: boolean }>`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background: #242526;
  align-items: center;
  justify-content: center;
  border-width: 3px;
  border-color: ${({ selected }) => (selected ? '#30F59B' : 'transparent')};
  position: relative;
`;

const AvatarImg = styled.Image`
  width: 66px;
  height: 66px;
  border-radius: 33px;
`;

const CheckBadge = styled.View`
  position: absolute;
  left: -2px;
  top: -2px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3.4px;
  shadow-offset: 0px 2px;
  elevation: 3;
`;

const CameraCircleInner = styled.View`
  width: 66px;
  height: 66px;
  border-radius: 33px;
  align-items: center;
  justify-content: center;
  background: #4a4b4c;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  padding: 0 4px 22px 4px;
`;

const Gap = styled.View`
  width: 12px;
`;

const SheetBtn = styled.Pressable`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background: #595b5c;
  align-items: center;
  justify-content: center;
`;

const SheetBtnText = styled.Text`
  color: #e8eaed;
  font-weight: 700;
`;

const SheetBtnMint = styled.Pressable<{ disabled?: boolean }>`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const SheetBtnMintText = styled.Text`
  color: #0f1011;
  font-weight: 800;
`;

const EditRow = styled.View`
  margin-top: 10px;
`;
const EditOutlineBtn = styled.Pressable`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  gap: 4px;
  border-radius: 100px;
  border-width: 1px;
  border-color: #30f59b;
  background: transparent;
`;
const EditOutlineText = styled.Text`
  color: #30f59b;
  font-size: 13px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const CameraBadge = styled.View`
  position: absolute;
  right: 20px;
  bottom: 16px;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background: #30f59b;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3.4px;
  shadow-offset: 0px 2px;
  elevation: 3;
`;

const CameraBadgeImg = styled.Image`
  width: 18px;
  height: 18px;
  resize-mode: contain;
`;
