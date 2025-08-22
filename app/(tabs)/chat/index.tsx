import { SafeAreaView, Text,StatusBar } from 'react-native';
import styled from 'styled-components/native';
import Feather from '@expo/vector-icons/Feather';
import ChatRoomBox from '@/components/ChatRoomBox';

export default function ChatScreen() {
    return (
        <Safe>
        <StatusBar barStyle="light-content" />
        <Container>
        <Header>
        <TitleWrapper>
            <Title>Chat</Title>
            <IconImage source={require('../../../assets/images/IsolationMode.png')} />
        </TitleWrapper>
        <SearchButton>
            <Feather name="search" size={25} color="#CCCFD0" />
        </SearchButton>
      </Header>
      <ChatWrapper>
        <ChatBox>
        <MyChatBox>
            <ChatText>My chat</ChatText>
        </MyChatBox>
        </ChatBox>
        <ChatBox>
        <GroupChatBox>
             <ChatText>Linked Space</ChatText>
        </GroupChatBox>
        </ChatBox>
      </ChatWrapper>
      <ChatRoomBox/>
       <ChatRoomBox/>
        <ChatRoomBox/>
         <ChatRoomBox/>
          <ChatRoomBox/>
      </Container>
        </Safe>
    );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`
  flex: 1;
  padding: 0px 20px;
`;
const Header = styled.View`
 
  height:50px;
  flex-direction: row;
  justify-content:space-between;
  align-items: center;
  margin-top:40px;
`;

const SearchButton=styled.TouchableOpacity`
    
`;

const TitleWrapper=styled.View`
    flex-direction: row;
    align-items: center;

`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 32px;
  font-family: 'InstrumentSerif_400Regular';
  letter-spacing: -0.2px;
`;

const IconImage = styled.Image`
  margin-left: 4px;
  width: 20px;
  height: 20px;
`;
const ChatWrapper=styled.View`
    height:50px;
    flex-direction:row;
`;
const ChatBox=styled.View`
    width:50%;
    
    height:50px;
    align-items:center;
    justify-content:center;

`;
const MyChatBox=styled.TouchableOpacity`
   
    width:70%;
    height:50px;
    margin:0px 100px;
    border-bottom-color:#02F59B;
    border-bottom-width:2px;
    align-items:center;
    justify-content:center;
`;
const GroupChatBox=styled.TouchableOpacity`
     
    width:70%;
    height:50px;
    border-bottom-color:#02F59B;
    border-bottom-width:2px;
    align-items:center;
    justify-content:center;
`;

const ChatText=styled.Text`
    color:#02F59B;
    font-family:'PlusJakartaSans_500Medium';
    font-size:16px;
`;

