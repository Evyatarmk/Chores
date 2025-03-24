import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, FlatList, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from "expo-av";
import * as ImagePicker from 'expo-image-picker';

const storiesData = [
  {
    
    id: 1,
    username: "Evyatar",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    media: [
      { type: "image", uri: "https://picsum.photos/id/1011/800/600", uploadDate: "2025-03-20", uploadTime: "10:30 AM" },
      { type: "image", uri: "https://picsum.photos/id/1025/800/600", uploadDate: "2025-03-19", uploadTime: "5:45 PM" },
      { type: "image", uri: "https://picsum.photos/id/1039/800/600", uploadDate: "2025-03-18", uploadTime: "3:15 PM" },
      { type: "video", uri: 'https://www.w3schools.com/html/mov_bbb.mp4', uploadDate: "2025-03-18", uploadTime: "3:15 PM" },
    ],

  },
  {
    id: 5,
    username: "Dana",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    media: [],
  },
  {
    id: 2,
    username: "Dana",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    media: [],
  },
  {
    id: 3,
    username: "Yossi",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    media: [
      { type: "image", uri: "https://picsum.photos/id/1074/800/600", uploadDate: "2025-03-22", uploadTime: "11:00 AM" },
      { type: "image", uri: "https://picsum.photos/id/1084/800/600", uploadDate: "2025-03-18", uploadTime: "8:30 PM" },
      { type: "image", uri: "https://picsum.photos/id/109/800/600", uploadDate: "2025-03-17", uploadTime: "4:00 PM" },
    ],
  },
  {
    id: 4,
    username: "Maya",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    media: [
      { type: "image", uri: "https://picsum.photos/id/110/800/600", uploadDate: "2025-03-22", uploadTime: "3:20 PM" },
      { type: "image", uri: "https://picsum.photos/id/111/800/600", uploadDate: "2025-03-16", uploadTime: "6:40 PM" },
    ],
  },
];


const timeAgo = (uploadDate, uploadTime) => {
  const now = new Date();

  // מפצלים את התאריך והשעה לחלקים
  const [year, month, day] = uploadDate.split("-"); // תאריך בפורמט YYYY-MM-DD
  const [hours, minutes, period] = uploadTime.split(/[: ]/); // שעה בפורמט HH:MM AM/PM

  // מתאם את השעה לפי AM/PM
  let hour = parseInt(hours);
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  // בונים את התאריך והשעה בתור אובייקט Date
  const uploadDateTime = new Date(year, month - 1, day, hour, minutes);

  // אם התאריך לא חוקי
  if (isNaN(uploadDateTime)) {
    console.error("תאריך או שעה לא תקינים", uploadDate, uploadTime);
    return "תאריך לא תקין";
  }

  const diffInMs = now - uploadDateTime;
  const seconds = Math.floor(diffInMs / 1000);
  const minutesDiff = Math.floor(seconds / 60);
  const hoursDiff = Math.floor(minutesDiff / 60);
  const daysDiff = Math.floor(hoursDiff / 24);

  if (daysDiff > 0) {
    return `${daysDiff} ימים`;
  } else if (hoursDiff > 0) {
    return `${hoursDiff} שעות`;
  } else if (minutesDiff > 0) {
    return `${minutesDiff} דקות`;
  } else {
    return `${seconds} שניות`;
  }
};



// פונקציה למיין את התמונות של כל משתמש לפי תאריך ושעה העלאה
storiesData.forEach((story) => {
  if (story.media.length > 0) {
    story.media.sort((a, b) => {
      const dateA = new Date(a?.uploadDate + " " + a?.uploadTime);
      const dateB = new Date(b?.uploadDate + " " + b?.uploadTime);
      return dateB - dateA; // מיין לפי הזמן האחרון
    });
  }
});

// מיון המשתמשים לפי התמונה הכי חדשה (לפי תאריך ושעה) והם ממויינים בסדר לפי מי שיש לו תמונות
const sortedStoriesData = storiesData.sort((a, b) => {
  if (a.media.length === 0 && b.media.length === 0) return 0;
  if (a.media.length === 0) return 1;
  if (b.media.length === 0) return -1;

  const latestA = new Date(a.media[0].uploadDate + " " + a.media[0].uploadTime);
  const latestB = new Date(b.media[0].uploadDate + " " + b.media[0].uploadTime);
  return latestB - latestA;
});

const StoryComponent = () => {
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isLongPress, setIsLongPress] = useState(false);
  const [newMediaUri, setNewMediaUri] = useState(null);

  const openStory = (user) => {
    if (user.media.length == 0) return;
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
    if (isLongPress) {
      return;  // אם יש לחיצה ארוכה, אל תעבור לתמונה הבאה
    }
    if (currentUser && currentImageIndex < currentUser.media.length - 1) {
      // יש עוד תמונות באותו משתמש
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // חיפוש המשתמש הבא עם תמונות
      const currentIndex = sortedStoriesData.findIndex(user => user.id === currentUser.id);

      for (let i = currentIndex + 1; i < sortedStoriesData.length; i++) {
        if (sortedStoriesData[i].media.length > 0) {
          setCurrentUser(sortedStoriesData[i]);
          setCurrentImageIndex(0); // מתחילים מהתמונה הראשונה של המשתמש הבא
          return;
        }
      }
      closeStory();
    }
  };


  const goToPreviousImage = () => {
    if (isLongPress) {
      return;  // אם יש לחיצה ארוכה, אל תעבור לתמונה הבאה
    }
    if (currentImageIndex > 0) {
      // אם יש תמונות קודמות אצל המשתמש הנוכחי
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      // חיפוש המשתמש הקודם שיש לו תמונות להציג
      const currentIndex = sortedStoriesData.findIndex(user => user.id === currentUser.id);

      for (let i = currentIndex - 1; i >= 0; i--) {
        if (sortedStoriesData[i].media.length > 0) {
          setCurrentUser(sortedStoriesData[i]);
          setCurrentImageIndex(sortedStoriesData[i].media.length - 1); // עוברים לתמונה האחרונה של המשתמש הקודם
          return;
        }
      }

      // אם לא נמצאו עוד משתמשים עם תמונות, נסגור את התצוגה
      closeStory();
    }
  };
  const handleLongPress = () => {
    setIsLongPress(true);  // סימן שיש לחיצה ארוכה
    setIsVideoPlaying(false);  // עצירת הוידאו
  };
  
  const handlePressOut = () => {
    setIsLongPress(false);  // ביטול הלחיצה הארוכה
    setIsVideoPlaying(true);  // המשך הוידאו
  };
  const handlePlaybackStatusUpdate = (status) => {
    // אם הסרטון סיים לנגן (status.isLoaded ו-status.didJustFinish)
    if (status.didJustFinish) {
      goToNextImage(); // מעבר לתמונה הבאה
    }
  };
  const handleAddMedia = async () => {
    // בחירת מדיה חדשה (תמונה או וידאו)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setNewMediaUri(result.uri); // שומר את ה-URI של המדיה שנבחרה
      Alert.alert("המדיה נוספה בהצלחה!");
    }
  };
  const renderStory = ({ item }) => (
    <TouchableOpacity onPress={() => openStory(item)} style={styles.storyContainer}>
      {/* תמונת פרופיל */}
      {item.isAddButton ? (
      <TouchableOpacity onPress={handleAddMedia} style={styles.addMediaButton}>
      <Icon name="add" size={30} color="white" />
    </TouchableOpacity>
      ) : (
        <View
          style={
            item.media.length > 0
              ? styles.profileImageWithStories
              : styles.profileImageWithoutStories
          }
        >
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        </View>
      )}
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[  {
          id: 0,
          username: "Add New Story",
          profileImage: null,
          media: [],
          isAddButton: true, // מציין שזה כפתור פלוס
        },...sortedStoriesData]}
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
                    {timeAgo(currentUser.media[currentImageIndex]?.uploadDate, currentUser.media[currentImageIndex]?.uploadTime)}
                  </Text>
                </View>
              </View>

              {currentUser.media[currentImageIndex].type === "image" ? (
                <Image source={{ uri: currentUser.media[currentImageIndex].uri }} style={styles.fullStory} />
              ) : (
                  <Video
                    source={{ uri: currentUser.media[currentImageIndex].uri }}
                    style={styles.fullStory}
                    resizeMode="contain"
                    shouldPlay={isVideoPlaying}
                    useNativeControl
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate} 
                    onError={(error) => console.log("Video Error: ", error)}
                  />
              )}
            </>
          )}

          {/* כפתורים למעבר בין תמונות */}
          <TouchableOpacity 
  onLongPress={handleLongPress} 
  onPressOut={handlePressOut} 
  onPress={goToPreviousImage} 
  style={styles.navButtonLeft} 
/>
<TouchableOpacity 
  onLongPress={handleLongPress} 
  onPressOut={handlePressOut} 
  onPress={goToNextImage} 
  style={styles.navButtonRight} 
/>

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
    backgroundColor: "#fff",
    flexDirection:"row"
    },
  addMediaButton: {
    backgroundColor: "#ff006e",
    width: 70,
    height: 70,
    borderRadius: 35,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center"
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 5,
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
    resizeMode: 'contain'
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
