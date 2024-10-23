import {Text, View} from "react-native";
import {WebView} from "react-native-webview";

export default function Page() {
  return (
      <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
      >
        <Text>Second page</Text>
        <View style={{height: 200}}>
          <WebView
              style={{
                width: 300,
                height: 200
              }}
              allowsInlineMediaPlayback
              originWhitelist={['*']}
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{
                uri: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
                headers: {
                  referer: "https://www.example.com"
                }
              }}
          />
        </View>
      </View>
  );
}
