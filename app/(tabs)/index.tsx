import {Alert, Button, View, Text} from 'react-native';
import Schedule from '@/components/Schedule';
import {useGsAuth} from "@/app/gs-auth";
import {jsdom} from 'jsdom-jscore-rn';
import { useState, useEffect } from 'react';
import {router} from 'expo-router';



export default function Index() {
  const [info, setInfo] = useState<Info | null>(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  // const fetchUserInfo = async () => {
  //   try {
  //     const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
  //       method: "GET",
  //       headers: {
  //         accept: "application/json",
  //         "accept-language": "en-US,en;q=0.9",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setUsername(data.name || data.login_id || "Username not found");
  //     setIsLoggedIn(true); // Mark the user as logged in
  //     Alert.alert("Canvas API Username", data.name || data.login_id);
  //   } catch (error) {
  //     Alert.alert("Error");
  //   }
  // };

  //  // Re-login logic: Reset login state and initiate authentication flow again
  //  const handleLogout = () => {
  //   setUsername("");  // Clear the username
  //   setIsLoggedIn(false);  // Mark the user as logged out
  //   Alert.alert("Logged Out", "You have been logged out. Please log in again.");
  //   fetchUserInfo(); // Call login flow again
  // };

  // useCanvasAuth("/", fetchUserInfo); // Trigger login on load

  type Info = {
    "id": Number,
    "address": string,
    "status": string,
    "primary": boolean,
    "user": {
      "id": Number,
      "name": string,
      "initials": string,
      "email": string,
      "admin": boolean,
      "primary_email_address": string,
      "hide_section_reminder": boolean,
      "courses": Array<any>
    }
  };

useGsAuth("/", async headers => {
  const response = await fetch("https://api-transformer.onrender.com//https://www.gradescope.com/account/edit", {
    "method": "GET",
    "headers": headers
  });
  const dom = jsdom(await response.text());
  const scriptElement = dom.querySelector("head > script");
  if (scriptElement) {
    const match = scriptElement.innerHTML.match(/(?<=gon\.primary_email\s*=\s*)\{[^;]+\}(?=\;)/);
    if (match) {
      const info: Info = JSON.parse(match[0]);
      setInfo(info);
    }
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
        {info ? (
          <>
          <Text>Signed in</Text>
          <Text>{info.user.name}</Text>
          <Text>{info.address}</Text>
          <Button
              title="Go to Explore"
              onPress={() => router.navigate("/explore")}
          />
          </>
        ) : null

        }
        {/* <Schedule username={info?.user} /> */}
      </View>
  );
}
