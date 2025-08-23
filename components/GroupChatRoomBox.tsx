import React from "react";
import styled from "styled-components/native";
import BuzzingRoomBox from "@/components/BuzzingRoomBox";
import AllSpaceRoomBox from "@/components/AllSpaceRoomBox";
import { FlatList, View } from "react-native";

const GroupChatRoomBox = () => {
  const Buzzing_DATA = [
    { id: "1", title: "Hiking Club", content: "Hi nice to meet you", member: 10 },
    { id: "2", title: "Soccer Club", content: "Hi nice to meet you", member: 100 },
    { id: "3", title: "Baseball Club", content: "Hi nice to meet you", member: 90 },
    { id: "4", title: "Game Club", content: "Hi nice to meet you", member: 5 },
    { id: "5", title: "Cooking Club", content: "Hi nice to meet you", member: 1 },
  ];

  const AllSpace_DATA = [
    { id: "1", title: "Hiking Club", content: "Hi nice to meet you", member: 10 },
    { id: "2", title: "Soccer Club", content: "Hi nice to meet you", member: 100 },
    { id: "3", title: "Baseball Club", content: "Hi nice to meet you", member: 90 },
    { id: "4", title: "Game Club", content: "Hi nice to meet you", member: 5 },
    { id: "5", title: "Cooking Club", content: "Hi nice to meet you", member: 1 },
  ];

  return (
    <Container>
      <FlatList
        data={AllSpace_DATA}
        renderItem={({ item }) => <AllSpaceRoomBox data={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}   
        ListHeaderComponent={
          <View>
            <GroupTitleContainer>
              <GroupTitleText>Buzzing Spaces</GroupTitleText>
            </GroupTitleContainer>
            <BuzzingContainer>
              <FlatList
                data={Buzzing_DATA}
                renderItem={({ item }) => <BuzzingRoomBox data={item} />}
                keyExtractor={(item) => item.id}
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
