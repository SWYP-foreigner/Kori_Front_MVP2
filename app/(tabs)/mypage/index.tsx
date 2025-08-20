import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import styled from 'styled-components/native';

// API 연동 전
const MOCK_ME = {
    name: 'Alice Kori, Kim',
    email: 'Kori@gmail.com',
    avatarUrl: undefined as string | undefined,
    receivedCount: 2,
    sentCount: 3,
};

export default function MyPageScreen() {
    const [showDelete, setShowDelete] = useState(false);

    return (
        <Safe>
            <Scroll
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 28 }}
            >
                {/* 헤더 */}
                <Header>
                    <Title>My page</Title>
                    <IconImage source={require('../../../assets/images/IsolationMode.png')} />
                </Header>

                {/* 프로필 히어로 */}
                <ProfileView>
                    <Avatar />
                    <Name>{MOCK_ME.name}</Name>
                    <Email>{MOCK_ME.email}</Email>

                    <EditButtonWrap>
                        <CustomButton
                            label="Edit Profile"
                            tone="mint"
                            filled
                            style={{ width: '100%', height: 44 }}
                            onPress={() => router.push('/mypage/edit')}
                        />
                    </EditButtonWrap>
                </ProfileView>
                <SectionSpacer />

                {/* 섹션: My Friends */}
                <SectionTitleRow>
                    <SectionTitleIcon />
                    <SectionTitle>My Friends</SectionTitle>
                </SectionTitleRow>

                <RowLink onPress={() => router.push('/mypage/friends')}>
                    <RowLeft>Friends List</RowLeft>
                    <Chevron>›</Chevron>
                </RowLink>
                <RowSeparator />

                {/* 섹션: Follow List */}
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

                {/* 섹션: Translate Setting */}
                <SectionTitleRow>
                    <SectionTitleIconGlobe />
                    <SectionTitle>Translate Setting</SectionTitle>
                </SectionTitleRow>

                <RowLink onPress={() => router.push('/mypage/translate')}>
                    <RowLeft>Chat Translation Language</RowLeft>
                    <Chevron>›</Chevron>
                </RowLink>
                <RowSeparator />

                {/* 섹션: My Account */}
                <SectionTitleRow>
                    <SectionTitleIconSetting />
                    <SectionTitle>My Account</SectionTitle>
                </SectionTitleRow>
                <RowLink onPress={() => { /* 로그아웃 로직 예정 */ }}>
                    <RowLeft>Account Logout</RowLeft>
                    <Chevron>›</Chevron>
                </RowLink>
                <RowSeparator />

                {/* Delete Account */}
                <DeletePressable onPress={() => setShowDelete(true)}>
                    <DeleteText>Delete Account</DeleteText>
                </DeletePressable>
            </Scroll>

            {/* 삭제 확인 모달 */}
            {showDelete && (
                <Overlay>
                    <Backdrop onPress={() => setShowDelete(false)} />
                    <ModalCard>
                        <ModalTitle>Are you sure you want to leave the this app?</ModalTitle>
                        <ModalDesc>After deleting it, you cannot restore it.</ModalDesc>
                        <ModalRow>
                            <ModalBtn onPress={() => setShowDelete(false)}>
                                <ModalBtnText>Cancel</ModalBtnText>
                            </ModalBtn>
                            <ModalBtnDelete onPress={() => { setShowDelete(false); /* 실제 삭제 연동 예정 */ }}>
                                <ModalBtnDeleteText>Delete</ModalBtnDeleteText>
                            </ModalBtnDelete>
                        </ModalRow>
                    </ModalCard>
                </Overlay>
            )}
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #0f1011;
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
  padding: 8px 16px 24px 16px;
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
  margin-bottom: 20px; 
`;

const SectionSpacer = styled.View`
  height: 12px;  /* 필요하면 16~20으로 키워도 OK */
`;

const SectionTitle = styled.Text`
  color: #9aa0a6;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const SectionTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 22px 16px 10px 16px; /* ↑ 이전 18/8 → 22/10 */
`;

const SectionTitleIcon = styled(Ionicons).attrs({
    name: 'person-outline',
    size: 12,
    color: '#9aa0a6',
})`
  margin-right: 6px;
  transform: translateY(1px);
`;

const SectionTitleIconGlobe = styled.Image.attrs({
    source: require('@/assets/icons/global.png'),
})`
  width: 12px;
  height: 12px;
  margin-right: 6px;
  resize-mode: contain;
  tint-color: #9aa0a6;
  transform: translateY(1px);
`;

const SectionTitleIconSetting = styled.Image.attrs({
    source: require('@/assets/icons/setting.png'),
})`
  width: 12px;
  height: 12px;
  margin-right: 6px;
  resize-mode: contain;
  tint-color: #9aa0a6;
  transform: translateY(1px);
`;

const RowLink = styled.Pressable`
  padding: 14px 16px; /* 16 → 14로 자연스러운 높이 */
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
  margin: 20px 16px 8px 16px; /* 16/6 → 20/8, 헤더 위쪽 여백 증가 */
  color: #e9ecef;
  font-size: 15px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const RowSeparator = styled.View`
  height: 1px;
  margin: 4px 16px 18px 16px; /* 아래쪽 18px로 증가 */
  background-color: #2a2b2c;
  opacity: 0.6;
`;

const CountCard = styled.View`
  margin: 10px 16px 12px 16px; /* 4/0 → 10/12 */
  background: #2a2f33;
  border-radius: 12px;
  padding: 8px;
  flex-direction: row;
  align-items: stretch;
`;

const Divider = styled.View`
  width: 1px;
  background-color: #454a4f;
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
  font-size: 14px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const CountNumber = styled.Text`
  margin-top: 2px;
  color: #ffffff;
  font-size: 18px;
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

const Overlay = styled.View`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  justify-content: center;
  align-items: center;
`;

const Backdrop = styled.Pressable`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
`;

const ModalCard = styled.Pressable`
  width: 84%;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
`;

const ModalTitle = styled.Text`
  color: #1a1c1e;
  font-size: 14px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const ModalDesc = styled.Text`
  margin-top: 6px;
  color: #5a5f64;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const ModalRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const ModalBtn = styled.Pressable`
  flex: 1;
  border-radius: 8px;
  padding: 10px;
  background: #f1f3f5;
  align-items: center;
`;

const ModalBtnText = styled.Text`
  color: #1a1c1e;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const ModalBtnDelete = styled.Pressable`
  flex: 1;
  border-radius: 8px;
  padding: 10px;
  background: #ffeded;
  align-items: center;
`;

const ModalBtnDeleteText = styled.Text`
  color: #e03131;
  font-family: 'PlusJakartaSans_700Bold';
`;
