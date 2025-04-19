import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import PageWithMenu from "./Components/PageWithMenu";

const SettingsScreen = () => {
  const { user, home, joinHome, setHome, setUser, leaveHome } = useUserAndHome();
  const [joinCode, setJoinCode] = useState("");

  const handleJoinHome = async () => {
    if (!joinCode.trim()) return;

    const success = await joinHome(joinCode.trim(), user);
    if (!success) {
      Alert.alert("שגיאה", "קוד לא תקין או שהצטרפות נכשלה");
    } else {
      setJoinCode("");
    }
  };


  return (
    <PageWithMenu>
      <View style={styles.container}>
        <Text style={styles.title}>הגדרות</Text>

        <Text style={styles.label}>קוד הבית שלך:</Text>
        <Text selectable style={styles.code}>{home?.code || "לא משויך לבית"}</Text>

        <TouchableOpacity style={styles.leaveButton} onPress={() => leaveHome(user?.id)}>
          <Text style={styles.buttonText}>התנתק מהבית</Text>
        </TouchableOpacity>


        <Text style={styles.label}>הצטרפות לבית חדש לפי קוד:</Text>
        <TextInput
          style={styles.input}
          placeholder="הכנס קוד בית"
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinHome}>
          <Text style={styles.buttonText}>הצטרף</Text>
        </TouchableOpacity>

        {user?.role === "admin" && (
          <>
            <Text style={styles.label}>חברי הבית:</Text>
            <FlatList
              data={home?.members || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  {item.id !== user.id && (
                    <TouchableOpacity onPress={() => leaveHome(item.id)}>
                      <Text style={styles.removeText}>הסר</Text>
                    </TouchableOpacity>

                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={styles.empty}>אין משתמשים</Text>}
            />
          </>
        )}
      </View>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "right" },
  label: { fontSize: 16, marginTop: 15, textAlign: "right" },
  code: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    fontFamily: "monospace",
    marginTop: 5,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  joinButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  leaveButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  memberName: { fontSize: 16 },
  removeText: { color: "#f44336", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 10, color: "#999" },
});

export default SettingsScreen;
