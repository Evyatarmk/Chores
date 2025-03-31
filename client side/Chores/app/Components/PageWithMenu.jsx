import React, { useState } from "react";
import { View, Animated, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, Image } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";



const PageWithMenu = (props) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRight] = useState(new Animated.Value(-250)); // מתחיל מחוץ לתצוגה בצד ימין

  const toggleDrawer = () => {
    Animated.timing(drawerRight, {
      toValue: drawerOpen ? -250 : 0, // אם פתוח, נסגור אותו מצד ימין, אחרת נפתח אותו
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    Animated.timing(drawerRight, {
      toValue: -250, // סוגר את הדראואר
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(false);
  };
  return (
    <View style={styles.container}>
      {/* Close Drawer on TouchableWithoutFeedback */}
      {drawerOpen ? (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      ) : null}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { right: drawerRight, display: drawerOpen ? "flex" : "none" },
        ]}
      >
        {/* Close Button in Drawer */}
        <TouchableOpacity style={styles.closeButton} onPress={closeDrawer}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>

        {menuItems.map((item) => (
          <View key={item.screen}>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => router.push(item.screen)}
            >
              <Text style={styles.drawerText}>{item.label}</Text>
            </TouchableOpacity>

            {/* ✅ Render additional image if this item has one */}
            {item.image && (
              <Image source={item.image} style={styles.drawerImage} />
            )}
          </View>
        ))}
      </Animated.View>


      {/* Main Content */}
      <View style={styles.mainContent}>
        {props.children}
      </View>

      {/* Bottom Menu Bar */}
      <View style={styles.bottomMenu}>
        {/* 4 buttons at the bottom with icons */}
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ChatScreen")}>
          <Icon name="chat" size={24} color="black" />
          <Text style={styles.navText}>צ'אט</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ListsScreen")}>
          <Icon name="list" size={24} color="black" />
          <Text style={styles.navText}>רשימות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/TasksListScreen")}>
          <Icon name="check-circle" size={24} color="black" />
          <Text style={styles.navText}>משימות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ProfileScreen")}>
          <Icon name="person" size={24} color="black" />
          <Text style={styles.navText}>אזור אישי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/HomePageScreen")}>
          <Icon name="home" size={24} color="black" />
          <Text style={styles.navText}>דף הבית</Text>
        </TouchableOpacity>
        {/* Menu Button for opening the drawer */}
        <TouchableOpacity style={styles.navButton} onPress={toggleDrawer}>
          <Icon name="menu" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const menuItems = [
  { screen: "/HomePageScreen", label: "דף הבית" },
  { screen: "/ListsScreen", label: "רשימת קניות" },
  { screen: "/TasksListScreen", label: "משימות" },
  { screen: "/LoginScreen", label: "התחברות" },
  { screen: "/ProfileScreen", label: "אזור אישי" },
  { screen: "/settings", label: "הגדרות" },
  {
    screen: "/ChatScreen", label: "צ'אט",
    image: require("../images/result.png")
  },


];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // רקע כהה להבליט את הדראואר
    zIndex: 5,
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: -250, // מתחיל מחוץ לתצוגה בצד ימין
    bottom: 0,
    width: 250, // רוחב הדראואר
    backgroundColor: "#b0bfcc",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 10,
    padding: 10,
    zIndex: 1001,
  },
  drawerItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  drawerText: {
    fontSize: 16,
    textAlign: "right",
    fontWeight: "bold",

  },
  mainContent: {
    flex: 1,
    marginBottom: 80
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    
  },
  bottomMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    flexDirection: "row", // סדר אופקי של כפתורים
    justifyContent: "space-around", // שיבוץ כפתורים עם רווח שווה ביניהם
    backgroundColor: "#b0bfcc",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navButton: {
    padding: 10,
    flex: 1, // כפתור שנמתח על כל הרוחב של החלק השייך לו
    alignItems: "center",
  },
  navText: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
  },
  drawerImage: {
    width: 400,
    height: 400,
    alignSelf: "center",
    marginTop: 10,
    resizeMode: "contain",
  },

});

export default PageWithMenu;
