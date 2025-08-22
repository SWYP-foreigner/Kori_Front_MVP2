import Avatar from '@/components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

const INTERESTS = [
    'Music', 'Movies', 'Reading', 'Anime', 'Gaming', 'Drinking', 'Exploring Cafés', 'Traveling', 'Board Games', 'Shopping',
    'Beauty', 'Doing Nothing', 'Yoga', 'Running', 'Fitness', 'Camping', 'Dancing', 'Hiking', 'Exhibition', 'Singing', 'Cooking',
    'Pets', 'Career', 'Photography', 'K-Pop Lover', 'K-Drama Lover', 'K-Food Lover',
];

const INPUT_HEIGHT = 50;
const INPUT_RADIUS = 8;
const INPUT_BG = '#353637';
const INPUT_BORDER = '#FFFFFF';

export default function EditProfileScreen() {
    const [name, setName] = useState('Alice Kori, Kim');
    const [email] = useState('Kori@gmail.com');

    const [country, setCountry] = useState('United States');
    const [showCountry, setShowCountry] = useState(false);

    const [langs, setLangs] = useState<string[]>(['Korean (KO)', 'English (EN)', 'French (FR)']);
    const [showLang, setShowLang] = useState(false);

    const [birth, setBirth] = useState('08/16/2025');

    const [purpose, setPurpose] = useState('Study'); // 기본값 자유롭게 변경
    const [showPurpose, setShowPurpose] = useState(false);

    const [showInterest, setShowInterest] = useState(false);
    const [selectedInterests] = useState<string[]>([
        'Gaming', 'Yoga', 'Anime', 'Exploring Cafés', 'Doing Nothing',
    ]);

    const languagesDisplay = useMemo(() => {
        if (!langs.length) return 'Select your language';
        const codes = langs.map((l) => {
            const m = l.match(/\(([^)]+)\)/);
            return m ? m[1] : l;
        });
        return codes.join(' / ');
    }, [langs]);

    return (
        <Safe>
            <Header>
                <Side onPress={() => router.back()} hitSlop={12} style={{ left: -4 }}>
                    <Ionicons name="chevron-back" size={22} color="#cfd4da" />
                </Side>
                <Title>My Profile</Title>
                <Side onPress={() => { /* 저장 */ }} hitSlop={12} style={{ right: -4 }}>
                    <SaveText>Save</SaveText>
                </Side>
            </Header>

            <Scroll showsVerticalScrollIndicator={false}>
                <Center>
                    <Avatar />
                    <Name>{name}</Name>
                    <Email>{email}</Email>
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

                {/* Birth */}
                <Field>
                    <LabelText>Birth</LabelText>
                    <SelectBox onPress={() => { /* DatePicker 예정 */ }}>
                        <SelectText>{birth || 'Select your birth'}</SelectText>
                        <AntDesign name="down" size={16} color="#949899" />
                    </SelectBox>
                </Field>

                {/* Purpose (방문 목적) */}
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
                        {!!langs.length && <SmallMuted>{langs.length}/{MAX_LANGUAGES} selected</SmallMuted>}
                    </LabelRow>
                    <LanguageDropdownButton selected={langs.length > 0} onPress={() => setShowLang(true)}>
                        <LanguageDropdownText selected={langs.length > 0}>
                            {languagesDisplay}
                        </LanguageDropdownText>
                        <AntDesign name="down" size={16} color="#949899" />
                    </LanguageDropdownButton>
                </Field>

                {/* Personality preview */}
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
                    <SmallEditBtn onPress={() => setShowInterest(true)}>
                        <SmallEditText>+ Edit</SmallEditText>
                    </SmallEditBtn>
                </Field>

                {/* About Me */}
                <Field>
                    <LabelText>About Me</LabelText>
                    <TextArea
                        value={''}
                        onChangeText={() => { }}
                        placeholder="Introduce yourself"
                        placeholderTextColor="#EDEDED99"
                        multiline
                    />
                </Field>

                <BottomPad />
            </Scroll>

            {/* 모달들 */}
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
  color: #30F59B;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const Center = styled.View`
  align-items: center;
  padding: 8px 0 16px 0;
`;
const Name = styled.Text`
  margin-top: 8px;
  color: #fff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const Email = styled.Text`
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

const SelectBox = styled.Pressable`
  height: ${INPUT_HEIGHT}px;
  border-radius: ${INPUT_RADIUS}px;
  background: ${INPUT_BG};
  padding: 0 16px;
  border-width: 0.48px;
  border-color: ${INPUT_BORDER};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const SelectText = styled.Text`
  color: #ededed;
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
const SmallEditBtn = styled.Pressable`
  margin-top: 10px;
  align-self: flex-start;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #2a2b2c;
  background: #121314;
`;
const SmallEditText = styled.Text`
  color: #cfd4da;
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
