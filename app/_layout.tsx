import {Stack} from "expo-router";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="test-screen"/>
        <Stack.Screen name="index"/>
        <Stack.Screen name="canvas-auth"/>
      </Stack>
  );
}
