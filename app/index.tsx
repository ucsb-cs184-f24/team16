import {Alert, View} from 'react-native';
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {jsdom} from 'jsdom-jscore-rn';

export default function Index() {
  useCanvasAuth("/", async () => {
    const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
      "method": "GET",
      "headers": {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9"
      }
    });
    Alert.alert("Canvas API Response", await response.text());
  });

  useUCSBAuth("/", async () => {
    const response = await fetch("https://my.sa.ucsb.edu/gold/WeeklyStudentSchedule.aspx", {
      "method": "GET",
      "headers": {
        "accept": "text/html",
        "accept-language": "en-US,en;q=0.9"
      }
    });
    const dom = jsdom(await response.text());
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
        <Schedule/>
      </View>
  );
}
