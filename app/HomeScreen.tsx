import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('CustomDrawerContent')}>
              <Ionicons name="menu" size={26} color="black" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>MyCalendar</Text>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log('Plus sign pressed')}>
              <Ionicons name="add-outline" size={26} color="black" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#D3E1FB',
          },
        }}
      />
      <Stack.Screen name="event-info" />
      <Stack.Screen name="quarter-screen" />
      <Stack.Screen name="CustomDrawerContent" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  // Add your styles here
});

export default HomeScreen;