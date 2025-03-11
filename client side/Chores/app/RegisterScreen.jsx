import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useUserAndHome();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות");
      return;
    }

    const newUser = { id: Date.now(), name, email, password };
    register(newUser);
    Alert.alert("נרשמת בהצלחה!");
    router.push("/JoinOrCreateHomeScreen")
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הרשמה</Text>
      <TextInput style={styles.input} placeholder="שם מלא" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="אימייל" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="סיסמה" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="הירשם" onPress={handleRegister} />
      <Text style={styles.link} onPress={() =>router.push("/LoginScreen")}>כבר יש לך חשבון? התחבר כאן</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10, backgroundColor: "#fff" ,textAlign:"right"},
  link: { marginTop: 10, color: "blue", textDecorationLine: "underline" }
});

export default RegisterScreen;
