import FriendCard from '@/components/FriendCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

type Tab = 'received' | 'sent';

type FriendItem = {
  id: number;
  name: string;
  country: string;
  birth?: number;
  purpose: string;
  languages: string[];
  personalities: string[];
  bio?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_RECEIVED: FriendItem[] = [
  {
    id: 101,
    name: 'Jenny',
    country: 'United States',
    birth: 2025,
    purpose: 'Business',
    languages: ['EN', 'KO'],
    personalities: [
      'Exploring Cafés',
      'Board Games',
      'Doing Nothing',
      'K-Food Lover',
      'K-Drama Lover',
    ],
    bio: 'Hi there!',
  },
  {
    id: 102,
    name: 'Alex',
    country: 'Canada',
    birth: 2025,
    purpose: 'Travel',
    languages: ['EN'],
    personalities: ['Hiking', 'Reading'],
    bio: 'Hey!',
  },
];

const MOCK_SENT: FriendItem[] = [
  {
    id: 201,
    name: 'Tom',
    country: 'France',
    birth: 2025,
    purpose: 'Travel',
    languages: ['EN'],
    personalities: ['Board Games', 'K-Food Lover'],
    bio: 'Bonjour!',
  },
  {
    id: 202,
    name: 'Mina',
    country: 'Korea',
    birth: 2025,
    purpose: 'Education',
    languages: ['KO', 'EN'],
    personalities: ['Exploring Cafés', 'K-Drama Lover'],
    bio: 'Nice to meet you!',
  },
];

export default function FollowListScreen() {
  const [tab, setTab] = useState<Tab>('received');

  // received
  const rRef = useRef<import('react-native').FlatList>(null);
  const rList = useMemo(() => MOCK_RECEIVED, []);
  const rTotal = rList.length;
  const [rPage, setRPage] = useState(1);

  const sRef = useRef<import('react-native').FlatList>(null);
  const sList = useMemo(() => MOCK_SENT, []);
  const sTotal = sList.length;
  const [sPage, setSPage] = useState(1);

  const goToIndex = (
    ref: any,
    total: number,
    idx0: number
  ) => {
    if (!ref?.current) return;
    const safe = Math.max(0, Math.min(total - 1, idx0));
    ref.current.scrollToIndex({ index: safe, animated: true });
  };

  const handleAccept = (userId: number) => {
    console.log('accept', userId);
  };

  const handleCancelRequest = (userId: number) => {
    console.log('cancel request', userId);
  };

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>

        <HeaderCenter>
          <Title>Friends List</Title>
        </HeaderCenter>

        <RightSlot />
      </Header>

      <TabsWrap>
        <TabsRow>
          <TabItem
            active={tab === 'received'}
            onPress={() => setTab('received')}
          >
            <TabText active={tab === 'received'}>Received</TabText>
          </TabItem>

          <TabItem
            active={tab === 'sent'}
            onPress={() => setTab('sent')}
          >
            <TabText active={tab === 'sent'}>Sent</TabText>
          </TabItem>
        </TabsRow>

        <TabsBottomLine />
      </TabsWrap>

      {tab === 'received' ? (
        <>
          <HList
            ref={rRef}
            data={rList}
            keyExtractor={(i) => String(i.id)}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * i,
              index: i,
            })}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setRPage(Math.round(x / SCREEN_WIDTH) + 1);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Page style={{ width: SCREEN_WIDTH }}>
                <Inner>
                  <FriendCard
                    userId={item.id}
                    name={item.name}
                    country={item.country}
                    birth={item.birth}
                    purpose={item.purpose}
                    languages={item.languages}
                    personalities={item.personalities}
                    bio={item.bio}
                    collapsible={false}
                    mode="received"
                    onAccept={handleAccept}
                    onCancel={handleCancelRequest}
                    onChat={() => { }}
                    isFollowed={false}
                  />
                </Inner>
              </Page>
            )}
          />

          {rTotal > 1 && (
            <Pager>
              <PagerBtn
                disabled={rPage <= 1}
                onPress={() => goToIndex(rRef, rTotal, rPage - 2)}
              >
                <PagerArrow>‹</PagerArrow>
              </PagerBtn>

              <PagerText>{` ${rPage} / ${rTotal} `}</PagerText>

              <PagerBtn
                disabled={rPage >= rTotal}
                onPress={() => goToIndex(rRef, rTotal, rPage)}
              >
                <PagerArrow>›</PagerArrow>
              </PagerBtn>
            </Pager>
          )}
        </>
      ) : (
        <>
          <HList
            ref={sRef}
            data={sList}
            keyExtractor={(i) => String(i.id)}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * i,
              index: i,
            })}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setSPage(Math.round(x / SCREEN_WIDTH) + 1);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Page style={{ width: SCREEN_WIDTH }}>
                <Inner>
                  <FriendCard
                    userId={item.id}
                    name={item.name}
                    country={item.country}
                    birth={item.birth}
                    purpose={item.purpose}
                    languages={item.languages}
                    personalities={item.personalities}
                    bio={item.bio}
                    collapsible={false}
                    mode="sent"
                    onAccept={handleAccept}
                    onCancel={handleCancelRequest}
                    onChat={() => { }}
                    isFollowed={false}
                  />
                </Inner>
              </Page>
            )}
          />

          {sTotal > 1 && (
            <Pager>
              <PagerBtn
                disabled={sPage <= 1}
                onPress={() => goToIndex(sRef, sTotal, sPage - 2)}
              >
                <PagerArrow>‹</PagerArrow>
              </PagerBtn>

              <PagerText>{` ${sPage} / ${sTotal} `}</PagerText>

              <PagerBtn
                disabled={sPage >= sTotal}
                onPress={() => goToIndex(sRef, sTotal, sPage)}
              >
                <PagerArrow>›</PagerArrow>
              </PagerBtn>
            </Pager>
          )}
        </>
      )}
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1D1E1F;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
`;

const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;

const HeaderCenter = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const RightSlot = styled.View`
  width: 40px;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 20px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const TabsWrap = styled.View`
  position: relative;
  padding: 0 16px;
  margin-top: 4px;
`;

const TabsRow = styled.View`
  flex-direction: row;
`;

const TabItem = styled.Pressable<{ active: boolean }>`
  flex: 1;
  align-items: center;
  padding: 12px 6px;
  border-bottom-width: 2px;
  border-bottom-color: ${({ active }) =>
    active ? '#30F59B' : 'transparent'};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#30F59B' : '#cfcfcf')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const TabsBottomLine = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: #212325;
`;

const HList = styled.FlatList`` as unknown as typeof import('react-native').FlatList;

const Page = styled.View`
  justify-content: center;
`;

const Inner = styled.View`
  padding: 0 16px;
  margin-top: -27px;
`;

const Pager = styled.View`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const PagerBtn = styled.Pressable<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  padding: 6px 10px;
`;

const PagerArrow = styled.Text`
  color: #b7babd;
  font-size: 20px;
  padding: 0 4px;
`;

const PagerText = styled.Text`
  color: #b7babd;
  font-size: 12px;
  font-family: 'PlusJakartaSans_400Regular';
`;
