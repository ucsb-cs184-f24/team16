import AsyncStorage from '@react-native-async-storage/async-storage';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import {Alert} from "react-native";

export default function CanvasAuth() {
  const navigation = useNavigation();

  return (
      <WebView
          source={{uri: "https://ucsb.instructure.com/login/oauth2/auth?response_type=code&client_id=170000000000472&redirect_uri=urn:ietf:wg:oauth:2.0:oob"}}
          onNavigationStateChange={async (navState) => {
            const url: URL = new URL(navState.url);
            if (url.origin === "https://ucsb.instructure.com" && url.pathname === "/login/oauth2/auth" && url.searchParams.has("code")) {
              await AsyncStorage.setItem("canvas.token", url.searchParams.get("code") ?? "");
              Alert.alert(await AsyncStorage.getItem("canvas.token") ?? "");
              navigation.goBack();
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
      />
  );
}
