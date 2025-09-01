import React ,{useEffect,useState}from "react";
import styled from "styled-components/native";
import BuzzingRoomBox from "@/components/BuzzingRoomBox";
import AllSpaceRoomBox from "@/components/AllSpaceRoomBox";
import { FlatList, View } from "react-native";
import api from "@/api/axiosInstance";
import { useRouter } from 'expo-router';

type BuzzingData={
  roomId:number,
  roomImageUrl:string,
  roomName:string,
  description: string,
  userCount:string
};

type AllSpaceData={
  roomId:number,
  roomImageUrl:string,
  roomName:string,
  description: string,
  userCount:string
};
const GroupChatRoomBox = () => {
  const [buzzingSpaces,setBuzzingSpaces]=useState<BuzzingData[]>([]);
  const [allSpaces,setAllSpaces]=useState<AllSpaceData[]>([]);
   const router = useRouter();
   // Buzzing Spaces -> api 요청 api/v1/chat/group/popular
  // All Spaces -> api 요청  api/v1/chat/group/latest
  

  const getBuzzingData=async()=>{
    const res=await api.get('/api/v1/chat/group/popular');
    return res.data.data
  };
  const getAllSpaceData=async()=>{
    const res=await api.get('/api/v1/chat/group/latest');
    return res.data.data
  }

     // ================== 1️⃣ 초기 채팅방 불러오기 ==================
  // 컴포넌트가 화면에 나타날 때 한 번만 서버에서 채팅방 리스트를 가져옴
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const Buzzing_Data=await getBuzzingData();
        const AllSpace_Data=await getAllSpaceData();
        setBuzzingSpaces(Buzzing_Data);
        setAllSpaces(AllSpace_Data);

      } catch (err) {
        console.error('Linked Space 불러오기 실패:', err);
      }
    };
    fetchRooms();
  }, []); // 빈 배열 → 마운트 시 한 번만 실행


  return (
    <Container>
      <FlatList
        data={allSpaces}
        renderItem={({ item }) => <AllSpaceRoomBox data={item} />}
        keyExtractor={(item) => item.roomId.toString()}
        showsVerticalScrollIndicator={false}   
        ListHeaderComponent={
          <View>
            <GroupTitleContainer>
              <GroupTitleText>Buzzing Spaces</GroupTitleText>
            </GroupTitleContainer>
            <BuzzingContainer>
              <FlatList
                data={buzzingSpaces}
                renderItem={({ item }) => <BuzzingRoomBox data={item} />}
                keyExtractor={(item) => item.roomId.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </BuzzingContainer>

            <GroupTitleContainer>
              <GroupTitleText>All Spaces</GroupTitleText>
            </GroupTitleContainer>
          </View>
        }
      />
    </Container>
  );
};

export default GroupChatRoomBox;

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
