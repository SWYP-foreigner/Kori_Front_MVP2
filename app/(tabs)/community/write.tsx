import { Category } from '@/components/CategoryChips';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView, Modal, Platform, Pressable, TextInput as RNTextInput,
    TextInputProps, View
} from 'react-native';
import styled from 'styled-components/native';

const CATS: Category[] = ['News', 'Tip', 'Q&A', 'Event', 'Free talk', 'Activity'];
const GREEN = '#30F59B';

export default function WriteScreen() {
    const [category, setCategory] = useState<Category>('Activity');
    const [body, setBody] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const inputRef = useRef<RNTextInput>(null);

    const canSave = useMemo(() => body.trim().length > 0, [body]);

    const pickImage = async () => {
        setPickerOpen(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.9,
        });
        if (!res.canceled) setImage(res.assets[0].uri);
    };

    const onSave = () => {
        // TODO: API 연동 자리
        console.log({ category, body, anonymous, image });
        router.back();
    };

    return (
        <Safe>
            <Header>
                <IconBtn onPress={() => router.back()}>
                    <AntDesign name="left" size={20} color="#fff" />
                </IconBtn>
                <HeaderTitle>Write</HeaderTitle>
                <SaveBtn
                    onPress={onSave}
                    disabled={!canSave}
                    accessibilityLabel="save-post"
                >
                    <SaveText $enabled={canSave}>Save</SaveText>
                </SaveBtn>
            </Header>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <CatRow onPress={() => setCatOpen(true)}>
                    <CatLabel>Category</CatLabel>
                    <CatChip>
                        <CatText>{category}</CatText>
                        <AntDesign name="down" size={10} color="#9aa0a6" />
                    </CatChip>
                </CatRow>

                {/* Divider */}
                <Divider />

                {/* Body input */}
                <BodyWrap onPress={() => inputRef.current?.focus()}>
                    <Input
                        ref={inputRef}
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                        placeholder="Feel free to talk to others."
                        placeholderTextColor="#8a8a8a"
                        returnKeyType="default"
                    />
                </BodyWrap>

                {image ? (
                    <PreviewWrap>
                        <Preview source={{ uri: image }} />
                    </PreviewWrap>
                ) : null}

                <BottomBar>
                    <BarLeft>
                        <BarIcon onPress={() => setPickerOpen(true)}>
                            <AntDesign name="picture" size={18} color="#cfd4da" />
                        </BarIcon>
                    </BarLeft>
                    <BarRight>
                        <Anon onPress={() => setAnonymous(v => !v)} $active={anonymous}>
                            <AnonText $active={anonymous}>Anonymous</AnonText>
                            <AntDesign
                                name={anonymous ? 'checksquare' : 'checksquareo'}
                                size={16}
                                color={anonymous ? GREEN : '#8a8a8a'}
                                style={{ marginLeft: 6 }}
                            />
                        </Anon>
                    </BarRight>
                </BottomBar>
            </KeyboardAvoidingView>

            <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
                <SheetBackdrop onPress={() => setPickerOpen(false)} />
                <Sheet>
                    <SheetBtn onPress={pickImage}>
                        <SheetBtnText>Select from the album</SheetBtnText>
                    </SheetBtn>
                    <SheetBtn onPress={() => setPickerOpen(false)}>
                        <SheetBtnText>Cancel</SheetBtnText>
                    </SheetBtn>
                </Sheet>
            </Modal>

            <Modal visible={catOpen} transparent animationType="fade" onRequestClose={() => setCatOpen(false)}>
                <SheetBackdrop onPress={() => setCatOpen(false)} />
                <CatSheet>
                    {CATS.map(c => {
                        const active = c === category;
                        return (
                            <CatItem key={c} onPress={() => { setCategory(c); setCatOpen(false); }}>
                                <CatItemText $active={active}>{c}</CatItemText>
                                {active ? <AntDesign name="check" size={16} color="#9aa0a6" /> : <View style={{ width: 16 }} />}
                            </CatItem>
                        );
                    })}
                </CatSheet>
            </Modal>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;

const Header = styled.View`
  height: 48px;
  padding: 0 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const IconBtn = styled.Pressable`
  padding: 6px;
`;
const HeaderTitle = styled.Text`
  color: #fff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;
const SaveBtn = styled.Pressable<{ disabled?: boolean }>`
  padding: 6px;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;
const SaveText = styled.Text<{ $enabled: boolean }>`
  color: ${({ $enabled }) => ($enabled ? GREEN : '#9aa0a6')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const CatRow = styled.Pressable`
  padding: 10px 12px 8px 12px;
  flex-direction: row;
  align-items: center;
`;
const CatLabel = styled.Text`
  color: #9aa0a6;
  font-size: 12px;
  margin-right: 10px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const CatChip = styled.View`
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;
const CatText = styled.Text`
  color: #cfd4da;
  font-size: 12px;
`;

const Divider = styled.View`
  height: 1px;
  background: #222426;
`;

const BodyWrap = styled.Pressable`
  flex: 1;
  padding: 10px 12px 0 12px;
`;
const StyledRNInput = styled(RNTextInput)`
  flex: 1;
  min-height: 150px;
  color: #e6e9ec;
  font-size: 14px;
  line-height: 20px;
  padding: 0;
`;
const Input = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
    return <StyledRNInput ref={ref} {...props} />;
});
Input.displayName = 'Input';

const PreviewWrap = styled.View`
  padding: 8px 12px 0 12px;
`;
const Preview = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 12px;
  background: #111213;
`;

const BottomBar = styled.View`
  padding: 8px 10px 12px 10px;
  border-top-width: 1px;
  border-top-color: #222426;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const BarLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const BarRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
const BarIcon = styled.Pressable`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
`;

const Anon = styled.Pressable<{ $active?: boolean }>`
  height: 32px;
  border-radius: 8px;
  padding: 0 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => ($active ? '#2d3f38' : '#1a1b1c')};
  border: 1px solid ${({ $active }) => ($active ? GREEN : '#2a2b2c')};
`;
const AnonText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? GREEN : '#cfd4da')};
  font-family: 'PlusJakartaSans_600SemiBold';
  font-size: 12px;
`;

const SheetBackdrop = styled(Pressable)`
  flex: 1;
  background: rgba(0,0,0,0.35);
`;
const SheetBase = styled.View`
  background: #111213;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 8px 10px 20px 10px;
`;
const Sheet = styled(SheetBase)`
  position: absolute;
  left: 0; right: 0; bottom: 0;
`;
const SheetBtn = styled.Pressable`
  height: 52px;
  border-radius: 12px;
  background: #1a1b1c;
  border: 1px solid #2a2b2c;
  align-items: center;
  justify-content: center;
  margin: 6px 12px 0 12px;
`;
const SheetBtnText = styled.Text`
  color: #cfd4da;
  font-size: 15px;
`;

const CatSheet = styled(SheetBase)`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding-top: 12px;
`;
const CatItem = styled.Pressable`
  height: 48px;
  padding: 0 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const CatItemText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#e6e9ec' : '#cfd4da')};
  font-size: 15px;
`;
