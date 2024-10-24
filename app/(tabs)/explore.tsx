import Ionicons from '@expo/vector-icons/Ionicons';
import {Image, Platform, StyleSheet} from 'react-native';

import {Collapsible} from '@/components/Collapsible';
import {ExternalLink} from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
      <ParallaxScrollView
          headerBackgroundColor={{light: '#D0D0D0', dark: '#353636'}}
          headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage}/>}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Profile</ThemedText>
        </ThemedView>
        <ThemedText>Welcome to your calendar!</ThemedText>
        <Collapsible title="Settings">
          <ThemedText>
            This app has two screens
          </ThemedText>
        </Collapsible>
        <Collapsible title="Privacy & Protection">
        </Collapsible>
        <Collapsible title="Account Activities">
        </Collapsible>
        <Collapsible title="Light and dark mode components">
        </Collapsible>
        <Collapsible title="Contact us">
        </Collapsible>
      </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
