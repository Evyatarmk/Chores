import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, FlatList, ScrollView } from "react-native";

// כל משתמש יכיל גם תמונת פרופיל
const storiesData = [
  {
    id: 1,
    username: "Evyatar",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg", // תמונת פרופיל
    images: [
      { uri: "https://source.unsplash.com/random/800x600", uploadDate: "2025-03-20", uploadTime: "10:30 AM" },
      { uri: "https://source.unsplash.com/random/801x601", uploadDate: "2025-03-19", uploadTime: "5:45 PM" },
    ],
  },
  {
    id: 2,
    username: "Dana",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg", // תמונת פרופיל
    images: [
      { uri: "https://source.unsplash.com/random/802x602", uploadDate: "2025-03-21", uploadTime: "2:15 PM" },
    ],
  },
  {
    id: 3,
    username: "Yossi",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg", // תמונת פרופיל
    images: [
      { uri: "https://randomuser.me/api/portraits/men/3.jpg", uploadDate: "2025-03-22", uploadTime: "11:00 AM" },
      { uri: "https://randomuser.me/api/portraits/women/2.jpg", uploadDate: "2025-03-18", uploadTime: "8:30 PM" },
    ],
  },
  {
    id: 4,
    username: "Maya",
    profileImage: "", // לא קיימת תמונת פרופיל
    images: [],
  },
];

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
  const [currentStory, setCurrentStory] = useState(null);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openStory = (story) => {
    setCurrentStory(story);
    setCurrentImageIndex(0); // מתחילים מהתמונה הראשונה
    setVisible(true);
  };

  const closeStory = () => {
    setVisible(false);
    setCurrentStory(null);
    setCurrentImageIndex(0); // מאפס את מיקום התמונה
  };

  const goToNextImage = () => {
    if (currentStory && currentImageIndex < currentStory.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // אם התמונה הנוכחית היא האחרונה של המשתמש, נעבור למשתמש הבא
      if (currentUserIndex < sortedStoriesData.length - 1) {
        const nextUser = sortedStoriesData[currentUserIndex + 1];
        setCurrentStory(nextUser);
        setCurrentImageIndex(0); // מתחילים מהתמונה הראשונה של המשתמש הבא
        setCurrentUserIndex(currentUserIndex + 1);
      } else {
        closeStory(); // אם אין משתמשים יותר, סוגרים את המודל
      }
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity onPress={() => openStory(item)} style={styles.storyContainer}>
      {/* תמונת פרופיל */}
      {item.profileImage ? (
        <View style={styles.profileImageContainer}>
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
          {currentStory && currentStory.images.length > 0 && (
            <Image
              source={{ uri: currentStory.images[currentImageIndex]?.uri }}
              style={styles.fullStory}
            />
          )}
          <View style={styles.navigationButtons}>
            <TouchableOpacity onPress={goToPreviousImage} style={styles.navButtonLeft}>
              <Text style={styles.navButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNextImage} style={styles.navButtonRight}>
              <Text style={styles.navButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closeStory}>
            <Text style={styles.closeText}>X</Text>
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
    justifyContent: "center",
    alignItems: "flex-start",
  },
  flatListContainer: {
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ff006e",
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullStory: {
    width: "90%",
    height: "70%",
    borderRadius: 20,
    marginBottom: 20,
  },
  navigationButtons: {
    position: "absolute",
    top: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  navButtonLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  navButtonRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  navButtonText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "red",
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StoryComponent;
