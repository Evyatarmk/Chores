import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRight = useRef(new Animated.Value(-200)).current; // Start hidden

  const toggleSidebar = () => {
    Animated.timing(sidebarRight, {
      toValue: sidebarOpen ? -200 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { right: sidebarRight, display: sidebarOpen ? "flex" : "none" }]}>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push("./GroceryListsScreen")}>
          <Text style={styles.sidebarText}>רשימת קניות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push("/tasks")}>
          <Text style={styles.sidebarText}>משימות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push("/settings")}>
          <Text style={styles.sidebarText}>הגדרות</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.navButton} onPress={toggleSidebar}>
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {/* Main Content */}
      <Text style={styles.title}>Welcome to Your Chores App</Text>
      <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 80,
  },
  sidebarItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sidebarText: {
    fontSize: 18,
    color: "#333",
  },
  navButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
});
