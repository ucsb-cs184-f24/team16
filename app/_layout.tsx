import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, useDrawerStatus } from "@react-navigation/drawer";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus sign
import { useNavigation } from '@react-navigation/native';
import CustomDrawerContent from '@/components/Drawer';

const Drawer = createDrawerNavigator();
const drawerStatus = useDrawerStatus();

// function CustomDrawerContent() {
//   return (
//     <View style={styles.sidebar}>
//       <Text style={styles.username}>{"<UserName>"}</Text>

//       {/* Filters */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Filters</Text>
//         <TouchableOpacity>
//           <Text>📘 Courses</Text>
//         </TouchableOpacity>
//         <TouchableOpacity>
//           <Text>📆 Canvas events</Text>
//         </TouchableOpacity>
//         <TouchableOpacity>
//           <Text>📝 Gradescope events</Text>
//         </TouchableOpacity>
//         <TouchableOpacity>
//           <Text>📅 My events</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Other Options */}
//       <TouchableOpacity style={styles.item}>
//         <Text>📤 Export Calendar</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.item}>
//         <Text>ℹ️ Quarter Info</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.item}>
//         <Text>⚙️ Settings</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.item}>
//         <Text>🚪 Log Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity onPress={}>
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent/>}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F0F0',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  item: {
    marginVertical: 8,
  },
});