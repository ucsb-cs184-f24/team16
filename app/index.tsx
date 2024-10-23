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

  useUCSBAuth("/", async headers => {
    const response = await fetch("https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/WeeklyStudentSchedule.aspx", {
      "method": "GET",
      "headers": headers
    });
    const dom = jsdom(await response.text());
    console.log("Dom", dom.title);
    const eventsElement = dom.querySelector('#pageContent_events');
    if (eventsElement) {
      const events: {[p: string]: {
        start: string | undefined;
        end: string | undefined;
        content: string | undefined;
        event: string | undefined;
      }[]} = {};
      for (const [day, selector] of Object.entries({
        M: '#pageContent_eventsgroupM',
        T: '#pageContent_eventsgroupT',
        W: '#pageContent_eventsgroupW',
        R: '#pageContent_eventsgroupR',
        F: '#pageContent_eventsgroupF'
      })) {
        const eventGroup = eventsElement.querySelector(selector);
        if (eventGroup) {
          const currentEvents = eventGroup.querySelectorAll('.single-event');
          events[day] = Array.from(currentEvents).map((eventElement: Element) => ({
            start: eventElement.attributes.getNamedItem('data-start')?.value,
            end: eventElement.attributes.getNamedItem('data-end')?.value,
            content: eventElement.attributes.getNamedItem('data-content')?.value,
            event: eventElement.attributes.getNamedItem('data-event')?.value
          }));
        }
      }
      Alert.alert("UCSB Schedule", JSON.stringify(events));
    }
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