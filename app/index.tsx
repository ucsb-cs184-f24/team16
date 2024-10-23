import {Button, Image, Text, View} from "react-native";
import {useCanvasAuth} from "@/app/canvas-auth";
import {useState} from "react";
import {router} from "expo-router";

type Info = {
  id: Number,
  name: string,
  created_at: string,
  sortable_name: string,
  short_name: string,
  pronouns: string,
  avatar_url: string,
  last_name: string,
  first_name: string,
  locale: string | null,
  effective_locale: string,
  permissions: {
    can_update_name: boolean,
    can_update_avatar: boolean,
    limit_parent_app_web_access: boolean
  }
};

export default function Index() {
  const [info, setInfo] = useState<Info | null>(null);

  useCanvasAuth("/", async headers => {
    const response = await fetch("https://api-transformer.onrender.com//https://ucsb.instructure.com/api/v1/users/self", {
      "method": "GET",
      "headers": headers
    });
    setInfo(await response.json());
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
              <Image
                  style={{
                    width: 100,
                    height: 100
                  }}
                  source={{
                    uri: info.avatar_url
                  }}
              />
              <Text>{info.name} ({info.pronouns})</Text>
              <Text>Created at {new Date(info.created_at).toDateString()}</Text>
              <Button
                  title="Go to second page"
                  onPress={() => router.navigate("/page")}/>
            </>
        ) : (
            <Text>Not signed in</Text>
        )}
      </View>
  );
}
