import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Avatar } from '@rneui/themed';
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, home, logout } = useUserAndHome();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const handleEdit = () => {
    router.push({
      pathname: "./EditProfileScreen",
    })
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
      <NormalHeader title="אזור אישי" targetScreen="./"/>

      <View style={styles.profileCard}>
        <Avatar
          source={{ uri: user?.profilePicture || "https://via.placeholder.com/150" }}
          size="large"
          rounded
        />
        <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.name}>{user?.name}</Text>
        {isEditing && (
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="שם חדש"
          />
        )}
        <Text style={styles.code}>קוד הבית: {home?.code}</Text>
      </View>

      <Text style={styles.subTitle}>חברי הבית</Text>
      <View style={styles.membersList}>
        {home?.members?.length > 0 ? (
          home.members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>
                {member.id === user.id ? "אתה" : member.role === "admin" ? "מנהל" : "חבר"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMembers}>אין חברים בבית</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="exit-to-app" size={24} color="#fff" />
        <Text style={styles.logoutText}>התנתקות</Text>
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
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
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
  code: {
    fontSize: 12,
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
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  membersList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  memberRole: {
    fontSize: 16,
    color: "#888",
  },
  noMembers: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff5555",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ProfileScreen;
