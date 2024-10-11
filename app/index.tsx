import {Text, View} from "react-native";
import Schedule from "@/components/Schedule";

export default function Index() {
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
