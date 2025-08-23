import styled from "styled-components/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const AllSpaceRoomBox=({data})=>{

    return(
        <AllSpacesBox>
        <AllSpaceTitleContainer>
            <AllSpaceTitle>{data.title}</AllSpaceTitle>
            <AllSpaceTitleContent>{data.content}</AllSpaceTitleContent>
            <AllSpaceMemberContainer>
             <MaterialIcons name="person-outline" size={16} color='#949899' />
            <AllSpaceMemberCount>{data.member} members</AllSpaceMemberCount>
        </AllSpaceMemberContainer>
        </AllSpaceTitleContainer>
        <AllSpaceImageContainer>
            <AllSpaceImage source={require("../assets/images/character2.png")}/>
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
    width:30%;
    justify-content:center;
    align-items:center;
`;
const AllSpaceImage=styled.Image`
    width:75%;
    height:75%;
    resize-mode: contain;
`;