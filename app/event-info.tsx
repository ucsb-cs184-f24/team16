import {StyleSheet, Image} from 'react-native';
import {useLocalSearchParams} from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

export interface EventInfoParamList extends Record<string, string> {
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
  const {title, start, end, summary} = useLocalSearchParams<EventInfoParamList>();
  return (
      <ParallaxScrollView
          headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
          headerImage={
            <Image
                source={require('@/assets/images/partial-react-logo.png')}
                style={styles.reactLogo}
            />
          }>
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
      </ParallaxScrollView>
  );
}
