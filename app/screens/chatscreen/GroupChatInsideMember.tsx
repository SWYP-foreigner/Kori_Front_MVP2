import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const GroupChatInsideMember = () => {
  const router = useRouter();

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container>
        <HeaderContainer>
          <Left>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon type="previous" size={24} color={theme.colors.gray.lightGray_1} />
            </TouchableOpacity>
          </Left>
          <Center>
            <HeaderTitleText>Hiking Club</HeaderTitleText>
            <HeaderMemberCount>4</HeaderMemberCount>
          </Center>
          <Right>
            <TouchableOpacity onPress={() => console.log('공유기능')}>
              <Icon type="share" size={24} color={theme.colors.gray.lightGray_1} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('신고기능')}>
              <Icon type="alert" size={24} color={theme.colors.gray.lightGray_1} />
            </TouchableOpacity>
          </Right>
        </HeaderContainer>
        <MembersTextContainer>
          <MembersText>Members(4)</MembersText>
        </MembersTextContainer>
        {/* FlatList로 변경예정 */}
        <ScrollView>
          <MembersScreen></MembersScreen>
        </ScrollView>
        <LeaveChatButton>
          <LeaveChatButtonText>Leave Space</LeaveChatButtonText>
        </LeaveChatButton>
        <BottomSpacer />
      </Container>
    </SafeArea>
  );
};

export default GroupChatInsideMember;

const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;
const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10%;
  align-items: center;
  justify-content: center;
`;

const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 18px;
`;

const HeaderMemberCount = styled.Text`
  color: #02f59b;
  font-size: 19px;
  font-family: PlusJakartaSans_500Medium;
  margin-left: 5px;
`;

const ShingoImage = styled.Image`
  width: 26px;
  height: 26px;
  margin-left: 20px;
  margin-bottom: 3px;
`;

const Left = styled.View`
  flex: 1;
`;
const Center = styled.View`
  flex: 2;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;
const Right = styled.View`
  flex-direction: row;
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
`;

const MembersTextContainer = styled.View`
  height: 70px;
  justify-content: center;
`;
const MembersText = styled.Text`
  color: #848687;
  font-family: PlusJakartaSans_600SemiBold;
  font-size: 13px;
`;
const MembersScreen = styled.View`
  flex: 1;
`;

const LeaveChatButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #ff4f4f;
  margin-bottom: 8px;
`;

const LeaveChatButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;

const BottomSpacer = styled.View`
  height: 25px;
`;
