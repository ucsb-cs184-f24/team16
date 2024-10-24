import {WebView} from 'react-native-webview';
import {router, Routes, useLocalSearchParams} from 'expo-router';
import * as CookieHandler from 'react-native-cookie-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from "react";

type Cookies = Record<string, string>;

function stringifyCookies(cookies: Cookies) {
  return Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ");
}

export default function generateAuth(pathname: Routes,
                                     param_key: string,
                                     cookie_key: string,
                                     api_test_url: string,
                                     start_url: string,
                                     cookie_url: string,
                                     get_headers: (cookie: string) => HeadersInit,
                                     check_response: (response: Response) => boolean
): [
  () => React.JSX.Element,
  (redirect: Routes, callback: (headers: HeadersInit) => any) => void
] {
  async function checkAuth(cookies: Cookies): Promise<string | false> {
    const cookie = stringifyCookies(cookies);
    const response = await fetch(api_test_url, {
      "method": "GET",
      "headers": get_headers(cookie),
    });
    console.log(await response.text());
    return check_response(response) && cookie;
  }

  function Auth() {
    const {redirect}: { redirect: Routes } = useLocalSearchParams();
    return (
        <WebView
            source={{uri: start_url}}
            onNavigationStateChange={async (navState) => {
              // if (navState.url === start_url) {
                const cookies = await CookieHandler.get(cookie_url, true);
                if (await checkAuth(cookies)) {
                  router.navigate({
                    pathname: redirect,
                    params: {[param_key]: encodeURIComponent(JSON.stringify(cookies))}
                  });
                }
              // }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            sharedCookiesEnabled={true}
        />
    );
  }

  async function handleCookies(cookies: Cookies): Promise<HeadersInit> {
    const cookie = await checkAuth(cookies);
    if (cookie) {
      await AsyncStorage.setItem(cookie_key, JSON.stringify(cookies));
      return get_headers(cookie);
    } else {
      throw "Authentication error";
    }
  }

  function navigate(redirect: Routes) {
    router.navigate({pathname, params: {redirect}});
  }

  function useAuth(redirect: Routes, callback: (headers: HeadersInit) => any): void {
    const param = useLocalSearchParams()[param_key];
    if (param) {
      const cookieJSON = typeof param === "string" ? param : param[0];
      const cookies: Cookies = JSON.parse(cookieJSON);
      handleCookies(cookies).then(callback, () => navigate(redirect));
    } else {
      (async () => {
        const cookieJSON = await AsyncStorage.getItem(cookie_key);
        const cookies: Cookies = cookieJSON
            ? JSON.parse(cookieJSON)
            : await CookieHandler.get(cookie_url, true);
        handleCookies(cookies).then(callback, () => navigate(redirect));
      })();
    }
  }

  return [Auth, useAuth];
}

