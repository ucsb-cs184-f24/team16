import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';
import {Stack} from "expo-router";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="+not-found"/>
      </Stack>
);
  return (
      <Stack>
        <Stack.Screen name="index"/>
        <Stack.Screen name="gs-auth"/>
      </Stack>
  ); 
}
