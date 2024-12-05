import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; // For icons like hamburger and plus 


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

    {/* Log out */}
    <TouchableOpacity onPress={() => console.log("Logging out...")}>
     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
        <Ionicons name="log-out-outline" size={26} color="black" />
        <Text style={{ fontSize: 16, marginLeft: 8 }}>Log out</Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default CustomDrawerContent;