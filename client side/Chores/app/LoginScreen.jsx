import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useUserAndHome();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות");
      return;
    }

    const user = login(email, password);
    if (user) {
      Alert.alert("התחברת בהצלחה!");
      router.push("/HomePageScreen")
    } else {
      Alert.alert("שגיאה", "אימייל או סיסמה לא נכונים");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>התחברות</Text>
      <TextInput style={styles.input} placeholder="אימייל" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="סיסמה" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="התחבר" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => router.push("/RegisterScreen")}>אין לך חשבון? הירשם כאן</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10, backgroundColor: "#fff",textAlign:"right" },
  link: { marginTop: 10, color: "blue", textDecorationLine: "underline" }
});

export default LoginScreen;
