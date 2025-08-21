// app/mypage/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,                     // ✅ 기본 헤더 숨김
                contentStyle: { backgroundColor: '#0f1011' }, // ✅ 배경 통일
            }}
        >
            {/* 필요한 경우 개별 화면 옵션 */}
            {/* <Stack.Screen name="edit" options={{ headerShown: false }} /> */}
        </Stack>
    );
}
