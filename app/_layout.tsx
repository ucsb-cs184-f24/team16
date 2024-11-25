import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus sign
import HamburgerScreen from './hamburger';

export default function RootLayout() {
  return (
      <Stack>
       <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('hamburger')}>
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
            backgroundColor: '#D3E1FB', // Set header background color here
          },
        })}
      />
      <Stack.Screen name="hamburger"/>
        <Stack.Screen name="event-info"/>
        <Stack.Screen name="quarter-screen"/>
      </Stack>
  );
}