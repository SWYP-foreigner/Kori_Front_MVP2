
import styled from 'styled-components/native';

const ChatRoomBox=()=>{

    return(
      <ChatRoom>
        <RoomBox>
        <RoomImageContainer>
            <RoomImage source={require('../assets/images/character2.png')}/>
        </RoomImageContainer>
        <RoomWrapper>
            <RoomTop>
                <ChatPerson>Koori</ChatPerson>
                <ChatTime>17:25</ChatTime>
            </RoomTop>
            <RoomBottom>
                <ChatContent>Hi nice to meet you</ChatContent>
                <ChatCountBox>
                    <ChatCount>999</ChatCount>
                </ChatCountBox>
            </RoomBottom>
        </RoomWrapper>
      </RoomBox>
      </ChatRoom>
    );

};


export default ChatRoomBox;


const ChatRoom=styled.View`
    align-items:center;
    height:80px;
    justify-content:center;
    
`;
const RoomBox=styled.TouchableOpacity`
    flex-direction:row;
    border-bottom-width:1px;
    border-bottom-color:#353637;
    margin-top:25px;

`;
const RoomImageContainer=styled.View`
    width:25%;
    height:70px;
    resize-mode: contain;
`;

const RoomImage = styled.Image`
  width: 100%;
  height:85%;
  resize-mode: contain;
`;
const RoomWrapper=styled.View`
    width:75%;
    height:70px;
    flex-direction:column;
`;

const RoomTop=styled.View`
    height:40%;
    flex-direction:row;
    justify-content:space-between;
    align-items:center;
`;

const RoomBottom=styled.View`
    height:45%;
    flex-direction:row;
    justify-content:space-between;
    align-items:center;
`;

const ChatPerson=styled.Text`
    font-size:18px;
    margin-left:5px;
    font-family:'PlusJakartaSans_500Medium';
    color:#ffffff;
`;

const ChatTime=styled.Text`
    font-size:12px;
    font-family:'PlusJakartaSans_300Light';
    color:#ffffff;
`;

const ChatContent=styled.Text`
    font-size:13px;
    margin-left:5px;
    color:#ffffff;
    font-family:'PlusJakartaSans_300Light';
`;

const ChatCountBox=styled.View`
    background-color:#02F59B;
    width:28px;
    height:28px;
    align-items:center;
    justify-content:center;
    border-radius:100px;
`;

const ChatCount=styled.Text`
    font-family:'PlusJakartaSans_600SemiBold';
    color:#1D1E1F;
`;