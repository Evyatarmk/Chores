import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Avatar } from '@rneui/themed';
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, home, updateUser } = useUserAndHome(); // assuming updateUser is a function to update the user details
  const [newName, setNewName] = useState(user?.name || "");
  const [newProfilePicture, setNewProfilePicture] = useState(user?.profilePicture || "");

  const handleSave = () => {
    if (newName.trim() === "") {
      Alert.alert("שגיאה", "שם לא יכול להיות ריק");
      return;
    }

    // Call updateUser function to save changes
    updateUser(newName, newProfilePicture);
    Alert.alert("הצלחה", "הפרופיל עודכן בהצלחה");
    router.push("/ProfileScreen");  // Redirect back to profile screen
  };

  
  const handleImageChange = async () => {
    // בקשה להרשאות לגישה לגלריה ולמצלמה
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false || cameraPermissionResult.granted === false) {
      Alert.alert("שגיאה", "אין לך הרשאות לגישה לגלריה או למצלמה");
      return;
    }

    // אפשרות לבחור תמונה מהגלריה או לצלם תמונה
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setNewProfilePicture(pickerResult.assets[0].uri); // עדכון התמונה שנבחרה
    }
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="עריכת פרופיל" />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={{ uri: newProfilePicture || "https://via.placeholder.com/150" }}
            size="large"
            rounded
          />
          <TouchableOpacity style={styles.editIcon} onPress={handleImageChange}>
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>שם:</Text>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="הכנס שם חדש"
        />
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>שמור שינויים</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push("/ProfileScreen")} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>ביטול</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  profileCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    position: "relative",
  },
  avatarContainer: {
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  input: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    textAlign: "right",
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: "#ff5555",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
