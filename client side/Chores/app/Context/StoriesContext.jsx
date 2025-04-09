import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "../Context/UserAndHomeContext";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const { user ,home} = useUserAndHome();
  const { baseUrl } = useApiUrl();
  const [errorMessage, setErrorMessage] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
  
    const handleCloseError = () => {
      setErrorMessage("")
      setErrorVisible(false)
    };
  const fetchStories = async () => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/media/home/${home.id}/media`, {
        method: 'GET',
      });
  
      if (!response || !response.ok) {
        throw new Error("שגיאה בקבלת סיפורים");
      }
  
      const storiesData = await response.json();
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
    console.log(storiesData)
    setStories( sortStories(storiesData));  
    } catch (error) {
      console.error("שגיאה בקבלת סיפורים:", error);
      setErrorMessage("לא ניתן לטעון סיפורים, אנא נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };
  
  useEffect(() => {
    if (home && user) {
      fetchStories();
    }
  }, [home, user]);


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

  const addStory = async (newStory) => {
    const userHasStory = stories.some((story) => story.userId === user?.id);
  
    // שמירת המצב הנוכחי של סיפורים לפני עדכון
    const prevStories = [...stories];
  
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
    console.log(updatedStories);
    setStories(updatedStories);
  
    // שליחה לשרת עם fetch
    try {
      const formData = new FormData();
      formData.append('MediaFile', {
        uri: newStory.uri, // או כל מידע אחר שקשור לקובץ
        name: 'mediafile', // שם קובץ אקראי
        type: 'image/jpeg', // או סוג הקובץ המתאים
      });
      formData.append('Type', newStory.type);
      formData.append('UploadDate', newStory.uploadDate);
      formData.append('UploadTime', newStory.uploadTime);
      console.log("uri"+newStory.uri+'Type'+ newStory.type+'UploadDate'+ newStory.uploadDate+'UploadTime'+ newStory.uploadTime)
      const response = await fetch(`https://localhost:7214/api/Media/home/home1/users/acc37b7d-3a52-43ae-a21f-a197babd217d/media`, {
        method: 'POST',
        body: formData,
        
      });
  
      if (!response.ok) {
        throw new Error('שגיאה בהוספת סיפור');
      }
  
      const data = await response.json();
      console.log('תמונה הועלתה בהצלחה:', data);
  
      // עדכון הסיפורים עם המידע שהתקבל מהשרת
      const updatedStory = {
        ...newStory,
        mediaId: data.mediaId, // עדכון עם ה-mediaId שהוחזר מהשרת
        uri: data.uri, // עדכון URI עם המידע שהתקבל
        uploadDate: data.uploadDate,
        uploadTime: data.uploadTime,
      };
  
      // עדכון הסיפור בסטייט
      const updatedStoriesWithServerData = stories.map((story) => {
        if (story.userId === user?.id) {
          const updatedMedia = story.media.map((mediaItem) =>
            mediaItem.mediaId === newStory.mediaId ? updatedStory : mediaItem
          );
          return { ...story, media: updatedMedia };
        }
        return story;
      });
  
      // Sort the stories after updating
      updatedStoriesWithServerData = sortStories(updatedStoriesWithServerData);
  
      // עדכון הסטייט עם המידע החדש
      setStories(updatedStoriesWithServerData);
  
    } catch (error) {
      console.error('שגיאה בהעלאת סיפור:', error);
  
      // החזרת המצב הקודם במקרה של שגיאה
      setStories(prevStories);
  
      // הצגת שגיאה למשתמש או כל טיפול אחר
      setErrorMessage("לא ניתן להוסיף סיפור, אנא נסה שוב.");
      setErrorVisible(true);
    }
  };
  
  const deleteStory = async (mediaId) => {
    // שמירת ה-state הקודם של הסטוריז
    const previousStories = [...stories];
   // עדכון הסטוריז אחרי מחיקת המדיה
   setStories((prevStories) => {
    const updatedStories = prevStories.map((story) => {
      if (story.userId === user?.id) {
        const updatedMedia = story.media.filter((media) => media.mediaId !== mediaId);
        return { ...story, media: updatedMedia };
      }
      return story;
    });

    // מיון הסטוריז אחרי מחיקת פריט המדיה
    return sortStories(updatedStories);
  });

    try {
      // שליחה לבקשה למחיקת פריט המדיה
      const response = await fetchWithAuth(`${baseUrl}/media/home/${home.id}/users/${user?.id}/media/${mediaId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete media item');
      }
     
    } catch (error) {
      console.error('Error deleting media item:', error);
      setErrorMessage("לא הצלחנו למחוק את הסיפור, אנא נסה שוב.");
      setErrorVisible(true);
      // אם המחיקה לא הצליחה, מחזירים את הסטוריז הקודמים
      setStories(previousStories);
    }
  };
  

  return (
    <StoriesContext.Provider value={{ stories, addStory, deleteStory }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />

    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
