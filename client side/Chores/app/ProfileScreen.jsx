import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput } from "react-native";
import { useUserAndHome} from "./Context/UserAndHomeContext"; // ייבוא הקונטקסט שלך
import { useRouter } from "expo-router";

const ProfileScreen = () => {
      const router = useRouter();
  
  const { user,home, logout } = useUserAndHome();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };
 const handleLogout=()=>{
  logout()
  router.push("/LoginScreen")
 }
  const handleSave = () => {
    // כאן תוכל לעדכן את פרטי המשתמש
    // לדוגמה, אם אתה מחובר ל-API תוכל לשלוח את השם החדש
    console.log("שם חדש: ", newName);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>אזור אישי</Text>
      {user ? (
        <>
          <Text style={styles.label}>שם: </Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}

          <Button
            title={isEditing ? "שמור" : "ערוך"}
            onPress={isEditing ? handleSave : handleEdit}
          />

          <Button title="התנתקות" onPress={handleLogout} color="red" />
        </>
      ) : (
        <Text>אין משתמש מחובר</Text>
      )}
    </View>
  );
};

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
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
});

export default ProfileScreen;
