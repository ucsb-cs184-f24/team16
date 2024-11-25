// hamburger.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HamburgerScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => console.log("User Profile")}>
        <Ionicons name= "person-circle-outline" size={24} color="black" ></Ionicons>
        <Text style={styles.buttonText}>Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'blue',
  },
});
