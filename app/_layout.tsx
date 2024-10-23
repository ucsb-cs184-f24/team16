import {Stack} from "expo-router";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="index"/>
        <Stack.Screen name="canvas-auth"/>
        <Stack.Screen name="page"/>
      </Stack>
  );
}
