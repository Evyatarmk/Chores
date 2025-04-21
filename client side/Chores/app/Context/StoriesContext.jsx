import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "../Context/UserAndHomeContext";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";

const StoriesContext = createContext();

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const { user, home } = useUserAndHome();
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
      }, baseUrl);

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
      setStories(sortStories(storiesData));
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
    const prevStories = [...stories];

    // 1. הוספת הסיפור באופטימיות ל־UI
    let optimisticStories = upsertLocalStory(stories, newStory);
    setStories(sortStories(optimisticStories));

    try {
      const formData = new FormData();
      const fileName = newStory.uri.split('/').pop();
    
      // קביעת הסיומת לפי שם הקובץ
      const extension = fileName?.split('.').pop()?.toLowerCase();
    
      // הגדרת סוג MIME לפי הסיומת
      let fileType = 'application/octet-stream'; // ברירת מחדל
      if (extension === 'jpg' || extension === 'jpeg') {
        fileType = 'image/jpeg';
      } else if (extension === 'png') {
        fileType = 'image/png';
      } else if (extension === 'mp4') {
        fileType = 'video/mp4';
      } else if (extension === 'mov') {
        fileType = 'video/quicktime';
      }
    
      console.log('הסיומת שזוהתה:', extension);
      console.log('סוג הקובץ שנשלח:', fileType);
    
      if (newStory.uri.startsWith('data:')) {
        // המרה של data:uri → Blob
        const fetchRes = await fetchWithAuth(newStory.uri);
        const blob = await fetchRes.blob();
        formData.append('MediaFile', blob, fileName);
      } else {
        // Uri רגיל (file://…)
        formData.append('MediaFile', {
          uri: newStory.uri,
          name: fileName,
          type: fileType,
        });
      }

      formData.append('Type', newStory.type);

      // 3. שליחה לשרת
      const res = await fetchWithAuth(
        `${baseUrl}/Media/home/${home.id}/users/${user.id}/media`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!res.ok) throw new Error('שגיאה בשרת');

      const data = await res.json();
      // 4. בוני את הסיפור המעודכן
      const updatedStory = {
        ...newStory,
        mediaId: data.mediaId,
        uri: data.uri,
        uploadDate: data.uploadDate,
        uploadTime: data.uploadTime,
      };

      // 5. עדכון ה־UI עם הנתונים שקיבלנו
      setStories((current) =>
        sortStories(
          current.map((story) => {
            if (story.userId !== user.id) return story;
            return {
              ...story,
              media: story.media.map((m) =>
                // מניחים ש‑newStory מופיע בדיוק פעם אחת
                m === newStory ? updatedStory : m
              ),
            };
          })
        )
      );
    } catch (err) {
      console.error('שגיאה בהעלאת סיפור:', err);
      // מבטלים את האופטימיזם
      setStories(prevStories);
      setErrorMessage('לא ניתן להוסיף סיפור, אנא נסה שוב.');
      setErrorVisible(true);
    }
  };

  // פונקציה עזר שמכניסה או מוסיפה סיפור חדש לכרונולוגיה
  function upsertLocalStory(stories, newStory) {
    const idx = stories.findIndex((s) => s.userId === user.id);
    if (idx < 0) {
      return [
        {
          userId: user.id,
          username: user.name,
          profileImage: user.profileImage,
          media: [newStory],
        },
        ...stories,
      ];
    } else {
      const updated = [...stories];
      updated[idx] = {
        ...updated[idx],
        media: [newStory, ...updated[idx].media],
      };
      return updated;
    }
  }



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
      }, baseUrl);

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
    <StoriesContext.Provider value={{ stories, addStory, deleteStory,fetchStories }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />

    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
