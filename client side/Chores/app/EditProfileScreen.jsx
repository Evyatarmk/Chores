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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
    if (!permissionResult.granted || !cameraPermissionResult.granted) {
      Alert.alert("שגיאה", "אין לך הרשאות לגישה לגלריה או למצלמה");
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
  
    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      const filename = uri.split('/').pop();
  
      try {
        const uploadedUri = await uploadProfilePicture(uri, filename, user.homeId, user.id);
  
        // uploadedUri is like "https://yourserver.com/uploads/filename.jpg"
        // If you want to store only filename:
        const shortFileName = uploadedUri.split('/').pop(); 
  
        await updateUser(newName, shortFileName); // updating only the filename
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    }
  };


  const uploadProfilePicture = async (uri, filename, homeId, userId) => {
    const formData = new FormData();
  
    formData.append('MediaFile', {
      uri: uri,
      name: filename,
      type: 'image/jpeg', // or png
    });
  
    formData.append('Type', 'profilePicture'); // you can define 'profilePicture' as a type
    formData.append('UploadDate', new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    formData.append('UploadTime', new Date().toLocaleTimeString()); // HH:mm:ss
  
    try {
      const response = await fetch(`${baseUrl}/home/${homeId}/users/${userId}/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
  
      const result = await response.json();
      console.log('Image uploaded successfully:', result);
  
      // `result.Uri` will have full URL (https://yourhost/uploads/xxx.jpg)
      return result.Uri; // return the image URL
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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
