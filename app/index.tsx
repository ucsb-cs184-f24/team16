import {View} from "react-native";
import Schedule from "@/components/Schedule";
import {useNavigation} from "@react-navigation/native";

export default function Index() {
  const navigation = useNavigation();

  setTimeout((): void => {
    // @ts-ignore
    navigation.navigate('canvas-auth');
  }, 1000);

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
