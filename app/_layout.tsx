import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus sign

const Drawer = createDrawerNavigator();

function SidebarContent(props) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.username}>{"<UserName>"}</Text>

      {/* Filters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <TouchableOpacity>
          <Text>📘 Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>📆 Canvas events</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>📝 Gradescope events</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>📅 My events</Text>
        </TouchableOpacity>
      </View>

      {/* Other Options */}
      <TouchableOpacity style={styles.item}>
        <Text>📤 Export Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text>ℹ️ Quarter Info</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text>⚙️ Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text>🚪 Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}


export default function RootLayout() {
  return (
      <Stack>
       <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity onPress={() => console.log('Hamburger bar pressed')}>
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
      </Stack>
  );
}