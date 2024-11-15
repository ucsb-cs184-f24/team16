import {Stack} from "expo-router";
import {EventInfoParamList} from "@/app/event-info";

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="index"/>
        <Stack.Screen name="canvas-auth"/>
        <Stack.Screen name="ucsb-auth"/>
        <Stack.Screen name="quarter-screen"/>
        <Stack.Screen name="event-info"
                      options={({ route }) => ({
                        title: (route.params as EventInfoParamList).title
                      })}
        />
      </Stack>
  );
}