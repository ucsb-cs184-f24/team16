import {Button, StyleSheet, TextInput, View} from "react-native";
import {useState} from "react";
import {ThemedText} from "@/components/ThemedText";
import type {Credentials} from "@/types/firebase";
import {setValue} from "@/helpers/storage";

interface SignInProps {
  err: string | null;
}

export default function SignIn({err}: SignInProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Sign In</ThemedText>
        {err ? (
            <ThemedText style={styles.errorText}>{err}</ThemedText>
        ) : null}
        <TextInput
            style={styles.input}
            placeholder="UCSB Net ID"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        <Button title="Sign In"
                onPress={async () => {
                  const credentials: Credentials = {username, password};
                  setValue("credentials", credentials);
                }}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    color: "#4285F4",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
