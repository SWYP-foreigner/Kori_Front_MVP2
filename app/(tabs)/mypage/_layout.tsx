import { Stack } from 'expo-router';

// deeplink 클릭 시 먼저 initialRoute로 이동
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f1011' },
      }}
    ></Stack>
  );
}
