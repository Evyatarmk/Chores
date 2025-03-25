import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "../Context/UserAndHomeContext";

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
    sortStories(storiesData)
    setStories( sortStories(storiesData));
  }, []);

  // Function to sort stories based on the latest media
  const sortStories = (storiesToSort) => {
 
    return storiesToSort.sort((a, b) => {
      if (a.media.length === 0 && b.media.length === 0) return 0;
      if (a.media.length === 0) return 1;
      if (b.media.length === 0) return -1;

      const latestA = new Date(`${a.media[0].uploadDate} ${a.media[0].uploadTime}`);
      const latestB = new Date(`${b.media[0].uploadDate} ${b.media[0].uploadTime}`);

      return latestB - latestA;
    });
  };

  const addStory = (newStory) => {
    const userHasStory = stories.some((story) => story.userId === user?.id);

    let updatedStories;

    if (!userHasStory) {
      const newStoryData = {
        userId: user?.id,
        username: user?.name || "Unknown",
        profileImage: user?.profileImage || "",
        media: [newStory],
      };

      updatedStories = [newStoryData, ...stories];
    } else {
      updatedStories = stories.map((story) => {
        if (story.userId === user?.id) {
          const updatedMedia = [newStory, ...story.media];
          return { ...story, media: updatedMedia };
        }
        return story;
      });
    }

    // Sort the stories after adding the new story
    updatedStories = sortStories(updatedStories);

    setStories(updatedStories);
  };

  const deleteStory = (mediaId) => {
    setStories((prevStories) => {
      const updatedStories = prevStories.map((story) => {
        if (story.userId === user?.id) {
          const updatedMedia = story.media.filter((media) => media.mediaId !== mediaId);
          return { ...story, media: updatedMedia };
        }
        return story;
      });

      // Sort the stories after deleting a media item
      return sortStories(updatedStories);
    });
  };

  return (
    <StoriesContext.Provider value={{ stories, addStory, deleteStory }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
