import FriendCard from '@/components/FriendCard';
import ProfileBubble from '@/components/ProfileBubble';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ProfileBubble bio="Hello~ I came to Korea from the U.S. as an exchange student" />
      <FriendCard
        name="Jane Doe"
        country="United States"
        age={20}
        purpose="Education"
        languages={['EN', 'KO', 'JP']}
        personalities={['Swimming', 'Reading']}
        isFollowed={false}
        onFollow={() => console.log('Follow clicked')}
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
