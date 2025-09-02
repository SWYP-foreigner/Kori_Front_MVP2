import styled from 'styled-components/native';
import React,{useState,useEffect} from 'react';
import { SafeAreaView, Text,StatusBar ,FlatList ,TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import api from '@/api/axiosInstance';
import MyChatRoomBox from '@/components/MyChatRoomBox';
import AllSpaceRoomBox from '@/components/AllSpaceRoomBox';
import { useLocalSearchParams } from "expo-router";

type MyChatRoom={
  "roomId": number,
  "roomName": string,
  "lastMessageContent": string,
  "lastMessageTime": string,
  "roomImageUrl": string,
  "unreadCount": number,
  "participantCount": number,
};

type GroupChatRoom={
    "chatRoomId": number,
    "roomName": string,
    "description": string,
    "roomImageUrl": string,
    "participantCount": number
};



const SearchChatRoom=()=>{
    const router = useRouter();
    const [searchText,setSearchText]=useState('');
    const [myChatRooms,setMyChatRooms]=useState<MyChatRoom[] >([]);
    const [groupChatRooms,setGroupChatRooms]=useState<GroupChatRoom[] >([]);
    const { isGroupChat } = useLocalSearchParams<{ isGroupChat?: string }>();
     // 문자열 → boolean 변환
    const isGroupChatBool = isGroupChat === "true";

    
    const getGroupChatRoom=async()=>{
        const res = await api.get(`/api/v1/chat/rooms/group/search?keyword=${encodeURIComponent(searchText)}`);
        const data:GroupChatRoom[]=res.data.data;
        console.log("그룹 톡방 검색",data);
        return data;
    };
    
    const getMyChatRoom=async()=>{
        const res = await api.get(`/api/v1/chat/rooms/search?roomName=${encodeURIComponent(searchText)}`);
        const data:MyChatRoom[]=res.data.data;
        console.log("내 채팅방 검색",data);
        return data;
    };

    useEffect(() => {
    const SearchRooms = async () => {
      if(!searchText) return
      try {
        if(isGroupChatBool)
        {
            const data=await getGroupChatRoom();
            setGroupChatRooms(data);
        }
        else{
            const data=await getMyChatRoom();
            setMyChatRooms(data);
        }
      } catch (err) {
        console.error('채팅방 검색 실패:', err);
      }
    };
    SearchRooms();
  }, [searchText]); // 빈 배열 → 마운트 시 한 번만 실행


    return(
        <Safe>
        <StatusBar barStyle="light-content" />
        <Container>
            <Header>
                <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="#CCCFD0" />
                </TouchableOpacity>
                <SearchContainer>
                    <Feather name="search" size={23} color="#CCCFD0" style={{ marginLeft: 8 }}  />
                    <SearchInputText
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder='Search Linked Space'
                        placeholderTextColor='#616262'

                    />
                {searchText&&
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <AntDesign name="closecircle" size={23} color="#CCCFD0" style={{ marginRight: 8 }}  />
                </TouchableOpacity>}
                </SearchContainer>
            </Header>

            <SearchScreen>
                {searchText && (
                    isGroupChatBool ? (
                        <FlatList
                        data={groupChatRooms}
                        keyExtractor={(item) => item.chatRoomId.toString()}
                        renderItem={({ item }) => <AllSpaceRoomBox data={item}/>}
                        showsVerticalScrollIndicator={false}/>
                    ) : (
                        <FlatList
                        data={myChatRooms}
                        keyExtractor={(item) => item.roomId.toString()}
                        renderItem={({ item }) => <MyChatRoomBox data={item} />}
                        showsVerticalScrollIndicator={false}
                        />
                    )
                    )}
            </SearchScreen>
        </Container>
    </Safe>);

};

export default SearchChatRoom;

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`

  flex: 1;
  padding: 0px 20px;
`;
const Header = styled.View`
  height:70px;
  flex-direction: row;
  align-items: center;
`;

const SearchScreen=styled.View` 
    flex:1;

`;
const SearchContainer=styled.View`
    width:85%;
    height:45px;
    background-color:#353637;
    flex-direction:row;
    margin-left:10px;
    align-items:center;
    justify-content:center;
    padding: 0px 3px;
`;
const SearchInputText=styled.TextInput`
    background-color:#353637;
    height:45px;
    flex:1;
    padding-left:10px;
    color:#FFFFFF;
    font-size:14px;
    font-family:PlusJakartaSans_400Regular;
`;

