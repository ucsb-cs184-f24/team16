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
import AddEventModal from '../components/NewEvent';
import {TimelineEventProps} from "react-native-calendars";
import {loadValue, setValue} from "@/helpers/storage";

// format: YYYY-MM-DD HH:mm:ss

// Alert.prompt(
//   "New Event",
//   "Enter the event title below",
//   [
//     { text: "Cancel", style: "destructive", onPress: () => {} },
//     {
//       text: "Submit",
//       onPress: (username) => {
//         // update username
//       },
//     },
//   ],
//   "plain-text"
// );

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  const [isModalVisible, setModalVisible] = React.useState(false);

  function handleAddEvent(title: string, start: string, end: string, summary: string) {
    console.log('New Event:', {title, start, end, summary});
    // Add logic to save the new event

    loadValue<Record<string, TimelineEventProps>>("custom events").then(
        events => {
          const id = `custom:${Math.random().toString(36).substring(2)}`;
          setValue<Record<string, TimelineEventProps>>("custom events", {
            ...(events ?? {}),
            [id]: {id, title, start, end, summary},
          });
        }
    );
  }

  return (
      <>
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
                        onPress={() => setModalVisible(true)}
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
        <AddEventModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onAddEvent={handleAddEvent}
        />
      </>
  );
}
