import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, FlatList, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// כל משתמש יכיל גם תמונת פרופיל
const storiesData = [
  {
    id: 1,
    username: "Evyatar",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    images: [
      { uri: "https://picsum.photos/id/1011/800/600", uploadDate: "2025-03-20", uploadTime: "10:30 AM" },
      { uri: "https://picsum.photos/id/1025/800/600", uploadDate: "2025-03-19", uploadTime: "5:45 PM" },
      { uri: "https://picsum.photos/id/1039/800/600", uploadDate: "2025-03-18", uploadTime: "3:15 PM" },
    ],
  },
  {
    id: 5,
    username: "Dana",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    images: [
    ],
  },
  {
    id: 2,
    username: "Dana",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    images: [
    ],
  },
  {
    id: 3,
    username: "Yossi",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    images: [
      { uri: "https://picsum.photos/id/1074/800/600", uploadDate: "2025-03-22", uploadTime: "11:00 AM" },
      { uri: "https://picsum.photos/id/1084/800/600", uploadDate: "2025-03-18", uploadTime: "8:30 PM" },
      { uri: "https://picsum.photos/id/109/800/600", uploadDate: "2025-03-17", uploadTime: "4:00 PM" },
    ],
  },
  {
    id: 4,
    username: "Maya",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    images: [
      { uri: "https://picsum.photos/id/110/800/600", uploadDate: "2025-03-22", uploadTime: "3:20 PM" },
      { uri: "https://picsum.photos/id/111/800/600", uploadDate: "2025-03-16", uploadTime: "6:40 PM" },
    ],
  },
];

// פונקציה לחישוב הזמן שחלף
const timeAgo = (uploadDate, uploadTime) => {
  const now = new Date();
  const uploadDateTime = new Date(uploadDate + " " + uploadTime);
  const diffInMs = now - uploadDateTime;

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ימים`;
  } else if (hours > 0) {
    return `${hours} שעות`;
  } else if (minutes > 0) {
    return `${minutes} דקות`;
  } else {
    return `${seconds} שניות`;
  }
};

// פונקציה למיין את התמונות של כל משתמש לפי תאריך ושעה העלאה
storiesData.forEach((story) => {
  if (story.images.length > 0) {
    story.images.sort((a, b) => {
      const dateA = new Date(a?.uploadDate + " " + a?.uploadTime);
      const dateB = new Date(b?.uploadDate + " " + b?.uploadTime);
      return dateB - dateA; // מיין לפי הזמן האחרון
    });
  }
});

// מיון המשתמשים לפי התמונה הכי חדשה (לפי תאריך ושעה) והם ממויינים בסדר לפי מי שיש לו תמונות
const sortedStoriesData = storiesData.sort((a, b) => {
  if (a.images.length === 0 && b.images.length === 0) return 0;
  if (a.images.length === 0) return 1;
  if (b.images.length === 0) return -1;

  const latestA = new Date(a.images[0].uploadDate + " " + a.images[0].uploadTime);
  const latestB = new Date(b.images[0].uploadDate + " " + b.images[0].uploadTime);
  return latestB - latestA;
});

const StoryComponent = () => {
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openStory = (user) => {
    if (user.images.length == 0) return;
    setCurrentUser(user);
    setCurrentImageIndex(0); // מתחילים מהתמונה הראשונה
    setVisible(true);
  };

  const closeStory = () => {
    setVisible(false);
    setCurrentUser(null);
    setCurrentImageIndex(0); // מאפס את מיקום התמונה
  };
  const goToNextImage = () => {
    if (currentUser && currentImageIndex < currentUser.images.length - 1) {
      // יש עוד תמונות באותו משתמש
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // חיפוש המשתמש הבא עם תמונות
      const currentIndex = sortedStoriesData.findIndex(user => user.id === currentUser.id);

      for (let i = currentIndex + 1; i < sortedStoriesData.length; i++) {
        if (sortedStoriesData[i].images.length > 0) {
          setCurrentUser(sortedStoriesData[i]);
          setCurrentImageIndex(0); // מתחילים מהתמונה הראשונה של המשתמש הבא
          return;
        }
      }
      closeStory();
    }
  };


  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      // אם יש תמונות קודמות אצל המשתמש הנוכחי
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // חיפוש המשתמש הקודם שיש לו תמונות להציג
      const currentIndex = sortedStoriesData.findIndex(user => user.id === currentUser.id);

      for (let i = currentIndex - 1; i >= 0; i--) {
        if (sortedStoriesData[i].images.length > 0) {
          setCurrentUser(sortedStoriesData[i]);
          setCurrentImageIndex(sortedStoriesData[i].images.length - 1); // עוברים לתמונה האחרונה של המשתמש הקודם
          return;
        }
      }

      // אם לא נמצאו עוד משתמשים עם תמונות, נסגור את התצוגה
      closeStory();
    }
  };

  const handleScroll = (event) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    if (contentOffsetY > 100) {
      closeStory(); // אם הגלילה היא למטה מעל 100 פיקסלים, נסגור את המודל
    }
  };
  const renderStory = ({ item }) => (
    <TouchableOpacity onPress={() => openStory(item)} style={styles.storyContainer}>
      {/* תמונת פרופיל */}
      {item.profileImage ? (
        <View
          style={
            item.images.length > 0
              ? styles.profileImageWithStories
              : styles.profileImageWithoutStories
          }
        >
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        </View>
      ) : (
        <View style={styles.noProfileImage} />
      )}
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedStoriesData}
        renderItem={renderStory}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />

<Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {currentUser && (
            <>
              {/* פרטי המשתמש בראש המודל */}
              <View style={styles.modalHeader}>
                <Image
                  source={{ uri: currentUser.profileImage }}
                  style={styles.modalProfileImage}
                />
                <View style={styles.userDetailsContainer}>
                  <Text style={styles.username}>{currentUser.username}</Text>
                  <Text style={styles.uploadDetails}>
                  {timeAgo(currentUser.images[currentImageIndex]?.uploadDate, currentUser.images[currentImageIndex]?.uploadTime)}
                  </Text>
                </View>
              </View>

              {/* תמונת הסיפור */}
              <Image
                source={{ uri: currentUser.images[currentImageIndex]?.uri }}
                style={styles.fullStory}
              />
            </>
          )}

          {/* כפתורים למעבר בין תמונות */}
          <TouchableOpacity onPress={goToPreviousImage} style={styles.navButtonLeft} />
          <TouchableOpacity onPress={goToNextImage} style={styles.navButtonRight} />

          {/* כפתור לסגירת התצוגה */}
          <TouchableOpacity onPress={closeStory} style={styles.closeButton}>
            <Icon name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#fff",
  },

  storyContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },

  profileImageWithStories: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ff006e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  profileImageWithoutStories: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  noProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff006e",
    justifyContent: "center",
    alignItems: "center",
  },

  username: {
    fontSize: 14,
    color: "white",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 100,
  },

  modalProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  userDetailsContainer: {
    alignItems: "flex-start",
  },

  uploadDetails: {
    fontSize: 14,
    color: "white",
  },

  fullStory: {
    width: "100%",
    height: "100%",
  },

  navButtonLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "50%",
    zIndex: 100,
  },

  navButtonRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "50%",
    zIndex: 100,
  },

  closeButton: {
    position: "absolute",
    top: 25,
    right: 20,
    padding: 5,
    backgroundColor: "#ededed",
    borderRadius: 20,
    zIndex: 100,
  },

  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StoryComponent;
