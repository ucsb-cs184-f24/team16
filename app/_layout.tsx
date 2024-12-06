import {router} from 'expo-router';
import {TouchableOpacity} from 'react-native';
import {createDrawerNavigator} from "@react-navigation/drawer";
import {Ionicons} from '@expo/vector-icons'; // For icons like hamburger and plus
import CustomDrawerContent from '@/components/CustomDrawerContent';
import EventInfo from "@/app/event-info";
import QuarterScreen from "@/app/quarter-screen";
import Index from "@/app/index";
import ExportScreen from './export-screen';
import * as React from "react";

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
      <Drawer.Navigator
          drawerContent={() => <CustomDrawerContent/>} // Custom Drawer
        screenOptions={{
          drawerStyle: {
            backgroundColor: 'white', // Optional: Customize drawer background
            width: 300, // Set drawer width
          },
          headerShown: true,
          headerLeft: () => (
              <TouchableOpacity
                  style={{
                    paddingLeft: 16,
                  }}
                  onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={26} color="black"/>
              </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen
            name="index"
            component={Index}
            options={({navigation}) => ({
              title: 'MyCalendar',
              headerShown: true,
              headerLeft: () => (
                  <TouchableOpacity
                      style={{
                        paddingLeft: 16,
                      }}
                      onPress={() => navigation.toggleDrawer()}
                  >
                    <Ionicons name="menu" size={26} color="black"/>
                  </TouchableOpacity>
              ),
              headerTitleAlign: 'center',
              headerRight: () => (
                  <TouchableOpacity
                      style={{
                        paddingRight: 16,
                      }}
                      onPress={() => console.log('Plus sign pressed')}
                  >
                    <Ionicons name="add-outline" size={26} color="black"/>
                  </TouchableOpacity>
              ),
              headerStyle: {
                backgroundColor: '#D3E1FB', // Set header background color here
              },
            })}
        />
        <Drawer.Screen
            name="event-info"
            options={{
              title: "Event Information",
            }}
            component={EventInfo}
        />
        <Drawer.Screen
            name="quarter-screen"
            component={QuarterScreen}
            options={{
              title: "Quarter Information",
            }}
        />
        <Drawer.Screen
            name="export-screen"
            component={ExportScreen}
            options={{
              title: "Export Calendar",
            }}
        />
      </Drawer.Navigator>
  );
}
