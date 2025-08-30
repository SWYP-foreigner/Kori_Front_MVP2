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
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false,
                    title: "게시글",
                }}
            />
            <Stack.Screen
                name="write"
                options={{
                    headerShown: false,
                    title: "글쓰기",
                }}
            />
            <Stack.Screen
                name="bookmarks"
                options={{
                    headerShown: false,
                    title: "북마크",
                }}
            />
        </Stack>
    )
}