import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "채팅",
        }}
      />
      <Stack.Screen
        name="CreateSpaceScreen"
        options={{
          headerShown: false,
          title: "채팅",
        }}
      />
    </Stack>
  );
}
