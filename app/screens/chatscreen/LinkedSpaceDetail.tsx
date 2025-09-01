import React,{useState,useEffect} from "react";
import styled from "styled-components/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView ,FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/api/axiosInstance";
import { useRouter } from 'expo-router';

type RoomDetail = {
  chatRoomId: number;
  roomName: string;
  description: string;
  ownerId: number;
  ownerFirstName: string;
  ownerLastName: string;
  ownerImageUrl: string;
  roomImageUrl: string;
  participantCount: number;
  participantsImageUrls: string[];
};

const LinkedSpaceDetail=()=>{
    const { roomId }= useLocalSearchParams<{ roomId : string }>();
    const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
    const router = useRouter();
    
  const getChatRoomDetail=async()=>{
    const res=await api.get(`/api/v1/chat/rooms/group/${roomId}`);
    console.log("Detail",res.data);
    return res.data.data
  };

  const JoinRoom=async()=>{
    const res=await api.post(`/api/v1/chat/rooms/group/${roomId}/join`)
    console.log("방 가입 여부",res);
    router.back();

  };

   // 컴포넌트가 화면에 나타날 때 한 번만 서버에서 채팅방 리스트를 가져옴
      useEffect(() => {
        const fetchDetail = async () => {
          try {
            const detailData=await getChatRoomDetail();
            setRoomDetail(detailData);
    
          } catch (err) {
            console.error('Linked Space 불러오기 실패:', err);
          }
        };
        fetchDetail();
      }, []); // 빈 배열 → 마운트 시 한 번만 실행


    return(
        <Container>
            
            <BackgroundContainer>
                <Background
                    source={require("@/assets/images/background1.png")}
                    resizeMode="contain"> 
                    <ProfileBox>    
                        <ProfileImage source={{ uri: roomDetail?.roomImageUrl }} />
                    </ProfileBox>
                </Background>  
            </BackgroundContainer>
            <DetailContainer>
                <DetailTopContainer>
                    <TitleContainer>
                        <TitleText>{roomDetail?.roomName}</TitleText>
                    </TitleContainer>
                    <MembersTextContainer>
                        <MembersText>Members</MembersText>
                    </MembersTextContainer>
                    <HostContainer>
                       <HostImageBox>
                        <HostImage  source={{ uri: roomDetail?.ownerImageUrl }}/>
                       </HostImageBox>
                       <HostNameText>{roomDetail?.ownerFirstName}</HostNameText>
                       <HostBox>
                        <HostText>Host</HostText>
                       </HostBox>
                    </HostContainer>
                    <MembersContainer>
                        <InMemberContainer>
                            <MaterialIcons name="person-outline" size={15} color="#949899" />
                            <InMemberText>{roomDetail?.participantCount} members in</InMemberText>
                            <Divider/>
                        </InMemberContainer>
                        <MemberImageContainer>
                            <MembersBox>
                                <FlatList
                                    data={roomDetail?.participantsImageUrls.slice(0, 5)} // 최대 5개
                                    keyExtractor={(item, index) => index.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                    <MemberImageBox>
                                        <MemberImage source={{ uri: item }} />
                                    </MemberImageBox>
                                    )}
                                />
                            </MembersBox>
                            <MemberCountText>+{roomDetail ? roomDetail.participantCount + 1 : 0}</MemberCountText>
                        </MemberImageContainer>
                    </MembersContainer>
                </DetailTopContainer>
                <DetailDivider/>
                <DetailBottomContainer>
                    <BottomTitleContainer>
                        <BottomTitleText>Space Introduction </BottomTitleText>
                    </BottomTitleContainer>
                    <BottomContentContainer>
                        <BottomContent>
                            {roomDetail?.description}
                        </BottomContent>
                    </BottomContentContainer>
                </DetailBottomContainer>
               
                    <NextButton onPress={JoinRoom}>
                    <ButtonText>Join</ButtonText>
                    </NextButton>

                <BottomSpacer/>
            </DetailContainer>
        </Container>
    );


};



export default LinkedSpaceDetail;

const Container=styled.View`
    flex:1;
     background-color: #1d1e1f;
`;
const BackgroundContainer=styled.View`
    flex:1.2;
`;
const Background = styled.ImageBackground`
  flex: 1;
  justify-content: center;  /* ProfileBox 세로 정렬 */
  align-items: center;      /* ProfileBox 가로 정렬 */
`;

const ProfileBox=styled.View`
    width:150px;
    height:150px;
    border-radius:100px;
    align-items:center;
    justify-content:center;
    overflow:hidden;

`;
const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:cover;
`;
const DetailContainer=styled.View`
    flex:2;
`;

const DetailTopContainer=styled.View`
    flex:1.7;
    margin-left:10px;
    
`;
const TitleContainer=styled.View`
    height:25%;
    justify-content:center;
`;
const TitleText=styled.Text`
    font-family:PlusJakartaSans_600SemiBold;
    color:#ffffff;
    font-size:24px;
    margin-left:10px;
    
`;
const MembersTextContainer=styled.View`
    height:20%;
    justify-content:center;
    
`;
const MembersText=styled.Text`
    margin-left:10px;
    font-family:PlusJakartaSans_500Medium;
    font-size:13px;
    color:#848687;
`;
const HostContainer=styled.View`
    height:30%;
    flex-direction:row;
    align-items:center;
`;
const HostImageBox=styled.View`
    width:20%;
    overflow:hidden;
`;
const HostImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode: cover;
`;
const HostNameText=styled.Text`
    font-size:15px;
    margin-left:12px;
    font-family: PlusJakartaSans_500Medium;
    color:#FFFFFF;
`;
const HostBox=styled.View`
    background-color:#02F59B40;
    margin-left:15px;
    border-radius:4px;
    justify-content:center;
    align-items:center;
`;
const HostText=styled.Text`
    font-family:PlusJakartaSans_500Medium;
    color:#FFFFFF;
    padding:6px 5px 6px 5px;
    font-size:11px;
`;
const MembersContainer=styled.View`
    flex:1;
    flex-direction:row;
`;
const InMemberContainer=styled.View`
    margin-left:10px;
    width:30%;
    align-items:center;
    flex-direction:row;
`;
const InMemberText=styled.Text`
    margin-left:3px;
    color:#949899;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:11px;
`;

const Divider=styled.View`
    height:12px;
    width:1px;
    background-color:#616262;
    margin-left:11px;
`;
const MemberImageContainer=styled.View`
    width:50%;
    flex-direction:row;
    align-items:center;
    `;
const MembersBox=styled.View`
    height:30px;
    flex-direction:row;
`;
const MemberImageBox=styled.View`
    width:30px;
    height:30px;
    flex-direction:row;    
`;
const MemberImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode: contain;
`;
const MemberCountText=styled.Text`
    color:#CCCFD0;
    font-size:11px;
    font-family:PlusJakartaSans_600SemiBold; 
    margin-left:5px;   
`;
const DetailDivider=styled.View`
    height:4px;
    background-color:#353637;
    margin:10px 0px;
`;
const DetailBottomContainer=styled.View`
    flex:2;
    margin-left:10px;
`;
const BottomTitleContainer=styled.View`
    height:40px;
    justify-content:center;
`;
const BottomTitleText=styled.Text`
    color:#848687;
    font-family: PlusJakartaSans_500Medium;
    font-size:13px;
`;
const BottomContentContainer=styled.View`
    height:100%;
`;
const BottomContent=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_300Light;
    font-size:15px;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
  margin:10px;
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';

`;

const BottomSpacer = styled.View`
  height: 25px;
`;

