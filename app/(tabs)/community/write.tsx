import { createPost } from '@/api/community/posts';
import { Category } from '@/components/CategoryChips';
import { usePresignedUpload } from '@/hooks/mutations/useImageUpload';
import { useUpdatePost } from '@/hooks/mutations/useUpdatePost';
import { CATEGORY_TO_BOARD_ID } from '@/lib/community/constants';
import { uploadImageToPresignedUrl } from '@/utils/uploadImageToPresignedUrl';
import { router, useLocalSearchParams } from 'expo-router';

import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert, Image as RNImage, KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable, ScrollView, TextInput as RNTextInput,
  TextInputProps,
  View
} from 'react-native';
import styled from 'styled-components/native';

const CATS: Category[] = ['News', 'Tip', 'Q&A', 'Event', 'Free talk', 'Activity'];
const GREEN = '#30F59B';

export default function WriteScreen() {
  const params = useLocalSearchParams<{ mode?: string; postId?: string; initial?: string }>();
  const isEdit = params.mode === 'edit';
  const postIdNum = params.postId ? Number(params.postId) : undefined;

  const [category, setCategory] = useState<Category>('Activity');
  const [body, setBody] = useState<string>(params.initial ?? '');
  const [anonymous, setAnonymous] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const [images, setImages] = useState<string[]>([]);

  const inputRef = useRef<RNTextInput>(null);
  const canSave = useMemo(() => body.trim().length > 0, [body]);

  const presignMutation = usePresignedUpload();
  const updateMutation = useUpdatePost();

  const pickImage = async () => {
    setPickerOpen(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(u => u !== uri));
  };

  const onSave = async () => {
    if (!canSave) return;
    const content = body.trim();

    try {
      let uploadedKeys: string[] = [];

      if (images.length > 0) {
        const uploadSessionId = `sess_${Date.now()}`;
        const files = images.map((uri, idx) => {
          const filename = uri.split('/').pop() ?? `IMG_${Date.now()}_${idx}.jpg`;
          return { filename, contentType: 'image/jpeg' as const };
        });

        const presignRes = await presignMutation.mutateAsync({
          imageType: 'POST',
          uploadSessionId,
          files,
        });

        for (let i = 0; i < presignRes.length; i++) {
          const { key, putUrl, headers } = presignRes[i];
          const fileUri = images[i];

          await uploadImageToPresignedUrl({ putUrl, headers, fileUri });

          uploadedKeys.push(key);
        }

        await new Promise(res => setTimeout(res, 300));
      }

      if (isEdit && postIdNum) {
        await updateMutation.mutateAsync({
          postId: postIdNum,
          body: {
            content,
            images: uploadedKeys,
            removedImages: [],
          },
        });
        Alert.alert('Saved', 'Post updated successfully.');
      } else {
        const boardId = CATEGORY_TO_BOARD_ID[category];
        await createPost(boardId, {
          content,
          isAnonymous: anonymous,
          imageUrls: uploadedKeys,
        });
        Alert.alert('Success', 'Post created successfully!');
      }

      router.back();
    } catch (e: any) {
      console.log('[write:save] error', e?.response?.data || e?.message || e);
      Alert.alert('Error', isEdit ? 'Failed to update post.' : 'Failed to create post.');
    }
  };

  return (
    <Safe>
      <Header>
        <IconBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </IconBtn>
        <HeaderTitle>{isEdit ? 'Edit Post' : 'Write'}</HeaderTitle>
        <SaveBtn
          onPress={onSave}
          disabled={!canSave || updateMutation.isPending}
          accessibilityLabel="save-post"
        >
          <SaveText $enabled={canSave && !updateMutation.isPending}>
            {isEdit ? (updateMutation.isPending ? 'Saving...' : 'Save') : 'Save'}
          </SaveText>
        </SaveBtn>
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <CatRow onPress={() => !isEdit && setCatOpen(true)} disabled={isEdit}>
          <CatLabel>Category</CatLabel>
          <CatChip style={isEdit ? { opacity: 0.5 } : undefined}>
            <CatText>{category}</CatText>
            <AntDesign name="down" size={10} color="#9aa0a6" />
          </CatChip>
        </CatRow>

        <Divider />

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

        {images.length > 0 && (
          <PreviewWrap>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map(uri => (
                <Thumb key={uri}>
                  <ThumbImage source={{ uri }} />
                  <RemoveBtn onPress={() => removeImage(uri)}>
                    <AntDesign name="close" size={12} color="#fff" />
                  </RemoveBtn>
                </Thumb>
              ))}
            </ScrollView>
          </PreviewWrap>
        )}

        <BottomBar>
          <BarLeft>
            <BarIcon onPress={() => setPickerOpen(true)}>
              <AntDesign name="picture" size={18} color="#cfd4da" />
            </BarIcon>
          </BarLeft>
          <BarRight>
            <Anon onPress={() => setAnonymous(v => !v)} $active={anonymous} disabled={isEdit}>
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

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
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

      <Modal
        visible={catOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCatOpen(false)}
      >
        <SheetBackdrop onPress={() => setCatOpen(false)} />
        <CatSheet>
          {CATS.map(c => {
            const active = c === category;
            return (
              <CatItem
                key={c}
                onPress={() => {
                  setCategory(c);
                  setCatOpen(false);
                }}
              >
                <CatItemText $active={active}>{c}</CatItemText>
                {active ? (
                  <AntDesign name="check" size={16} color="#9aa0a6" />
                ) : (
                  <View style={{ width: 16 }} />
                )}
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
  font-family: 'PlusJakartaSans_500Bold';
`;
const SaveBtn = styled.Pressable<{ disabled?: boolean }>`
  padding: 6px;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;
const SaveText = styled.Text<{ $enabled: boolean }>`
  color: ${({ $enabled }) => ($enabled ? '#30F59B' : '#9aa0a6')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const CatRow = styled.Pressable<{ disabled?: boolean }>`
  padding: 10px 12px 8px 12px;
  flex-direction: column;
  align-items: left;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  gap: 10px;
`;
const CatLabel = styled.Text`
  color: #9aa0a6;
  font-size: 13px;
  margin-right: 10px;
  font-family: 'PlusJakartaSans_400Regular';
`;
const CatChip = styled.View`
  height: 24px;
  padding: 0 10px;
  background: #1d1e1f;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;
const CatText = styled.Text`
  color: #cfd4da;
  font-size: 16px;
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
const Input = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => (
  <StyledRNInput ref={ref} {...props} />
));
Input.displayName = 'Input';

const PreviewWrap = styled.View`
  padding: 8px 12px 0 12px;
`;

const Thumb = styled.View`
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  background: #111213;
  margin-right: 8px;
`;
const ThumbImage = styled(RNImage)`
  width: 96px;
  height: 96px;
`;
const RemoveBtn = styled.Pressable`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: rgba(0,0,0,0.5);
  align-items: center;
  justify-content: center;
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
`;
const Anon = styled.Pressable<{ $active?: boolean; disabled?: boolean }>`
  height: 32px;
  padding: 0 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
const AnonText = styled.Text<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? '#30F59B' : '#cfd4da')};
  font-family: 'PlusJakartaSans_600SemiBold';
  font-size: 12px;
`;

const SheetBackdrop = styled(Pressable)`
  flex: 1;
  background: rgba(0, 0, 0, 0.35);
`;
const SheetBase = styled.View`
  background: #111213;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 8px 10px 20px 10px;
`;
const Sheet = styled(SheetBase)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
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
  left: 0;
  right: 0;
  bottom: 0;
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
