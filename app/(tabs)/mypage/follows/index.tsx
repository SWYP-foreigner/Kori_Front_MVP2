import CustomButton from '@/components/CustomButton';
import FriendCard from '@/components/FriendCard';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';

/** 받은/보낸 요청만 */
const MOCK_RECEIVED = [
    {
        id: 101, name: 'Jenny', country: 'United States', birth: 2025, purpose: 'Business',
        languages: ['EN', 'KO'], personalities: ['Exploring Cafés', 'Board Games', 'Doing Nothing', 'K-Food Lover', 'K-Drama Lover'],
        bio: 'Hi there!'
    },
];
const MOCK_SENT = [
    {
        id: 201, name: 'Tom', country: 'France', birth: 2025, purpose: 'Travel',
        languages: ['EN'], personalities: ['Board Games', 'K-Food Lover'], bio: 'Bonjour!'
    },
];

type Tab = 'received' | 'sent';

export default function FollowListScreen() {
    const [tab, setTab] = useState<Tab>('received');
    const [showCancel, setShowCancel] = useState<number | null>(null);

    const list = useMemo(() => (tab === 'received' ? MOCK_RECEIVED : MOCK_SENT), [tab]);

    return (
        <Safe>
            {/* 헤더 */}
            <Header>
                <Back onPress={() => router.back()}>{'‹'}</Back>
                <HeaderTitle>Friends List</HeaderTitle>
                <IconRow>
                    <Icon>⌕</Icon>
                    <Icon style={{ marginLeft: 14 }}>⋯</Icon>
                </IconRow>
            </Header>

            {/* 탭: Received / Sent 만 */}
            <Tabs>
                <TabBtn active={tab === 'received'} onPress={() => setTab('received')}>
                    <TabTxt active={tab === 'received'}>Received</TabTxt>
                </TabBtn>
                <TabBtn active={tab === 'sent'} onPress={() => setTab('sent')}>
                    <TabTxt active={tab === 'sent'}>Sent</TabTxt>
                </TabBtn>
            </Tabs>

            {/* 리스트 (FriendCard 그대로, 버튼만 교체) */}
            <List
                data={list}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10, paddingBottom: 56 }}
                renderItem={({ item }) => {
                    const footerSlot =
                        tab === 'received' ? (
                            <ActionRow>
                                <CustomButton label="+ Accept" tone="mint" filled onPress={() => { }} />
                                <CustomButton label="✕ Decline" tone="black" filled={false} onPress={() => { }} />
                            </ActionRow>
                        ) : (
                            <ActionRow>
                                <CustomButton label="Requested" tone="black" filled={false} disabled />
                                <CustomButton label="Chat" tone="black" filled onPress={() => { }} />
                            </ActionRow>
                        );

                    return (
                        <>
                            <FriendCard
                                userId={item.id}
                                name={item.name}
                                country={item.country}
                                birth={item.birth}
                                purpose={item.purpose}
                                languages={item.languages}
                                personalities={item.personalities}
                                bio={item.bio}
                                isFollowed={false}
                                onFollow={() => { }}
                                onChat={() => { }}
                                footerSlot={footerSlot}
                            />
                            {tab === 'sent' && (
                                <TrailingRow>
                                    <SmallLink onPress={() => setShowCancel(item.id)}>Cancel follow?</SmallLink>
                                </TrailingRow>
                            )}
                        </>
                    );
                }}
            />

            {/* 요청 취소 모달 (Sent 전용) */}
            {showCancel !== null && (
                <Overlay>
                    <Backdrop onPress={() => setShowCancel(null)} />
                    <Modal>
                        <ModalTitle>Are you sure you want to cancel follow?</ModalTitle>
                        <ModalDesc>If you cancel follow, This will be removed from your friends list.</ModalDesc>
                        <ModalRow>
                            <ModalBtn onPress={() => setShowCancel(null)}>
                                <ModalBtnText>Cancel</ModalBtnText>
                            </ModalBtn>
                            <ModalBtnDanger onPress={() => { setShowCancel(null); }}>
                                <ModalBtnDangerText>Action</ModalBtnDangerText>
                            </ModalBtnDanger>
                        </ModalRow>
                    </Modal>
                </Overlay>
            )}
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
    flex:1;
    background:#0f1011;
`;
const Header = styled.View`
    height: 48px;
    padding: 0 12px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;
const Back = styled.Pressable`
    width:40px;
    align-items:flex-start;
`;
const HeaderTitle = styled.Text`
    color:#fff;
    font-size:16px;
    font-family:'PlusJakartaSans_700Bold';
`;
const IconRow = styled.View`
    flex-direction:row;
    align-items:center;
`;
const Icon = styled.Text`
    color:#cfd4da;
    font-size:16px;
`;

const Tabs = styled.View`
    flex-direction:row;
    padding:10px;
    gap:8px;
`;
const TabBtn = styled.Pressable<{ active: boolean }>`
  flex:1;
  padding:10px;
  border-radius:12px;
  align-items:center;
  background-color: ${({ active }) => active ? '#121314' : '#0b0c0c'};
  border: 1px solid #2a2b2c;
`;
const TabTxt = styled.Text<{ active: boolean }>`
  color: ${({ active }) => active ? '#30F59B' : '#cfcfcf'};
  font-family:'PlusJakartaSans_600SemiBold';
`;

const List = styled.FlatList`
` as unknown as typeof import('react-native').FlatList;

const ActionRow = styled.View`
    margin-top: 16px;
    flex-direction: row;
    gap: 14px;
  `;
const TrailingRow = styled.View`
    margin: 8px 24px 12px 24px;
    align-items: flex-end;
 `;
const SmallLink = styled.Text`
    color:#8aa0ff;
    font-size:12px;
    font-family:'PlusJakartaSans_600SemiBold';
`;

/* 모달 */
const Overlay = styled.View`
    position: absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    justify-content: center;
    align-items: center;
`;
const Backdrop = styled.Pressable`
    position: absolute;
    top:0;
    eft:0;
    right:0;
    bottom:0;
    background: rgba(0,0,0,0.5);
`;
const Modal = styled.View`
    width:84%;
    background:#fff;
    border-radius:12px;
    padding:16px;
    z-index:1;
`;
const ModalTitle = styled.Text`
    color:#1a1c1e;
    font-size:14px;
    font-family:'PlusJakartaSans_700Bold';
`;
const ModalDesc = styled.Text`
    margin-top:6px;
    color:#5a5f64;
    font-size:12px;
    font-family:'PlusJakartaSans_400Regular';
`;
const ModalRow = styled.View`
    margin-top:12px;
    flex-direction:row;
    gap:10px;
`;
const ModalBtn = styled.Pressable`
    flex:1;
    border-radius:8px;
    padding:10px;
    background:#f1f3f5;
    align-items:center;
`;
const ModalBtnText = styled.Text`
    color:#1a1c1e;
    font-family:'PlusJakartaSans_600SemiBold';
`;
const ModalBtnDanger = styled.Pressable`
    flex:1;
    border-radius:8px;
    padding:10px;
    background:#ffeded;
    align-items:center;
`;
const ModalBtnDangerText = styled.Text`
    color:#e03131;
    font-family:'PlusJakartaSans_700Bold';
`;
