import {Alert, View, TextInput, StyleSheet, Button} from 'react-native';
import {useState} from 'react'
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {jsdom} from 'jsdom-jscore-rn';
import {test_screen} from './test-screen'
import {router} from 'expo-router'

export default function Index() {
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
  useCanvasAuth("/", async headers => {
    const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
      "method": "GET",
      "headers": headers
    });
    const data = await response.json();

    setName(data.name);
    setStudentId(data.id);
  });

  return (
      <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
      >
        <TextInput
                style={styles.input}
                value={name}
                editable={false} // Make it read-only
                placeholder="Name"
              />

              {/* TextInput for Student ID */}
              <TextInput
                style={styles.input}
                value={studentId.toString()} // Convert ID to string if it's a number
                editable={false} // Make it read-only
                placeholder="Student ID"
              />
              <Button
                title="Go to second page"
                onPress={() => router.navigate('test-screen')}
              />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take the full screen height
    justifyContent: 'center', // Vertically center the content
    alignItems: 'center', // Horizontally center the content
  },
  input: {
    height: 40,
    width: '80%', // Make the input box 80% of the screen width
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20, // Space between the two text boxes
    paddingHorizontal: 10,
    textAlign: 'center', // Center the text in the box
  },
});