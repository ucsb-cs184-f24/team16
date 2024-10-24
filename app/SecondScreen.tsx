import React from 'react';
import { View, Text, Button } from 'react-native';
import {router} from 'expo-router';

export default function SecondScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>This is the second screen with different content.</Text>
    </View>
  );
}
