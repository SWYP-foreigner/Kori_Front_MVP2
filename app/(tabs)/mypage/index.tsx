import CustomButton from '@/components/CustomButton';
import EditAvatar from '@/components/EditAvatar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Image, Image as RNImage,
  ImageSourcePropType,
  Modal
} from 'react-native';
import styled from 'styled-components/native';

const MOCK_ME = {
  name: 'Alice Kori, Kim',
  email: 'Kori@gmail.com',
  avatarUrl: undefined as string | undefined,
  receivedCount: 2,
  sentCount: 3,
};

const AVATARS: ImageSourcePropType[] = [
  require('@/assets/images/character1.png'),
  require('@/assets/images/character2.png'),
  require('@/assets/images/character3.png'),
];

export default function MyPageScreen() {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(MOCK_ME.avatarUrl);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [tempIdx, setTempIdx] = useState<number>(0);

  const confirmDelete = () => {
    Alert.alert(
      'Are you sure you want to leave the this app?',
      'After deleting it, you cannot restore it.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { } },
      ],
    );
  };

  const openAvatarSheet = () => {
    const cur = AVATARS.findIndex(
      img => (RNImage.resolveAssetSource(img)?.uri ?? '') === (avatarUrl ?? ''),
    );
    setTempIdx(cur >= 0 ? cur : 0);
    setShowAvatarSheet(true);
  };

  const saveAvatar = () => {
    const src = RNImage.resolveAssetSource(AVATARS[tempIdx]);
    if (src?.uri) setAvatarUrl(src.uri);
    setShowAvatarSheet(false);
  };

  return (
    <Safe>
      <Scroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Header>
          <Title>My page</Title>
          <IconImage source={require('../../../assets/images/IsolationMode.png')} />
        </Header>

        <ProfileView>
          <AvatarPress onPress={openAvatarSheet}>
            <EditAvatar />
          </AvatarPress>

          <Name>{MOCK_ME.name}</Name>
          <Email>{MOCK_ME.email}</Email>

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
            <CountNumber>{MOCK_ME.receivedCount}</CountNumber>
          </CountItem>
          <Divider />
          <CountItem onPress={() => router.push('/mypage/follows?tab=sent')}>
            <CountLabel>Sent</CountLabel>
            <CountNumber>{MOCK_ME.sentCount}</CountNumber>
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

        <RowLink onPress={() => { }}>
          <RowLeft>Account Logout</RowLeft>
          <Chevron>›</Chevron>
        </RowLink>
        <RowSeparator />

        <DeletePressable onPress={confirmDelete}>
          <DeleteText>Delete Account</DeleteText>
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
                  <AvatarItem key={idx} onPress={() => setTempIdx(idx)}>
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

              <AvatarItem onPress={() => { }}>
                <CameraCircle>
                  <Ionicons name="camera" size={22} color="#cfd4da" />
                </CameraCircle>
              </AvatarItem>
            </AvatarRow>

            <ButtonRow>
              <CustomButton
                label="Cancel"
                filled={false}
                onPress={() => setShowAvatarSheet(false)}
              />
              <Gap />
              <CustomButton label="Save" tone="mint" filled onPress={saveAvatar} />
            </ButtonRow>
          </Sheet>
        </SheetOverlay>
      </Modal>
    </Safe>
  );
}

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

const AvatarPress = styled.Pressable`
  position: relative;
`;

const Name = styled.Text`
  margin-top: 8px;
  font-size: 16px;
  color: #ffffff;
  font-family: 'PlusJakartaSans_700Bold';
`;

const Email = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #b7babd;
  font-family: 'PlusJakartaSans_400Regular';
`;

const EditButtonWrap = styled.View`
  align-self: stretch;
  padding: 12px 16px 0 16px;
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
  margin: 22px 16px 10px 16px;
`;

function SectionTitleIcon() {
  return (
    <Ionicons
      name="person-outline"
      size={12}
      color="#9aa0a6"
      style={{ marginRight: 6, transform: [{ translateY: 1 }] }}
    />
  );
}

function SectionTitleIconGlobe() {
  return (
    <Image
      source={require('@/assets/icons/global.png')}
      resizeMode="contain"
      style={{
        width: 12,
        height: 12,
        marginRight: 6,
        tintColor: '#9aa0a6',
        transform: [{ translateY: 1 }],
      }}
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
  border-radius: 12px;
  padding: 8px;
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

const DeletePressable = styled.Pressable`
  padding: 16px;
  margin-top: 8px;
`;

const DeleteText = styled.Text`
  color: #ff5a5a;
  font-size: 14px;
  font-family: 'PlusJakartaSans_600SemiBold';
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
  background: #30F59B;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: #353637;
`;

const CameraCircle = styled.View`
  width: 68px;
  height: 68px;
  border-radius: 34px;
  background: #1f2021;
  align-items: center;
  justify-content: center;
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
