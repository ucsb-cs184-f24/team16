import { Alert, View, Text, Button} from 'react-native';
import Schedule from '@/components/Schedule';
import { useCanvasAuth } from '@/app/canvas-auth';
import { useUCSBAuth } from "@/app/ucsb-auth";
import { jsdom } from 'jsdom-jscore-rn';
import { useState } from 'react';
import {router} from 'expo-router';

export default function Index() {
  const [userInfo, setUserInfo] = useState(null); // State to store user info

  useCanvasAuth("/", async headers => {
    const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
      method: "GET",
      headers: headers
    });
    if (response.ok) {
      const data = await response.json(); // Parse the response as JSON
      setUserInfo(data); // Set the user info state
    } else {
      Alert.alert("Error", "Failed to fetch user info");
    }
  });

  useUCSBAuth("/", async headers => {
    const response = await fetch("https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/WeeklyStudentSchedule.aspx", {
      method: "GET",
      headers: headers
    });
    const dom = jsdom(await response.text());
//     console.log("Dom", dom.title);
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
//      Alert.alert("UCSB Schedule", JSON.stringify(events));
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
      {userInfo ? (
        <View>
          <Text>Welcome, {userInfo.name || "User"}</Text>
        </View>
      ) : (
        <Text>Loading user info...</Text>
      )}
        <Button
          title="Go to Second Screen"
          onPress={() => router.navigate('SecondScreen')}
        />
    </View>
  );
}
