import { Stack } from 'expo-router';

// deeplink 클릭 시 먼저 initialRoute로 이동
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: '커뮤니티',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: '게시글',
        }}
      />
      <Stack.Screen
        name="write"
        options={{
          headerShown: false,
          title: '글쓰기',
        }}
      />
      <Stack.Screen
        name="bookmarks"
        options={{
          headerShown: false,
          title: '북마크',
        }}
      />
      <Stack.Screen
        name="my-history"
        options={{
          headerShown: false,
          title: '히스토리',
        }}
      />
      <Stack.Screen
        name="SearchScreen"
        options={{
          headerShown: false,
          title: '검색 페이지',
        }}
      />
    </Stack>
  );
}
