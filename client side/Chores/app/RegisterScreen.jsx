import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
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
    router.push("/JoinOrCreateHomeScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הרשמה</Text>
      <TextInput style={styles.input} placeholder="שם מלא" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="אימייל" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="סיסמה" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>הירשם</Text>
      </TouchableOpacity>
      
      <Text style={styles.link} onPress={() => router.push("/LoginScreen")}>
        כבר יש לך חשבון? התחבר כאן
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e0e5ec",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    color: "#007BFF",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default RegisterScreen;