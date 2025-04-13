import React, { useState,useEffect,useRef} from "react";
import { View, Animated, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, Image } from "react-native";
import { useRouter, useSegments } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserAndHome } from "../Context/UserAndHomeContext";
import { useNotification } from '../Context/NotificationContext';
import { usePathname } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../FirebaseConfig'; 
import { Timestamp } from 'firebase/firestore';



const PageWithMenu = (props) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRight] = useState(new Animated.Value(-250));
  const segments = useSegments();
  const { user } = useUserAndHome();
  const { setUnreadCount, unreadCount } = useNotification();
  const pathname = usePathname();

  const lastSeenTimestampRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user?.homeId) return;
  
    const houseId = user.homeId;
    const q = query(
      collection(db, 'houses', houseId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs;
      if (!docs.length) return;
  
      const latest = docs[docs.length - 1].data();
      const latestSender = latest.sender;
  
      // Handle latest timestamp correctly: it may come as Firestore Timestamp
      const latestTimestamp = latest.timestamp instanceof Timestamp
        ? latest.timestamp.toDate() // If it's a Firestore Timestamp, convert to Date
        : new Date(latest.timestamp); // Else, treat it as a normal string/Date
  
      console.log("Raw latest timestamp:", latestTimestamp);
  
      if (!initializedRef.current) {
        lastSeenTimestampRef.current = latestTimestamp;
        initializedRef.current = true;
        return;
      }
  
      const lastSeen = lastSeenTimestampRef.current;
  
      // Convert lastSeen to Date if it's a Firestore Timestamp
      const lastSeenDate = lastSeen instanceof Timestamp ? lastSeen.toDate() : new Date(lastSeen);
  
      console.log("Last seen timestamp:", lastSeenDate);
  
      const isFromAnotherUser = latestSender !== user.name;
      const isNotOnChatScreen = pathname !== '/ChatScreen';
      const isNewMessage = latestTimestamp > lastSeenDate;
  
      if (isFromAnotherUser && isNotOnChatScreen && isNewMessage) {
        setUnreadCount((prev) => prev + 1);
        lastSeenTimestampRef.current = latestTimestamp;
      }
    });
  
    return () => unsubscribe();
  }, [user?.homeId]);
  
  
  // Reset unread count when on chat screen
  useEffect(() => {
    if (pathname === '/ChatScreen') {
      setUnreadCount(0);
    }
  }, [pathname]);

  const currentPath = '/' + segments[0];

  const toggleDrawer = () => {
    Animated.timing(drawerRight, {
      toValue: drawerOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    Animated.timing(drawerRight, {
      toValue: -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(false);
  };

  return (
    <View style={styles.container}>
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.drawer,
          { right: drawerRight, display: drawerOpen ? 'flex' : 'none' },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={closeDrawer}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userContainer} onPress={() => router.push('/ProfileScreen')}>
          <Image
            source={user?.profilePicture ? { uri: user.profilePicture } : require('../images/userImage.jpg')}
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
                style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
                onPress={() => {
                  closeDrawer();
                  router.push(item.screen);
                }}
              >
                <Text style={[styles.drawerText, isActive && styles.activeDrawerText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
              {item.image && <Image source={item.image} style={styles.drawerImage} />}
            </View>
          );
        })}
      </Animated.View>

      <View style={styles.mainContent}>{props.children}</View>

      {/* Bottom Menu Bar */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => router.push('/ChatScreen')} style={styles.navButton}>
          <View style={styles.iconWrapper}>
            <Icon
              name="chat"
              size={24}
              color={currentPath === '/ChatScreen' ? '#007bff' : 'black'}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
            <Text style={styles.navText}>צ'אט</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/ListsScreen')}>
          <View style={[styles.iconWrapper, currentPath === '/ListsScreen' && styles.activeIconWrapper]}>
            <Icon
              name="list"
              size={24}
              color={currentPath === '/ListsScreen' ? '#007bff' : 'black'}
            />
            <Text
              style={[styles.navText, currentPath === '/ListsScreen' && styles.activeText]}
            >
              רשימות
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/TasksListScreen')}>
          <View style={[styles.iconWrapper, currentPath === '/TasksListScreen' && styles.activeIconWrapper]}>
            <Icon
              name="check-circle"
              size={24}
              color={currentPath === '/TasksListScreen' ? '#007bff' : 'black'}
            />
            <Text
              style={[styles.navText, currentPath === '/TasksListScreen' && styles.activeText]}
            >
              משימות
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/HomePageScreen')}>
          <View style={[styles.iconWrapper, currentPath === '/HomePageScreen' && styles.activeIconWrapper]}>
            <Icon
              name="home"
              size={24}
              color={currentPath === '/HomePageScreen' ? '#007bff' : 'black'}
            />
            <Text
              style={[styles.navText, currentPath === '/HomePageScreen' && styles.activeText]}
            >
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
  { screen: '/HomePageScreen', label: 'דף הבית' },
  { screen: '/ListsScreen', label: 'רשימת קניות' },
  { screen: '/TasksListScreen', label: 'משימות' },
  { screen: '/LoginScreen', label: 'התחברות' },
  { screen: '/ProfileScreen', label: 'אזור אישי' },
  { screen: '/settings', label: 'הגדרות' },
  { screen: '/ChatScreen', label: "צ'אט" },
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
  badge: {
    position: 'absolute',
    top: -4,
    right: 16,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

});

export default PageWithMenu;
