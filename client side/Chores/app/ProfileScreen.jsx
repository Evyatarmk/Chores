import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { Avatar } from '@rneui/themed';
import { useUserAndHome } from "./Context/UserAndHomeContext"; // ייבוא הקונטקסט שלך
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, home, logout } = useUserAndHome();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    logout();
    router.push("/LoginScreen");
  };

  const handleSave = () => {
    console.log("שם חדש: ", newName);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="אזור אישי" />
      <View style={styles.profileImage}>
        <Avatar
          source={{
            uri: user?.profileImageUrl || {},
          }}
          size="large"
          rounded
          showEditButton
          onError={() => console.log("Error loading image")}
        />
      </View>

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


          {/* רשימת חברי הבית */}
          <Text style={styles.subTitle}>חברי הבית:</Text>
          {home?.members ? (
            home.members.map((item) => (
              <View key={item.id} style={styles.memberItem}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberRole}>
                  {item.id === user.id ? "אתה" : item.role === "admin" ? "מנהל" : "חבר"}
                </Text>
              </View>
            ))
          ) : (
            <Text>אין חברי בית</Text>
          )}
          <TouchableOpacity onPress={handleLogout} style={styles.panelOption}>
            <Icon name="exit-to-app" size={20} color="#ff4444" style={styles.optionIcon} />
            <Text style={styles.panelOptionText}>התנתקות</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>אין משתמש מחובר</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  profileImage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    marginBottom: 20,
  },
  panelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f8d7da", // צבע רקע עדין לאופציה של מחיקה
    marginBottom: 15,
    shadowColor: "#000", // צל להדגשה
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  optionIcon: {
    marginRight: 10,
  },
  panelOptionText: {
    fontSize: 18,
    color: "#ff4444", // צבע אדום כהה
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
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
  subTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // צבע טקסט כהה עבור כותרות
  },
  memberItem: {
    flexDirection: "row-reverse",
    justifyContent:"space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0", // צבע רקע עדין
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // צבע טקסט כהה לשם החבר
  },
  memberRole: {
    fontSize: 16,
    color: "#888", // צבע טקסט בהיר יותר עבור התפקיד
  },
});

export default ProfileScreen;
