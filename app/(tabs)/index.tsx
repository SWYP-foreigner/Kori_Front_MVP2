import FriendCard from '@/components/FriendCard';
import ProfileBubble from '@/components/ProfileBubble';
import useFollowUser from '@/hooks/mutations/useFollowUser';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function HomeScreen() {

  //테스트
  const targetUserId = 42;
  const followMutation = useFollowUser();

  return (
    <SafeAreaView style={styles.container}>
      <ProfileBubble bio="Hello~ I came to Korea from the U.S. as an exchange student" />
      <FriendCard
        userId={targetUserId}
        name="Jane Doe"
        country="United States"
        age={20}
        purpose="Education"
        languages={['EN', 'KO', 'JP']}
        personalities={['Swimming', 'Reading']}
        isFollowed={false}
        onFollow={(userId) => followMutation.mutate(userId)}
        onChat={() => console.log('Chat clicked')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
});
