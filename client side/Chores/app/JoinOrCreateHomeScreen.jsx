import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";

const JoinOrCreateHomeScreen = () => {
  const router = useRouter();
  const { user, joinHome, setNewHome } = useUserAndHome();
  const [code, setCode] = useState("");
  const [homeName, setHomeName] = useState("");

  const handleJoinHome = () => {
    if (!code) {
      Alert.alert("שגיאה", "אנא הכנס קוד בית");
      return;
    }
    if (joinHome(code, user)) {
      Alert.alert("הצטרפת לבית בהצלחה!");
      router.push("/HomePageScreen");
    } else {
      Alert.alert("שגיאה", "קוד הבית אינו תקף");
    }
  };

  const handleCreateHome = () => {
    if (!homeName) {
      Alert.alert("שגיאה", "אנא הכנס שם לבית");
      return;
    }
    setNewHome(homeName, user);
    router.push("/HomePageScreen");
  };

  return (
    <View style={styles.container}>
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
