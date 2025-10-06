import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaView, Image, Text, StatusBar, Platform } from 'react-native';
import { Dimensions } from 'react-native';
const { height: screenHeight } = Dimensions.get('window');
const TAB_BAR_HEIGHT = screenHeight * 0.117; // 화면 높이의 15%

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1D1E1F', // 원하는 배경색
          borderTopWidth: 1,
          borderColor: '#353637',
          height: TAB_BAR_HEIGHT,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? '#FFFFFF' : '#616262', fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' }}
            >
              Find
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/tab_find_click.png') : require('@/assets/images/tab_find.png')}
              style={{ width: 32, height: 32 }} // 원하는 크기
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? '#FFFFFF' : '#616262', fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' }}
            >
              Chat
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? require('@/assets/images/tab_chat_click.png') : require('@/assets/images/tab_chat.png')}
              style={{ width: 32, height: 32 }} // 원하는 크기
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? '#FFFFFF' : '#616262', fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' }}
            >
              Community
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/tab_community_click.png')
                  : require('@/assets/images/tab_community.png')
              }
              style={{ width: 32, height: 32 }} // 원하는 크기
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'MyPage',
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? '#FFFFFF' : '#616262', fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' }}
            >
              My page
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('@/assets/images/tab_mypage_click.png') : require('@/assets/images/tab_mypage.png')
              }
              style={{ width: 32, height: 32 }} // 원하는 크기
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
