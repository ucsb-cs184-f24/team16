import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus 

import SideMenu from '@rexovolt/react-native-side-menu';
import HamburgerScreen from './hamburger';

import DrawerItems from '@/constants/DrawerItems';
// const Drawer = createDrawerNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => (
  <View style={{ flex: 1, padding: 30 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Username</Text>

    <Text style={{ fontSize: 16, marginVertical: 10 }}>Filter</Text>

    <TouchableOpacity onPress={() => console.log("export your calendar")}>
      <Text style={{ fontSize: 16, marginVertical: 10 }}>Export Calendar</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('quarter-screen')}>
      <Text style={{ fontSize: 16, marginVertical: 10 }}>Quarter Info</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => console.log("go to settings")}>
      <Text style={{ fontSize: 16, marginVertical: 10 }}>Settings</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => console.log("user logging out")}>
      <Text style={{ fontSize: 16, marginVertical: 10 }}>Log out</Text>
    </TouchableOpacity>
  </View>
);

export default function RootLayout() {
  return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />} // Custom Drawer
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#D3E1FB', // Optional: Customize drawer background
            width: 250, // Set drawer width
          },
          headerShown: false, // Hide default header since we use Stack headers
        }}
      >
        {/* Main Stack Navigator */}
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
        <Stack.Screen name="quarter-screen"/>
      // </Stack>
  );
}