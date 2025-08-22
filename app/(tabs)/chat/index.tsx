import { SafeAreaView, Text,StatusBar ,FlatList} from 'react-native';
import styled from 'styled-components/native';
import Feather from '@expo/vector-icons/Feather';
import ChatRoomBox from '@/components/ChatRoomBox';

export default function ChatScreen() {
    const DATA = [
        { id: "1", name: "Koori", message: "Hi nice to meet you", count: 10, time: "17:25",mcount:999 },
        { id: "2", name: "Alice", message: "Hello!", count: 2, time: "16:50",mcount:99 },
        { id: "3", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "4", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "5", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "6", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "7", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "8", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "9", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "10", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "11", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "12", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "13", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "14", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
        { id: "15", name: "Bob", message: "How are you?", count: 5, time: "15:30",mcount:9 },
  // 원하는 만큼 추가
    ];
    return (
        <Safe>
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
      <FlatList
        data={DATA}
        renderItem={({item})=> <ChatRoomBox data={item} />}
        keyExtractor={item => item.id}
      />
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
  height:70px;
  flex-direction: row;
  justify-content:space-between;
  align-items: center;
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

