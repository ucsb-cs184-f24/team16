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
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 20 }}>Username</Text>

    {/* Filters */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="funnel-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Filter</Text>
      </View>
      <TouchableOpacity onPress={() => console.log("filtering")}>
        <Ionicons name="chevron-down-outline" size={26} color="black"/>
      </TouchableOpacity>
    </View>
    
    {/* Export Calendar */}
    <TouchableOpacity onPress={() => console.log("export your calendar")}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
        <Ionicons name="download-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Export Calendar</Text>
      </View>
    </TouchableOpacity>

    {/* Quarter Info */}
    <TouchableOpacity onPress={() => navigation.navigate('quarter-screen')}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
        <Ionicons name="information-circle-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Quarter Info</Text>
      </View>
    </TouchableOpacity>

     {/* Settings */}
     <TouchableOpacity onPress={() => navigation.navigate('quarter-screen')}>
     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
        <Ionicons name="settings-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Settings</Text>
      </View>
    </TouchableOpacity>

    {/* Log out */}
    <TouchableOpacity onPress={() => navigation.navigate('quarter-screen')}>
     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
        <Ionicons name="log-out-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Log out</Text>
      </View>
    </TouchableOpacity>
  </View>
);

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
        options = {({ navigation }) => ({
          title: 'Quarter Info',
          headerTitleAlign: 'left',
          headerTitle: () => (
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Quarter Info</Text>
          ),
        })}/>
      // </Stack>
  );
}