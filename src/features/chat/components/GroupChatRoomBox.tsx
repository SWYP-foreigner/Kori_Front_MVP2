import api from '@/api/axiosInstance';
import AllSpaceRoomBox from '@/src/features/chat/components/AllSpaceRoomBox';
import BuzzingRoomBox from '@/src/features/chat/components/BuzzingRoomBox';
import { useRouter } from 'expo-router';
import React, { memo, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';

// 🔹 데이터 타입
type BuzzingData = {
  roomId: number;
  roomImageUrl: string;
  roomName: string;
  description: string;
  userCount: string;
};

type AllSpaceData = BuzzingData;

// 🔹 memo 적용
const MemoizedBuzzingRoomBox = memo(({ data }: { data: BuzzingData }) => <BuzzingRoomBox data={data} />);

const MemoizedAllSpaceRoomBox = memo(({ data }: { data: AllSpaceData }) => <AllSpaceRoomBox data={data} />);

const GroupChatRoomBox = () => {
  const [buzzingSpaces, setBuzzingSpaces] = useState<BuzzingData[]>([]);
  const [allSpaces, setAllSpaces] = useState<AllSpaceData[]>([]);
  const router = useRouter();

  const getBuzzingData = async () => {
    const res = await api.get('/api/v1/chat/group/popular');
    return res.data.data;
  };

  const getAllSpaceData = async () => {
    const res = await api.get('/api/v1/chat/group/latest');

    return res.data.data;
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [Buzzing_Data, AllSpace_Data] = await Promise.all([getBuzzingData(), getAllSpaceData()]);
        setBuzzingSpaces(Buzzing_Data);
        setAllSpaces(AllSpace_Data);
      } catch (err) {
        console.error('Linked Space 불러오기 실패:', err);
      }
    };
    fetchRooms();
  }, []);

  // 🔹 ListHeaderComponent를 분리
  const ListHeader = () => (
    <View>
      <GroupTitleContainer>
        <GroupTitleText>Buzzing Spaces</GroupTitleText>
      </GroupTitleContainer>

      <BuzzingContainer>
        <FlatList
          data={buzzingSpaces}
          renderItem={({ item }) => <MemoizedBuzzingRoomBox data={item} />}
          keyExtractor={(item) => item.roomId.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5} // 초기 렌더링 아이템 수
          maxToRenderPerBatch={5} // 배치당 렌더링 아이템 수
          windowSize={5} // 렌더링 범위
        />
      </BuzzingContainer>

      <GroupTitleContainer>
        <GroupTitleText>All Spaces</GroupTitleText>
      </GroupTitleContainer>
    </View>
  );

  return (
    <Container>
      <FlatList
        data={allSpaces}
        renderItem={({ item }) => <MemoizedAllSpaceRoomBox data={item} />}
        keyExtractor={(item) => item.roomId.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true} // 화면 밖 요소 메모리 해제
      />
    </Container>
  );
};

export default GroupChatRoomBox;

// 🔹 스타일
const Container = styled.View`
  flex: 1;
`;

const GroupTitleContainer = styled.View`
  justify-content: center;
  height: 70px;
`;

const GroupTitleText = styled.Text`
  font-family: PlusJakartaSans_700Bold;
  font-size: 18px;
  color: #ffffff;
`;

const BuzzingContainer = styled.View`
  height: 236px;
`;
