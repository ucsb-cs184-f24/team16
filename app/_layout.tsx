import {Stack} from "expo-router";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="canvas-auth"/>
        <Stack.Screen name="ucsb-auth"/>
        <Stack.Screen name="quarter-screen"/>
      </Stack>
  );
}