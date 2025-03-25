// StoriesContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import {useUserAndHome} from "../Context/UserAndHomeContext"

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const { user } = useUserAndHome();

  useEffect(() => {
    const storiesData = [
      {
        userId: "t",  // כאן שמתי ערך אקראי
        username: "Evyatar",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        media: [
          {
            mediaId: "media1",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/1011/800/600",
            uploadDate: "2025-03-20",
            uploadTime: "10:30 AM",
          },
          {
            mediaId: "media2",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/1025/800/600",
            uploadDate: "2025-03-19",
            uploadTime: "5:45 PM",
          },
          {
            mediaId: "media3",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/1039/800/600",
            uploadDate: "2025-03-18",
            uploadTime: "3:15 PM",
          },
          {
            mediaId: "media4",  // הוספתי מזהה ייחודי לכל מדיה
            type: "video",
            uri: "https://www.w3schools.com/html/mov_bbb.mp4",
            uploadDate: "2025-03-18",
            uploadTime: "3:15 PM",
          },
        ],
      },
      {
        userId: "xyurh",  // כאן שמתי ערך אקראי אחר
        username: "Dana",
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        media: [],
      },
      {
        userId: "kfk",  // גם כאן
        username: "Yossi",
        profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        media: [
          {
            mediaId: "media1",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/1074/800/600",
            uploadDate: "2025-03-22",
            uploadTime: "11:00 AM",
          },
          {
            mediaId: "media2",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/1084/800/600",
            uploadDate: "2025-03-18",
            uploadTime: "8:30 PM",
          },
          {
            mediaId: "media3",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/109/800/600",
            uploadDate: "2025-03-17",
            uploadTime: "4:00 PM",
          },
        ],
      },
      {
        userId: "yurh",  // כאן שמתי שוב ערך אקראי אחר
        username: "Maya",
        profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        media: [
          {
            mediaId: "media1",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/110/800/600",
            uploadDate: "2025-03-22",
            uploadTime: "3:20 PM",
          },
          {
            mediaId: "media2",  // הוספתי מזהה ייחודי לכל מדיה
            type: "image",
            uri: "https://picsum.photos/id/111/800/600",
            uploadDate: "2025-03-16",
            uploadTime: "6:40 PM",
          },
        ],
      },
    ];
    

    // מיון המדיה לפי תאריך ושעה
    storiesData.forEach((story) => {
      if (story.media.length > 0) {
        story.media.sort((a, b) => {
          const dateA = new Date(`${a.uploadDate} ${a.uploadTime}`);
          const dateB = new Date(`${b.uploadDate} ${b.uploadTime}`);
          return dateB - dateA; // הכי חדש ראשון
        });
      }
    });

    // מיון המשתמשים לפי התמונה הכי חדשה אם קיימת
    const sortedStories = storiesData.sort((a, b) => {
      if (a.media.length === 0 && b.media.length === 0) return 0;
      if (a.media.length === 0) return 1;
      if (b.media.length === 0) return -1;

      const latestA = new Date(
        `${a.media[0].uploadDate} ${a.media[0].uploadTime}`
      );
      const latestB = new Date(
        `${b.media[0].uploadDate} ${b.media[0].uploadTime}`
      );

      return latestB - latestA;
    });

    setStories(sortedStories);
  }, []);

  const addStory = (newStory) => {
    // אם למשתמש אין סיפור קודם, צור סיפור חדש
    const userHasStory = stories.some((story) => story.userId === user?.id);
  
    let updatedStories;
  
    if (!userHasStory) {
      // אם אין סיפור קודם, צור סיפור חדש עם המדיה
      const newStoryData = {
        userId: user?.id,
        username: user?.name || "Unknown",  // שם המשתמש אם קיים
        profileImage: user?.profileImage || "",  // תמונת פרופיל אם קיים
        media: [newStory],  // הוסף את המדיה החדשה כמדיה הראשונה
      };
  
      updatedStories = [newStoryData, ...stories];  // הוסף את הסיפור החדש למערך
    } else {
      // אם יש סיפור, עדכן את המערך
      updatedStories = stories.map((story) => {
        if (story.userId === user?.id) {
          // הוסף את הסיפור החדש למערך המדיה של המשתמש המתאים
          const updatedMedia = [newStory,...story.media];
          return { ...story, media: updatedMedia };
        }
        return story; // לא משנה את המשתמשים האחרים
      });
    }
  
    // מיין את כל הסיפורים לפי התמונה הכי חדשה
    updatedStories.sort((a, b) => {
      if (a.media.length === 0 && b.media.length === 0) return 0;
      if (a.media.length === 0) return 1;
      if (b.media.length === 0) return -1;
  
      const latestA = new Date(`${a.media[0].uploadDate} ${a.media[0].uploadTime}`);
      const latestB = new Date(`${b.media[0].uploadDate} ${b.media[0].uploadTime}`);
  
      return latestB - latestA;
    });
    console.log(updatedStories);

    // עדכן את המערך עם הסיפורים הממוינים
    setStories(updatedStories);
  };
  
  

  const clearStories = () => {
    setStories([]);
  };

  return (
    <StoriesContext.Provider value={{ stories, addStory, clearStories }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
