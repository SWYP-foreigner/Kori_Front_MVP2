import styled from "styled-components/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';


const AllSpaceRoomBox=({data})=>{
    const router = useRouter();
     const onhandleNext=()=>{
      router.push({
      pathname: '../screens/chatscreen/LinkedSpaceDetail',
      params: { 
        roomId: data.roomId,       // props에서 바로 가져옴
      },
    });
    };

    return(
        <AllSpacesBox onPress={onhandleNext}>
        <AllSpaceTitleContainer>
            <AllSpaceTitle>{data.roomName}</AllSpaceTitle>
            <AllSpaceTitleContent>{data.description}</AllSpaceTitleContent>
            <AllSpaceMemberContainer>
             <MaterialIcons name="person-outline" size={16} color='#949899' />
            <AllSpaceMemberCount>{data.userCount} members</AllSpaceMemberCount>
        </AllSpaceMemberContainer>
        </AllSpaceTitleContainer>
        <AllSpaceImageContainer>
            <AllSpaceImage source={{ uri: data.roomImageUrl }}/>
        </AllSpaceImageContainer>
        </AllSpacesBox>
    );

};




export default AllSpaceRoomBox;


const AllSpacesBox=styled.TouchableOpacity`
    
    height:120px;
    flex-direction:row;
    border-bottom-width: 1px;
    border-bottom-color: #353637;

`;

const AllSpaceTitleContainer=styled.View`
    width:65%;
    flex-direction:column;
    justify-content:center;
    margin-right:17px;
`;
const AllSpaceTitle=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_500Medium;
    font-size:16px;

`;
const AllSpaceTitleContent=styled.Text`
    color:#CCCFD0;
    font-size:13px;
    font-family:PlusJakartaSans_300Light;
    margin-top:3px;    
`;
const AllSpaceMemberContainer=styled.View`
    margin-top:20px;
    flex-direction:row;
`;
const AllSpaceMemberCount=styled.Text`
    margin-left:3px;
    color:#949899;
    font-size:12px;
`;
const AllSpaceImageContainer=styled.View`
    width:80px;
    height:80px;
    border-radius:100px;
    margin:20px 0px 10px 15px;
    align-items:center;
    justify-content:center;
    overflow: hidden;
`;
const AllSpaceImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode: contain;
`;