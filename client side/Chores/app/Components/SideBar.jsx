import React, { useState } from "react";
import { Animated, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const Sidebar = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRight] = useState(new Animated.Value(-250));

  const toggleSidebar = () => {
    Animated.timing(sidebarRight, {
      toValue: sidebarOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { right: sidebarRight, display: sidebarOpen ? "flex" : "none" },
        ]}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.sidebarItem}
            onPress={() => router.push(item.screen)}
          >
            <Text style={styles.sidebarText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.navButton} onPress={toggleSidebar}>
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>
    </>
  );
};

const menuItems = [
       
  { screen: "/HomePageScreen", label: "דף הבית "},
  { screen: "/ListsScreen", label: "רשימת קניות" },
  { screen: "/TasksListScreen", label: "משימות" },
  { screen: "/LoginScreen", label: "התחברות" },
  { screen: "/ProfileScreen", label: "אזור אישי" },
  { screen: "/settings", label: "הגדרות" },
];

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    paddingTop: 60, 
    bottom: 0,
    width: 250,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: -2, height: 0 },
    elevation: 5,
    zIndex: 10
  },
  sidebarItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sidebarText: {
    fontSize: 16,
    textAlign: "right",
  },
  navButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 10
   
  },
});

export default Sidebar;
