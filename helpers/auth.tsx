import {WebView} from 'react-native-webview';
import {router, Routes, useLocalSearchParams} from 'expo-router';
import * as CookieHandler from 'react-native-cookie-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useRef} from "react";
import {Promisable} from "type-fest";
import {Mutex} from "async-mutex";

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
                                     get_headers: (cookie: string) => Promisable<HeadersInit>,
                                     check_response: (response: Response) => Promisable<boolean>
): [
  () => React.JSX.Element,
  (redirect: Routes, callback: (headers: HeadersInit) => PromiseLike<boolean | void> | boolean | void) => void
] {
  async function checkAuth(cookies: Cookies): Promise<string | false> {
    const cookie = stringifyCookies(cookies);
    const response = await fetch(api_test_url, {
      "method": "GET",
      "headers": await get_headers(cookie),
    });
    // console.log(await response.text());
    return await check_response(response) && cookie;
  }

  function Auth() {
    const {redirect}: { redirect: Routes } = useLocalSearchParams();
    return (
        <WebView
            source={{uri: start_url}}
            onNavigationStateChange={async (navState) => {
              if (navState.url === start_url) {
                const cookies = await CookieHandler.get(cookie_url, true);
                if (await checkAuth(cookies)) {
                  router.navigate({
                    pathname: redirect,
                    params: {[param_key]: encodeURIComponent(JSON.stringify(cookies))}
                  });
                }
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            sharedCookiesEnabled={true}
        />
    );
  }

  async function handleCookies(cookies: Cookies): Promise<HeadersInit | null> {
    const cookie = await checkAuth(cookies);
    if (cookie) {
      await AsyncStorage.setItem(cookie_key, JSON.stringify(cookies));
      return get_headers(cookie);
    } else {
      return null;
    }
  }

  function navigate(redirect: Routes) {
    router.navigate({pathname, params: {redirect}});
  }

  function useAuth(redirect: Routes, callback: (headers: HeadersInit) => Promisable<boolean | void>): void {
    const successRef = useRef<boolean>(false);
    const param = useLocalSearchParams()[param_key];
    const mutexRef = useRef<Mutex | null>(null);
    if (!mutexRef.current) {
      mutexRef.current = new Mutex();
    }
    mutexRef.current.acquire().then(async release => {
      if (!successRef.current) {
        try {
          let cookies: Cookies;
          if (param) {
            const cookieJSON = typeof param === "string" ? param : param[0];
            cookies = JSON.parse(cookieJSON);
          } else {
            const cookieJSON = await AsyncStorage.getItem(cookie_key);
            cookies = cookieJSON
                ? JSON.parse(cookieJSON)
                : await CookieHandler.get(cookie_url, true);
          }
          const headers = await handleCookies(cookies);
          if (headers) {
            successRef.current = await callback(headers) !== false;
          } else {
            navigate(redirect);
          }
        } catch (e) {
          console.error(e);
        }
      }
      release();
    });
  }

  return [Auth, useAuth];
}

