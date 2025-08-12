import { Stack } from "expo-router";

export default function CommunityLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "커뮤니티",
                }}
            />
        </Stack>
    )
}