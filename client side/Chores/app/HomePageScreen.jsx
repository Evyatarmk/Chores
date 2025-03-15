import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";

import Sidebar from "./Components/SideBar";

export default function HomePage() {
  const router = useRouter();
  



  return (
    <View style={styles.container}>
      <Sidebar/>
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
