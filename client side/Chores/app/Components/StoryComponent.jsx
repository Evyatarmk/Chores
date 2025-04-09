import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, FlatList, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from "expo-av";
import * as ImagePicker from 'expo-image-picker';
import { useStories } from "../Context/StoriesContext"
import { useUserAndHome } from "../Context/UserAndHomeContext"
import AlertModal from "../Components/AlertModal";

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

const StoryComponent = () => {
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isLongPress, setIsLongPress] = useState(false);
  const { stories, addStory,deleteStory } = useStories();
  const { user } = useUserAndHome();
  const [modalVisible, setModalVisible] = useState(false);

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
      const currentIndex = stories.findIndex(user => user.userId === currentUser.userId);

      for (let i = currentIndex + 1; i < stories.length; i++) {
        if (stories[i].media.length > 0) {
          setCurrentUser(stories[i]);
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
      const currentIndex = stories.findIndex(user => user.userId === currentUser.userId);

      for (let i = currentIndex - 1; i >= 0; i--) {
        if (stories[i].media.length > 0) {
          setCurrentUser(stories[i]);
          setCurrentImageIndex(stories[i].media.length - 1); // עוברים לתמונה האחרונה של המשתמש הקודם
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
  const handleDeleteStory = (storyId) => {
   deleteStory(currentUser.media[currentImageIndex]?.mediaId)
    closeStory()
  };
  const handleAddMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false || cameraPermissionResult.granted === false) {
      return;
    }

    // בחירת מדיה חדשה (תמונה או וידאו)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // יצירת מזהה מדיה ייחודי
      const mediaId = `media${Date.now()}`; // הוספתי את מזהה הזמן הנוכחי

      let newMedia = {
        mediaId: mediaId,  // הוספתי מזהה ייחודי לכל מדיה
        type: result.assets[0].type,  // סוג המדיה (תמונה או וידאו)
        uri: result.assets[0].uri,
        uploadDate: new Date().toISOString().split("T")[0],  // תאריך העלאה
        uploadTime: new Date().toLocaleTimeString(),  // זמן העלאה
      };
      addStory(newMedia)
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
<Image 
  source={require('../images/userImage.jpg')} 
  style={styles.profileImage} 
/>
    </View>
      )}

      <Text style={styles.username}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={[{
          userId: 0,
          username: " ",
          profileImage: null,
          media: [],
          isAddButton: true, // מציין שזה כפתור פלוס
        }, ...stories]}
        renderItem={renderStory}
        keyExtractor={(item) => item.userId.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />

      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {currentUser ? (
            <>
              {/* פרטי המשתמש בראש המודל */}
              <View style={styles.modalHeader}>
                <View style={styles.userDetailsContainer}>
                  <Image
                    source={{ uri: currentUser.profileImage }}
                    style={styles.modalProfileImage}
                  />
                   <View style={styles.userDetails}>
                  <Text style={styles.username}>{currentUser.username}</Text>
                  <Text style={styles.uploadDetails}>
                    {timeAgo(currentUser.media[currentImageIndex]?.uploadDate, currentUser.media[currentImageIndex]?.uploadTime)}
                  </Text>
                  </View>
                </View>
                {currentUser.userId === user?.id && (
                  <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.deleteButton}>
                    <Icon name="delete" size={30} color="red" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeStory} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#888" />
                </TouchableOpacity>
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
          ) : null}

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
      <AlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message="האם אתה בטוח שברצונך למחוק פריט זה?"
        onConfirm={handleDeleteStory}
        confirmText="מחק"
        cancelText="ביטול"
      />
         
        </View>
      </Modal>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  addMediaButton: {
    backgroundColor: "#ff006e",
    width: 70,
    height: 70,
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  storyContainer: {
    alignItems: "center",
    justifyContent: "center"
  },

  profileImageWithStories: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ff006e",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
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
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalHeader: {
    position: "absolute",
    top: 10,
    left: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 101,
    padding:5
  },

  modalProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  userDetailsContainer: {
    flex:1,
    alignItems: "center",
    flexDirection: "row"
  },
  userDetails:{
flexDirection:"column"
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
  deleteButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 20,
    zIndex: 100
  },
  closeButton: {
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
