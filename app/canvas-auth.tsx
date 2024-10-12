import {WebView} from 'react-native-webview';
import {router, useLocalSearchParams} from 'expo-router';
import {useEffect} from 'react';
import * as CookieHandler from 'react-native-cookie-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Cookies = { [p: string]: string };

function stringifyCookies(cookies: Cookies) {
  return Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ");
}

async function checkAuth(cookies: Cookies): Promise<string | false> {
  const cookie = stringifyCookies(cookies);
  const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
    "method": "GET",
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cookie": cookie
    }
  });
  return response.ok && cookie;
}

export default function CanvasAuth() {
  const {redirect}: {
    redirect: "/" | `./${string}` | `../${string}` | ".." | `${string}:${string}`
  } = useLocalSearchParams();
  return (
      <WebView
          source={{uri: "https://ucsb.instructure.com/"}}
          onNavigationStateChange={async (navState) => {
            if (navState.url === "https://ucsb.instructure.com/") {
              const cookies = await CookieHandler.get("https://ucsb.instructure.com/", true);
              if (await checkAuth(cookies)) {
                router.navigate({
                  pathname: redirect,
                  params: {canvas_cookies: encodeURIComponent(JSON.stringify(cookies))}
                });
              }
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
      />
  );
}

async function handleCookies(cookies: Cookies): Promise<string> {
  await AsyncStorage.setItem("cookie", JSON.stringify(cookies));
  const cookie = await checkAuth(cookies);
  if (cookie) {
    return cookie;
  } else {
    throw "Authentication error";
  }
}

function navigate(redirect: "/" | `./${string}` | `../${string}` | ".." | `${string}:${string}`) {
  router.navigate({pathname: '/canvas-auth', params: {redirect}});
}

export function useAuthenticate(redirect: "/" | `./${string}` | `../${string}` | ".." | `${string}:${string}`, callback: (cookie: string) => any): void {
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.canvas_cookies) {
      const cookieJSON = typeof params.canvas_cookies === "string" ? params.canvas_cookies : params.canvas_cookies[0];
      const cookies: Cookies = JSON.parse(cookieJSON);
      handleCookies(cookies).then(callback, () => navigate(redirect));
    } else {
      (async () => {
        const cookieJSON = await AsyncStorage.getItem("cookie");
        if (cookieJSON) {
          const cookies: Cookies = JSON.parse(cookieJSON);
          handleCookies(cookies).then(callback, () => navigate(redirect));
        } else {
          const cookies = await CookieHandler.get("https://ucsb.instructure.com/", true);
          handleCookies(cookies).then(callback, () => navigate(redirect));
        }
      })();
    }
  }, [params.canvas_cookies, callback, redirect]);
}
