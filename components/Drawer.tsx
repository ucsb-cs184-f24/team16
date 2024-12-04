import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function CustomDrawerContent() {
  const navigation = useNavigation();
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

const styles = StyleSheet.create({
    sidebar: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      input: {
        height: 40,
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
      },
      item: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      section:{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      sectionTitle: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
      }
});

export default CustomDrawerContent;