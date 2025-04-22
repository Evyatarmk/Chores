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
    setErrorMessage("");
    setErrorVisible(false);
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
            return dateB - dateA;
          });
        }
      });

      const sortedStories = sortStories(storiesData);
      const validStories = filterExpiredStories(sortedStories);
      setStories(validStories);
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

  const filterExpiredStories = (storiesList) => {
    const now = new Date();

    return storiesList.map((story) => ({
      ...story,
      media: story.media.filter((mediaItem) => {
        const uploadDateTime = new Date(`${mediaItem.uploadDate} ${mediaItem.uploadTime}`);
        const diffInHours = (now - uploadDateTime) / (1000 * 60 * 60);
        return diffInHours <= 24;
      }),
    })).filter((story) => story.media.length > 0);
  };

  const addStory = async (newStory) => {
    const prevStories = [...stories];
    let optimisticStories = upsertLocalStory(stories, newStory);
    setStories(filterExpiredStories(sortStories(optimisticStories)));

    try {
      const formData = new FormData();
      const fileName = newStory.uri.split('/').pop();
      const extension = fileName?.split('.').pop()?.toLowerCase();

      let fileType = 'application/octet-stream';
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
        const fetchRes = await fetch(newStory.uri);
        const blob = await fetchRes.blob();
        formData.append('MediaFile', blob, fileName);
      } else {
        formData.append('MediaFile', {
          uri: newStory.uri,
          name: fileName,
          type: fileType,
        });
      }

      formData.append('Type', newStory.type);

      const res = await fetch(
        `${baseUrl}/Media/home/${home.id}/users/${user.id}/media`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('שגיאה בשרת');

      const data = await res.json();

      const updatedStory = {
        ...newStory,
        mediaId: data.mediaId,
        uri: data.uri,
        uploadDate: data.uploadDate,
        uploadTime: data.uploadTime,
      };

      setStories((current) =>
        filterExpiredStories(sortStories(
          current.map((story) => {
            if (story.userId !== user.id) return story;
            return {
              ...story,
              media: story.media.map((m) =>
                m === newStory ? updatedStory : m
              ),
            };
          })
        ))
      );
    } catch (err) {
      console.error('שגיאה בהעלאת סיפור:', err);
      setStories(prevStories);
      setErrorMessage('לא ניתן להוסיף סיפור, אנא נסה שוב.');
      setErrorVisible(true);
    }
  };

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
    const previousStories = [...stories];

    setStories((prevStories) => {
      const updatedStories = prevStories.map((story) => {
        if (story.userId === user?.id) {
          const updatedMedia = story.media.filter((media) => media.mediaId !== mediaId);
          return { ...story, media: updatedMedia };
        }
        return story;
      });

      return filterExpiredStories(sortStories(updatedStories));
    });

    try {
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
      setStories(previousStories);
    }
  };

  return (
    <StoriesContext.Provider value={{ stories, addStory, deleteStory, fetchStories }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
