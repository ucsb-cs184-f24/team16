import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus 
import CustomDrawerContent from '@/components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />} // Custom Drawer
        screenOptions={{
          drawerStyle: {
            backgroundColor: 'white', // Optional: Customize drawer background
            width: 300, // Set drawer width
          },
          headerShown: false, // Hide default header since we use Stack headers
        }}
      >
        <Drawer.Screen name="index" component={MainStackNavigator} />
      </Drawer.Navigator>
  );
}

function MainStackNavigator() {
  return (
      <Stack>
       <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
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
        <Stack.Screen name="event-info"/>
        <Stack.Screen name="quarter-screen"
          options={{
            title: 'Quarter Info',
            headerTitleAlign: 'left',
            headerTitle: () => (
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Quarter Info</Text>
            ),
          }}
        />
      // </Stack>
  );
}