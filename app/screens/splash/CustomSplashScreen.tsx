import React, { useEffect, useRef } from "react";
import { StatusBar, Animated } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
// SafeArea, Container styled-components
const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: #0f0f10;
`;

const Container = styled(Animated.View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.Image`
  width: 150;
  height: 150;
`;

const CustomSplashScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // 초기 opacity 1

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace("../../login");
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeArea>
      <StatusBar barStyle="light-content" />
      <Container style={{ opacity: fadeAnim }}>
        <Logo source={require("../../../assets/images/AppLogo.png")} resizeMode="contain" />
      </Container>
    </SafeArea>
  );
};

export default CustomSplashScreen;
