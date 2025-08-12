import { Stack } from "expo-router";

export default function MyPageLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "마이페이지",
                }}
            />
        </Stack>
    )
}