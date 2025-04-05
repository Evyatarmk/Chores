import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import ErrorNotification from "./Components/ErrorNotification";

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useUserAndHome();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };
  const handleLogin = async() => {
    if (!email || !password) {
      setErrorMessage("אנא מלא את כל השדות");
      setErrorVisible(true)
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("אימייל לא חוקי");
      setErrorVisible(true);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("הסיסמה חייבת להיות לפחות 8 תווים");
      setErrorVisible(true);
      return;
    }

    const user = await login(email, password);
    if (user) {
      router.push("/HomePageScreen");
    } else {
      setErrorMessage("אימייל או סיסמה לא נכונים");
      setErrorVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>התחברות</Text>
      <TextInput style={styles.input} placeholder="אימייל" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="סיסמה" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>התחבר</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => router.push("/RegisterScreen")}>
        אין לך חשבון? הירשם כאן
      </Text>
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
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
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default LoginScreen;