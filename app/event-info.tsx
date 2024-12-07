import {Button, Image, StyleSheet} from 'react-native';
import {router, useGlobalSearchParams} from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {loadValue, setValue} from "@/helpers/storage";
import {TimelineEventProps} from "react-native-calendars";

export interface EventInfoParamList extends Record<string, string> {
  id: string;
  title: string;
  start: string;
  end: string;
  summary: string;
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

export default function EventInfo() {
  const {id, title, start, end, summary} = useGlobalSearchParams<EventInfoParamList>();
  return (
      <ParallaxScrollView
          headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
          headerImage={
            <Image
                source={require('@/assets/images/partial-react-logo.png')}
                style={styles.reactLogo}
            />}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{title}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Time</ThemedText>
          <ThemedText>Start: {start}</ThemedText>
          <ThemedText>End: {end}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Description</ThemedText>
          <ThemedText>
            {summary}
          </ThemedText>
        </ThemedView>
        {id?.startsWith("custom") ? (
            <Button title="Delete"
                    onPress={async () => {
                      const events = await loadValue<Record<string, TimelineEventProps>>("custom events") ?? {};
                      setValue<Record<string, TimelineEventProps>>(
                          "custom events",
                          Object.fromEntries(Object.entries(events).filter(([key]) => key !== id))
                      );
                      router.back();
                    }}
            />
        ) : null}
      </ParallaxScrollView>
  );
}
