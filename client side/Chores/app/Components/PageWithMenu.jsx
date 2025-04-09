import React, { useState } from "react";
import { View, Animated, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, Image } from "react-native";
import { useRouter, useSegments } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserAndHome } from "../Context/UserAndHomeContext";



const PageWithMenu = (props) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRight] = useState(new Animated.Value(-250)); // מתחיל מחוץ לתצוגה בצד ימין
  const segments = useSegments();
  const {user} = useUserAndHome();
  
  const currentPath = "/"+segments[0]; 
 console.log(currentPath)
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
        <TouchableOpacity style={styles.userContainer} onPress={() => router.push("/ProfileScreen")}>
  <Image
    source={user?.profilePicture?{ uri: user?.profilePicture}:require('../images/userImage.jpg') }
    style={styles.userImage}
  />
  <View style={styles.userInfo}>
    <Text style={styles.userName}>{user?.name}</Text>
    <Text style={styles.userEmail}>{user?.email}</Text>
  </View>
</TouchableOpacity>
        {menuItems.map((item) => {
  const isActive = currentPath === item.screen;

  return (
    <View key={item.screen}>
      <TouchableOpacity
        style={[
          styles.drawerItem,
          isActive && styles.activeDrawerItem
        ]}
        onPress={() => {
          closeDrawer();
          router.push(item.screen);
        }}
      >
        <Text style={[
          styles.drawerText,
          isActive && styles.activeDrawerText
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>

      {item.image && (
        <Image source={item.image} style={styles.drawerImage} />
      )}
    </View>
  );
})}

      </Animated.View>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {props.children}
      </View>

      {/* Bottom Menu Bar */}
  {/* Bottom Menu Bar */}
<View style={styles.bottomMenu}>
  <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ChatScreen")}>
    <View style={[
      styles.iconWrapper,
      currentPath == "/ChatScreen" && styles.activeIconWrapper
    ]}>
      <Icon name="chat" size={24} color={currentPath == "/ChatScreen" ? "#007bff" : "black"} />
      <Text style={[
        styles.navText,
        currentPath == "/ChatScreen" && styles.activeText
      ]}>
        צ'אט
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => router.push("/ListsScreen")}>
    <View style={[
      styles.iconWrapper,
      currentPath == "/ListsScreen" && styles.activeIconWrapper
    ]}>
      <Icon name="list" size={24} color={currentPath == "/ListsScreen" ? "#007bff" : "black"} />
      <Text style={[
        styles.navText,
        currentPath == "/ListsScreen" && styles.activeText
      ]}>
        רשימות
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => router.push("/TasksListScreen")}>
    <View style={[
      styles.iconWrapper,
      currentPath == "/TasksListScreen" && styles.activeIconWrapper
    ]}>
      <Icon name="check-circle" size={24} color={currentPath == "/TasksListScreen" ? "#007bff" : "black"} />
      <Text style={[
        styles.navText,
        currentPath == "/TasksListScreen" && styles.activeText
      ]}>
        משימות
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={() => router.push("/HomePageScreen")}>
    <View style={[
      styles.iconWrapper,
      currentPath == "/HomePageScreen" && styles.activeIconWrapper
    ]}>
      <Icon name="home" size={24} color={currentPath == "/HomePageScreen" ? "#007bff" : "black"} />
      <Text style={[
        styles.navText,
        currentPath == "/HomePageScreen" && styles.activeText
      ]}>
        בית
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navButton} onPress={toggleDrawer}>
    <View style={styles.iconWrapper}>
      <Icon name="menu" size={30} color="black" />
    </View>
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
    zIndex: 10,
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: -250, // מתחיל מחוץ לתצוגה בצד ימין
    bottom: 0,
    width: 230, // רוחב הדראואר
    backgroundColor: "white",
    paddingTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
    zIndex: 10,
  },
  userContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    paddingTop: 20,
    borderRadius: 12,
    margin: 10,
  },
  
  userImage: {
    width: 60,
    height: 60,
    marginLeft:10,
    borderRadius: 30,
    backgroundColor: "#ddd",
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    textAlign:"right",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  
  userEmail: {
    textAlign:"right",
    fontSize: 14,
    color: "#777",
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
    paddingHorizontal: 10,

  },
  drawerText: {
    fontSize: 16,
    textAlign: "right",
    fontWeight: "bold",

  },
  mainContent: {
    flex: 1,
    marginBottom: 60
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
  activeDrawerItem: {
    backgroundColor: '#e0f0ff', // רקע בהיר
    borderRadius: 8,
  },
  
  activeDrawerText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  iconWrapper: {
    alignItems: "center",
    paddingHorizontal: 10,
    padding:5,
    width:80,
    borderRadius: 20,
  },
  
  activeIconWrapper: {
    backgroundColor: "#e0f0ff", // כחול
  },
  activeText: {
    color: '#007bff',
    fontWeight: "bold",
  },
  bottomMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    flexDirection: "row", // סדר אופקי של כפתורים
    justifyContent: "space-around", // שיבוץ כפתורים עם רווח שווה ביניהם
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingHorizontal:10
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
