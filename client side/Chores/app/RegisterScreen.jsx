import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import ErrorNotification from "./Components/ErrorNotification";
import Icon from "react-native-vector-icons/MaterialIcons";

const RegisterScreen = () => {
  const router = useRouter();
  const { saveUser } = useUserAndHome();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCloseError = () => {
    setErrorMessage("");
    setErrorVisible(false);
  };

  const validateEmail = (email) => {
    const emailRegex =
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setErrorMessage("אנא מלא את כל השדות");
      setErrorVisible(true);
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

    setLoading(true);

    const newUser = { name, email, password };
    await saveUser(newUser);

    setLoading(false);
    router.push("/JoinOrCreateHomeScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הרשמה</Text>

      <View style={styles.inputContainer}>
        <Icon name="person" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="שם מלא"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="email" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "visibility" : "visibility-off"}
            size={24}
            color="#666"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>הירשם</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
        <Text style={styles.link}>כבר יש לך חשבון? התחבר כאן</Text>
      </TouchableOpacity>

      <ErrorNotification
        message={errorMessage}
        visible={errorVisible}
        onClose={handleCloseError}
      />
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
    paddingHorizontal: 10,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
    outlineStyle: "none",
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50",
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

export default RegisterScreen;
