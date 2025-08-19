import FriendCard from '@/components/FriendCard';
import useFollowUser from '@/hooks/mutations/useFollowUser';
import styled from 'styled-components/native';

export default function HomeScreen() {
  const followMutation = useFollowUser();

  return (
    <Safe>
      <Header>
        <Title>Find Friends</Title>
      </Header>

      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
      >
        <FriendCard
          userId={42}
          name="Alice Kori, Kim"
          country='United States'
          birth={2025}
          purpose="Business"
          languages={['EN', 'KO']}
          personalities={['Exploring Cafés', 'Board Games', 'Doing Nothing', 'K-Food Lover', 'K-Drama Lover']}
          isFollowed={false}
          onFollow={(userId) => followMutation.mutate(userId)}
          onChat={() => { }}
        />
        <FriendCard
          userId={99}
          name="John Lee"
          country="United States"
          birth={2025}
          purpose="Education"
          languages={['EN']}
          personalities={['Hiking', 'Reading']}
          isFollowed={false}
          onFollow={(userId) => followMutation.mutate(userId)}
          onChat={() => { }}
        />
      </Content>
    </Safe>
  );
}

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #1D1E1F;
`;
const Header = styled.View`
  padding: 12px 18px 8px 18px;
`;
const Title = styled.Text`
  color: #ffffff;
  font-size: 40px;
  font-family: 'InstrumentSerif_400Regular';
  font-weight: normal;                      
  letter-spacing: -0.2px;
`;

const Content = styled.ScrollView``;