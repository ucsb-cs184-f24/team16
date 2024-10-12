import {Alert, View} from 'react-native';
import Schedule from '@/components/Schedule';
import {useAuthenticate} from '@/app/canvas-auth';

export default function Index() {
  useAuthenticate("/", async () => {
    const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
      "method": "GET",
      "headers": {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9"
      }
    });
    Alert.alert("Canvas API Response", await response.text());
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
