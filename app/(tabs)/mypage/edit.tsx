import Avatar from '@/components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/native';

import CountryPicker, {
  CountryDropdownButton,
  CountryDropdownText
} from '@/components/CountryPicker';

import LanguagePicker, {
  LanguageDropdownButton,
  LanguageDropdownText,
  MAX_LANGUAGES
} from '@/components/LanguagePicker';

import PurposePicker, {
  PurposeDropdownButton,
  PurposeDropdownText
} from '@/components/PurposePicker';

import useProfileEdit from '@/hooks/mutations/useProfileEdit';
import useMyProfile from '@/hooks/queries/useMyProfile';
import { useQueryClient } from '@tanstack/react-query';

const INPUT_HEIGHT = 50;
const INPUT_RADIUS = 8;
const INPUT_BG = '#353637';
const INPUT_BORDER = '#FFFFFF';

export default function EditProfileScreen() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMyProfile();
  const editMutation = useProfileEdit();

  const [name, setName] = useState('');
  const [email] = useState(''); // 서버에서 이메일 안 주면 숨김 처리 유지
  const [country, setCountry] = useState('');
  const [showCountry, setShowCountry] = useState(false);

  const [langs, setLangs] = useState<string[]>([]);
  const [showLang, setShowLang] = useState(false);

  const [birth, setBirth] = useState(''); // MM/DD/YY 형태로 입력
  const [purpose, setPurpose] = useState('');
  const [showPurpose, setShowPurpose] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState('');

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
  }, [me]);

  const languagesDisplay = useMemo(() => {
    if (!langs.length) return 'Select your language';
    const codes = langs.map((l) => {
      const m = l.match(/\(([^)]+)\)/);
      return m ? m[1] : l;
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

  // MM/DD/YY 자동 포매터
  const formatBirth = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits; // M, MM
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`; // MM/DD
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`; // MM/DD/YY
  };

  const onSave = async () => {
    const { firstname, lastname } = splitName(name);
    const language = langs.map((l) => {
      const m = l.match(/\(([^)]+)\)/);
      return (m ? m[1] : l).trim();
    });

    const body = {
      firstname,
      lastname,
      gender: 'unspecified',
      birthday: birth || '',
      country: country || '',
      introduction: aboutMe || '',
      purpose: purpose || '',
      language,
      hobby: selectedInterests ?? [],
      imageKey: undefined,
    };

    try {
      await editMutation.mutateAsync(body);
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
      router.back();
    } catch (e) {
      console.log('[Profile Save Error]', e);
    }
  };

  return (
    <Safe>
      <Header>
        <Side onPress={() => router.back()} hitSlop={12} style={{ left: -4 }}>
          <Ionicons name="chevron-back" size={22} color="#cfd4da" />
        </Side>
        <Title>My Profile</Title>
        <Side onPress={onSave} hitSlop={12} style={{ right: -4 }}>
          <SaveText>Save</SaveText>
        </Side>
      </Header>

      <Scroll showsVerticalScrollIndicator={false}>
        <Center>
          <Avatar />
          <NameText numberOfLines={1} ellipsizeMode="tail">
            {name || (isLoading ? 'Loading...' : '—')}
          </NameText>
          {!!email && <EmailText>{email}</EmailText>}
        </Center>

        {/* Name */}
        <Field>
          <LabelRow>
            <LabelText>Name</LabelText>
            <Count>{name.length}/20</Count>
          </LabelRow>
          <NameInput
            value={name}
            onChangeText={(t: string) => t.length <= 20 && setName(t)}
            placeholder="Your name"
            placeholderTextColor="#EDEDED99"
          />
        </Field>

        {/* Country */}
        <Field>
          <LabelText>Country</LabelText>
          <CountryDropdownButton selected={!!country} onPress={() => setShowCountry(true)}>
            <CountryDropdownText selected={!!country}>
              {country || 'Select your country'}
            </CountryDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </CountryDropdownButton>
        </Field>

        {/* Birth - TextInput 버전 */}
        <Field>
          <LabelText>Birth</LabelText>
          <BirthInput
            value={birth}
            onChangeText={(t) => setBirth(formatBirth(t))}
            placeholder="MM/DD/YY"
            placeholderTextColor="#EDEDED99"
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="done"
          />
        </Field>

        {/* Purpose */}
        <Field>
          <LabelText>Purpose</LabelText>
          <PurposeDropdownButton selected={!!purpose} onPress={() => setShowPurpose(true)}>
            <PurposeDropdownText selected={!!purpose}>
              {purpose || 'Select purpose'}
            </PurposeDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </PurposeDropdownButton>
        </Field>

        {/* Language */}
        <Field>
          <LabelRow>
            <LabelText>Language</LabelText>
            {!!langs.length && (
              <SmallMuted>
                {langs.length}/{MAX_LANGUAGES} selected
              </SmallMuted>
            )}
          </LabelRow>
          <LanguageDropdownButton selected={langs.length > 0} onPress={() => setShowLang(true)}>
            <LanguageDropdownText selected={langs.length > 0}>
              {languagesDisplay}
            </LanguageDropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </LanguageDropdownButton>
        </Field>

        {/* Personality Preview */}
        <Field>
          <TopRow>
            <LabelText>Personality</LabelText>
            <SmallMuted>{selectedInterests.length}/5 selected</SmallMuted>
          </TopRow>
          <TagsWrap>
            {selectedInterests.map((t) => (
              <PreviewTag key={t}>
                <PreviewTagText>{t}</PreviewTagText>
              </PreviewTag>
            ))}
          </TagsWrap>
        </Field>

        {/* About Me */}
        <Field>
          <LabelText>About Me</LabelText>
          <TextArea
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Introduce yourself"
            placeholderTextColor="#EDEDED99"
            multiline
          />
        </Field>

        <BottomPad />
      </Scroll>

      {/* Pickers */}
      <CountryPicker
        visible={showCountry}
        value={country}
        onClose={() => setShowCountry(false)}
        onSelect={(c) => {
          setCountry(c);
          setShowCountry(false);
        }}
      />
      <LanguagePicker
        visible={showLang}
        value={langs}
        onClose={() => setShowLang(false)}
        onChange={(next) => setLangs(next)}
      />
      <PurposePicker
        visible={showPurpose}
        value={purpose}
        onClose={() => setShowPurpose(false)}
        onSelect={(p) => {
          setPurpose(p);
          setShowPurpose(false);
        }}
      />
    </Safe>
  );
}

/* ===================== styles ===================== */

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
const SaveText = styled.Text`
  color: #30f59b;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const Center = styled.View`
  align-items: center;
  padding: 8px 0 16px 0;
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
const LabelText = styled.Text`
  color: #e9ecef;
  font-size: 13px;
  margin-bottom: 6px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;
const Count = styled.Text`
  color: #7e848a;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const NameInput = styled.TextInput`
  height: ${INPUT_HEIGHT}px;
  border-radius: ${INPUT_RADIUS}px;
  background: ${INPUT_BG};
  padding: 0 16px;
  color: #fff;
  border-width: 0.48px;
  border-color: ${INPUT_BORDER};
  font-family: 'PlusJakartaSans_400Regular';
`;

const BirthInput = styled.TextInput`
  height: ${INPUT_HEIGHT}px;
  border-radius: ${INPUT_RADIUS}px;
  background: ${INPUT_BG};
  padding: 0 16px;
  color: #fff;
  border-width: 0.48px;
  border-color: ${INPUT_BORDER};
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

const TextArea = styled.TextInput`
  background: ${INPUT_BG};
  border-radius: ${INPUT_RADIUS}px;
  padding: 12px 14px;
  color: #fff;
  border-width: 1px;
  border-color: ${INPUT_BORDER};
  font-family: 'PlusJakartaSans_400Regular';
  min-height: 110px;
  text-align-vertical: top;
`;

const BottomPad = styled.View`
  height: 20px;
`;
