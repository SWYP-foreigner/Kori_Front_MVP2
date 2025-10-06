import styled from 'styled-components/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const AllSpaceRoomBox = ({ data }) => {
  const router = useRouter();
  const onhandleNext = () => {
    const roomId = data.roomId ?? data.chatRoomId;
    router.push({
      pathname: '/screens/chatscreen/LinkedSpaceDetail',
      params: {
        roomId: roomId, // props에서 바로 가져옴
      },
    });
  };
  console.log('AllSpaceRoom', data);
  return (
    <AllSpacesBox onPress={onhandleNext}>
      <AllSpaceTitleContainer>
        <AllSpaceTitle>{data.roomName}</AllSpaceTitle>
        <AllSpaceTitleContent>
          {data.description
            ? data.description.length > 25
              ? data.description.slice(0, 25) + '...'
              : data.description
            : ''}
        </AllSpaceTitleContent>
        <AllSpaceMemberContainer>
          <MaterialIcons name="person-outline" size={16} color="#949899" />
          <AllSpaceMemberCount>{data.userCount ?? data.participantCount} members</AllSpaceMemberCount>
        </AllSpaceMemberContainer>
      </AllSpaceTitleContainer>
      <AllSpaceImageContainer>
        <AllSpaceImage
          source={
            data.roomImageUrl
              ? { uri: data.roomImageUrl } // URL이 있으면 원격 이미지
              : require('@/assets/images/character1.png') // 없으면 로컬 디폴트 이미지
          }
        />
      </AllSpaceImageContainer>
    </AllSpacesBox>
  );
};

export default AllSpaceRoomBox;

const AllSpacesBox = styled.TouchableOpacity.attrs({
  activeOpacity: 0.3, // 눌렀을 때 살짝만 투명
  delayPressIn: 50, // 눌림 감지 지연 → 깜빡임 완화
})`
  height: 120px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: #353637;
`;

const AllSpaceTitleContainer = styled.View`
  width: 65%;
  flex-direction: column;
  justify-content: center;
  margin-right: 17px;
`;
const AllSpaceTitle = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;
const AllSpaceTitleContent = styled.Text`
  color: #cccfd0;
  font-size: 13px;
  font-family: PlusJakartaSans_300Light;
  margin-top: 3px;
`;
const AllSpaceMemberContainer = styled.View`
  margin-top: 20px;
  flex-direction: row;
`;
const AllSpaceMemberCount = styled.Text`
  margin-left: 3px;
  color: #949899;
  font-size: 12px;
`;
const AllSpaceImageContainer = styled.View`
  background-color: #353637;
  width: 80px;
  height: 80px;
  border-radius: 100px;
  margin: 20px 0px 10px 15px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
const AllSpaceImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: contain;
`;
