import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import ErrorNotification from "./Components/ErrorNotification";
import { Icon } from '@rneui/base';

const JoinOrCreateHomeScreen = () => {
  const router = useRouter();
  const { newUser, joinHome, setNewHome } = useUserAndHome();
  const [code, setCode] = useState("");
  const [homeName, setHomeName] = useState("");
 const [errorMessage, setErrorMessage] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
    const handleCloseError = () => {
      setErrorMessage("")
      setErrorVisible(false)
    };
  const handleJoinHome =async () => {
    if (!code) {
      setErrorMessage("אנא הכנס קוד בית");
      setErrorVisible(true)
      return;
    }
    let status=await joinHome(code, newUser);
    if (status) {
      router.push("/HomePageScreen");
    }
  };

  const handleCreateHome =async () => {
    if (!homeName) {
      setErrorMessage("אנא הכנס שם לבית");
      setErrorVisible(true)

      return;
    }
    let status=await setNewHome(homeName, newUser)
    if (status) {
      router.push("/HomePageScreen");
    } else {
      setErrorMessage("משהו לא עבד אנא נסה שוב");
      setErrorVisible(true)

    }
  };

  return (
    <View style={styles.container}>
            <TouchableOpacity
        onPress={() => router.back()} // פונקציה לחזרה אחורה
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>הצטרף לבית קיים</Text>
      <TextInput
        style={styles.input}
        placeholder="קוד הבית"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleJoinHome}>
        <Text style={styles.buttonText}>הצטרף</Text>
      </TouchableOpacity>

      <Text style={styles.separator}>או</Text>

      <Text style={styles.title}>צור בית חדש</Text>
      <TextInput
        style={styles.input}
        placeholder="שם הבית"
        value={homeName}
        onChangeText={setHomeName}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateHome}>
        <Text style={styles.buttonText}>צור בית</Text>
      </TouchableOpacity>
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
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 20, 
    zIndex: 1, 
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    textAlign: "right",
  },
  separator: {
    marginVertical: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default JoinOrCreateHomeScreen;
