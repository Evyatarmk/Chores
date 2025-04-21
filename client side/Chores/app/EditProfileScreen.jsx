import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { Avatar } from '@rneui/themed';
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useApiUrl } from "./Context/ApiUrlProvider";

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useUserAndHome();
  const { baseUrl } = useApiUrl();
  const [newName, setNewName] = useState(user?.name || "");
  const [imageUri, setImageUri] = useState(user.profilePicture);


const handleSave = async () => {
  if (!newName.trim() && !imageUri) {
    Alert.alert("שגיאה", "לא בוצע שינוי בשם או בתמונה");
    return;
  }

  try {
    const formData = new FormData();
    const fileName = imageUri?.split('/').pop();

    const extension = fileName?.split('.').pop()?.toLowerCase();
    let fileType = 'application/octet-stream';

    if (extension === 'jpg' || extension === 'jpeg') {
      fileType = 'image/jpeg';
    } else if (extension === 'png') {
      fileType = 'image/png';
    } else if (extension === 'mp4') {
      fileType = 'video/mp4';
    } else if (extension === 'mov') {
      fileType = 'video/quicktime';
    }

    console.log('✅ סיומת שזוהתה:', extension);
    console.log('✅ סוג הקובץ שנשלח:', fileType);

    if (imageUri.startsWith('data:')) {
      const fetchRes = await fetch(imageUri);
      const blob = await fetchRes.blob();
      formData.append('MediaFile', blob, fileName);
    } else {
      formData.append('MediaFile', {
        uri: imageUri,
        name: fileName,
        type: fileType,
      });
    }

    formData.append("Id", user.id);
    if (newName.trim()) {
      formData.append("Name", newName);
    }

    const res = await fetch(`${baseUrl}/Users/editUserProfilePicAndName`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("עדכון הפרופיל נכשל");

    const updatedUser = await res.json();
    updateUser(updatedUser);
    Alert.alert("הצלחה", "הפרופיל עודכן בהצלחה");
    router.push("/ProfileScreen");
  } catch (error) {
    console.error("❌ שגיאה בעדכון:", error);
    Alert.alert("שגיאה", "אירעה שגיאה בעדכון הפרופיל");
  }
};

  

  const handleImageChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("שגיאה", "אין הרשאה לגשת לגלריה");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="עריכת פרופיל" />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            key={imageUri}
            source={imageUri ? { uri: imageUri } : require('./images/userImage.jpg')}
            style={styles.userImage}
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
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  profileCard: {
    padding: 20, borderRadius: 15, alignItems: "center", backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, marginBottom: 20, position: "relative",
  },
  avatarContainer: { position: "relative" },
  editIcon: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#4CAF50", padding: 6, borderRadius: 20, elevation: 3,
  },
  name: { fontSize: 22, fontWeight: "bold", marginVertical: 10, color: "#333" },
  input: {
    fontSize: 18, borderWidth: 1, borderColor: "#ddd",
    padding: 10, borderRadius: 8, width: "100%", textAlign: "right", backgroundColor: "#f9f9f9",
  },
  saveButton: {
    marginTop: 20, backgroundColor: "#4CAF50",
    paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelButton: {
    marginTop: 15, paddingVertical: 12, paddingHorizontal: 25,
    borderRadius: 8, backgroundColor: "#ff5555", alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  userImage: {
    width: 80,
    height: 80,
    marginLeft: 10,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
});

export default EditProfileScreen;
