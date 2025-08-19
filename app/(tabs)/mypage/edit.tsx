import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import Tag from '@/components/Tag';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';

const PURPOSES = ['Working', 'Education', 'Travel', 'Business'];
const LANGS = ['KO', 'EN', 'FR', 'JP', 'ZH'];
const INTERESTS = [
    'Music', 'Movies', 'Reading', 'Anime', 'Gaming',
    'Drinking', 'Exploring Cafés', 'Traveling', 'Board Games', 'Shopping',
    'Beauty', 'Doing Nothing',
    'Yoga', 'Running', 'Fitness', 'Camping', 'Dancing', 'Hiking',
    'Exhibition', 'Singing', 'Cooking', 'Pets', 'Career', 'Photography',
    'K-Pop Lover', 'K-Drama Lover', 'K-Food Lover',
];

const MAX_INTEREST = 5;

export default function EditProfileScreen() {
    const [name, setName] = useState('Alice Kori, Kim');
    const [email] = useState('Kori@gmail.com');
    const [country, setCountry] = useState('United States');
    const [birth, setBirth] = useState('08/16/2025');
    const [purpose, setPurpose] = useState('Working');
    const [languages, setLanguages] = useState<string[]>(['KO', 'EN', 'FR']);
    const [bio, setBio] = useState('Hello~ I came to Korea from the U.S. as an exchange student');

    const [showInterest, setShowInterest] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['Gaming', 'Yoga', 'Anime', 'Exploring Cafés', 'Doing Nothing']);

    const selectedText = useMemo(() => languages.join(' / '), [languages]);

    const toggleInterest = (label: string) => {
        setSelectedInterests(prev => {
            const exists = prev.includes(label);
            if (exists) return prev.filter(x => x !== label);
            if (prev.length >= MAX_INTEREST) return prev; // 최대 5개
            return [...prev, label];
        });
    };

    const toggleLang = (code: string) => {
        setLanguages(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
    };

    return (
        <Safe>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <Scroll showsVerticalScrollIndicator={false}>
                    <Header>
                        <Title>My Profile</Title>
                        <Save onPress={() => {/* 저장 예정 */ }}>
                            <SaveText>Save</SaveText>
                        </Save>
                    </Header>

                    <Center>
                        <Avatar />
                        <Name>{name}</Name>
                        <Email>{email}</Email>
                    </Center>

                    <Field>
                        <LabelRow>
                            <LabelText>Name</LabelText>
                            <Count>{name.length}/20</Count>
                        </LabelRow>
                        <Input value={name} onChangeText={(t: string) => t.length <= 20 && setName(t)} placeholder="Your name" placeholderTextColor="#6b6e72" />
                    </Field>

                    <Field>
                        <LabelText>Country</LabelText>
                        <Select value={country} onPress={() => { /* Country 선택 바텀시트 예정 */ }} />
                    </Field>

                    <Field>
                        <LabelText>Birth</LabelText>
                        <Select value={birth} onPress={() => { /* DatePicker 예정 */ }} />
                    </Field>

                    <Field>
                        <LabelText>Purpose</LabelText>
                        <Select value={purpose} onPress={() => { /* Picker 예정 */ }} />
                        <ChipRow>
                            {PURPOSES.map(p => (
                                <Chip key={p} active={p === purpose} onPress={() => setPurpose(p)}>
                                    <ChipText active={p === purpose}>{p}</ChipText>
                                </Chip>
                            ))}
                        </ChipRow>
                    </Field>

                    <Field>
                        <LabelText>Language</LabelText>
                        <Select value={selectedText} onPress={() => { }} />
                        <ChipRow>
                            {LANGS.map(code => (
                                <Chip key={code} active={languages.includes(code)} onPress={() => toggleLang(code)}>
                                    <ChipText active={languages.includes(code)}>{code}</ChipText>
                                </Chip>
                            ))}
                        </ChipRow>
                    </Field>

                    <Field>
                        <TopRow>
                            <LabelText>Personality</LabelText>
                            <SmallMuted>{selectedInterests.length}/{MAX_INTEREST} selected</SmallMuted>
                        </TopRow>

                        {/* 선택된 태그 프리뷰 (재사용: Tag) */}
                        <TagsWrap>
                            {selectedInterests.map(t => <Tag key={t} label={t} />)}
                        </TagsWrap>

                        <SmallEditBtn onPress={() => setShowInterest(true)}>
                            <SmallEditText>+ Edit</SmallEditText>
                        </SmallEditBtn>
                    </Field>

                    <Field>
                        <LabelText>About Me</LabelText>
                        <TextArea
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            maxLength={160}
                            placeholder="Introduce yourself"
                            placeholderTextColor="#6b6e72"
                        />
                        <SmallMuted style={{ alignSelf: 'flex-end' }}>{bio.length}/160</SmallMuted>
                    </Field>

                    <BottomPad />
                </Scroll>
            </KeyboardAvoidingView>

            {/* 관심사 모달 */}
            {showInterest && (
                <ModalOverlay onPress={() => setShowInterest(false)}>
                    <ModalSheet onPress={() => { }}>
                        <SheetHeader>
                            <SheetTitle>Select Your Interest</SheetTitle>
                            <SheetCount>{selectedInterests.length}/{MAX_INTEREST} selected</SheetCount>
                        </SheetHeader>

                        <TagGrid
                            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                        >
                            {INTERESTS.map(tag => {
                                const active = selectedInterests.includes(tag);
                                return (
                                    <SelTag key={tag} active={active} onPress={() => toggleInterest(tag)}>
                                        <SelTagText active={active}>{tag}</SelTagText>
                                    </SelTag>
                                );
                            })}
                        </TagGrid>

                        <SheetBtns>
                            <CustomButton label="Cancel" tone="black" filled={false} onPress={() => setShowInterest(false)} />
                            <CustomButton label="Save" tone="mint" filled onPress={() => setShowInterest(false)} />
                        </SheetBtns>
                    </ModalSheet>
                </ModalOverlay>
            )}
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #0f1011;
`;

const Scroll = styled.ScrollView`
  padding: 0 16px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const Save = styled.Pressable``;

const SaveText = styled.Text`
  color: #30F59B;
  font-family: 'PlusJakartaSans_700Bold';
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

const Input = styled.TextInput`
  background: #121314;
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
  border-width: 1px;
  border-color: #222426;
  font-family: 'PlusJakartaSans_400Regular';
`;

const SelectWrap = styled.Pressable`
  background: #121314;
  border-radius: 10px;
  padding: 12px 14px;
  border-width: 1px;
  border-color: #222426;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SelectValue = styled.Text`
  color: #e9ecef;
  font-family: 'PlusJakartaSans_400Regular';
`;

const Arrow = styled.Text`
  color: #7e848a;
  font-size: 16px;
  margin-left: 8px;
`;

const Select = ({ value, onPress }: { value: string; onPress?: () => void }) => (
    <SelectWrap onPress={onPress}>
        <SelectValue>{value}</SelectValue>
        <Arrow>▾</Arrow>
    </SelectWrap>
);

const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Chip = styled.Pressable<{ active: boolean }>`
  border-width: 1px;
  border-color: ${({ active }) => (active ? '#30F59B' : '#2a2b2c')};
  background: ${({ active }) => (active ? 'rgba(48,245,155,0.08)' : '#121314')};
  padding: 6px 12px;
  border-radius: 999px;
`;

const ChipText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#cfd4da')};
  font-size: 12px;
  font-family: 'PlusJakartaSans_600SemiBold';
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
  background: #121314;
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
  border-width: 1px;
  border-color: #222426;
  font-family: 'PlusJakartaSans_400Regular';
  min-height: 110px;
  text-align-vertical: top;
`;

const BottomPad = styled.View`
  height: 20px;
`;

/* Modal(관심사) */
const ModalOverlay = styled.Pressable`
  ...StyleSheet.absoluteFillObject;
  background: rgba(0, 0, 0, 0.6);
  justify-content: flex-end;
`;

const ModalSheet = styled.Pressable`
  background: #0f1011;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  max-height: 80%;
`;

const SheetHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const SheetTitle = styled.Text`
  color: #fff;
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const SheetCount = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const TagGrid = styled.ScrollView``;

const SelTag = styled.Pressable<{ active: boolean }>`
  border-width: 1px;
  border-color: ${({ active }) => (active ? '#30F59B' : '#2a2b2c')};
  background: ${({ active }) => (active ? 'rgba(48,245,155,0.08)' : '#121314')};
  padding: 6px 12px;
  border-radius: 999px;
`;

const SelTagText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#cfd4da')};
  font-size: 12px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const SheetBtns = styled.View`
  margin-top: 12px;
  flex-direction: row;
  gap: 10px;
`;
