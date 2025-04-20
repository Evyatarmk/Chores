import React, { createContext, useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";


const UserAndHomeContext = createContext();


export const UserAndHomeProvider = ({ children }) => {
  const { baseUrl } = useApiUrl();
  const [user, setUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [home, setHome] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const saveUser = (newUser) => {
    setNewUser(newUser);
  };
  const register = (newUser) => {
    console.log("נרשם בהצלחה:", newUser);
    setUser(newUser);
  };
  // פונקציה ליצירת token דמוי עם זמן תפוגה
  const generateMockToken = (userId) => {
    const expirationTime = Date.now() + 3600 * 1000; // תוקף למשך שעה (3600 שניות)

    // יצירת ה-token שכולל את מזהה המשתמש וזמן תפוגה
    const tokenPayload = {
      userId,
      exp: expirationTime,
    };

    // המרה לאובייקט JSON ויצירת string מופרדת
    const token = JSON.stringify(tokenPayload);
    return token;
  };
  const login = async (email, password) => {
    try {
      const response = await fetch(`${baseUrl}/Users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // אם הבקשה הצליחה (סטטוס 2xx)
        const data = await response.json();
        const { accessToken, refreshToken } = data;

        // שמירת הטוקנים ב-AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // עדכון המשתמש והבית
        setUser(data.user);
        setHome(data.home);

        return true;
      } else {
        // אם הבקשה לא הצליחה, קרא את ההודעה מה-API
        const errorData = await response.json();

        // הצגת הודעת השגיאה בהתאם לקוד הסטטוס
        if (response.status === 401) {
          console.log('Unauthorized: ', errorData); // או הצגת הודעה למשתמש
        } else if (response.status === 404) {
          console.log('Not Found: ', errorData); // או הצגת הודעה למשתמש
        }

        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };



  const logout = async () => {
    // מחיקת כל הטוקנים שנשמרו
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');

    // אפס את המידע בקונטקסטים או בסטייט
    setUser(null);
    setHome(null);

    // נווט לעמוד ההתחברות ומחק את ההיסטוריה כך שלא יוכל לחזור אחורה
    router.replace("/LoginScreen"); // replace ימחק את ההיסטוריה של הניווט
  };

  const setNewHome = async (homeName, user) => {
    try {
      const response = await fetch(`${baseUrl}/Users/register/newhome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          RegisterUser: {
            Name: user.name,
            Email: user.email,
            Password: user.password,
          },
          HomeName: homeName,
        },
        ),
      });

      if (response.ok) {
        // אם הבקשה הצליחה (סטטוס 2xx)
        const data = await response.json();
        const { accessToken, refreshToken } = data;

        // שמירת הטוקנים ב-AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // עדכון המשתמש והבית
        setUser(data.user);
        setHome(data.home);

        return true;
      } else {
        // ננסה לקרוא את הטקסט מתוך התגובה (ולא כ-json)
        const errorText = await response.text();
        console.warn('שגיאה מהשרת:', errorText);

        const translatedMessage = getHebrewErrorMessage(errorText);
        setErrorMessage(translatedMessage);
        setErrorVisible(true);
        return false;
      }
    } catch (error) {
      console.error('שגיאה כללית ב-fetch:', error.message);
      setErrorMessage("אירעה שגיאה כללית. נסה שוב.");
      setErrorVisible(true);
      return false;
    }
  };


  const joinHome = async (homeCode, user) => {
    try {
      const response = await fetch(`${baseUrl}/Users/register/existinghome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerUser: {
            Name: user.name,
            Email: user.email,
            Password: user.password,
          },
          HomeCode: homeCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { accessToken, refreshToken } = data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        setUser(data.user);
        setHome(data.home);

        return true;
      } else {
        // ננסה לקרוא את הטקסט מתוך התגובה (ולא כ-json)
        const errorText = await response.text();
        console.warn('שגיאה מהשרת:', errorText);

        const translatedMessage = getHebrewErrorMessage(errorText);
        setErrorMessage(translatedMessage);
        setErrorVisible(true);
        return false;
      }
    } catch (error) {
      console.error('שגיאה כללית ב-fetch:', error.message);
      setErrorMessage("אירעה שגיאה כללית. נסה שוב.");
      setErrorVisible(true);
      return false;
    }
  };


  const getHebrewErrorMessage = (serverMessage) => {
    switch (serverMessage) {
      case "Invalid email format.":
        return "פורמט האימייל אינו תקין.";
      case "Password must be at least 8 characters long.":
        return "הסיסמה חייבת להיות לפחות 8 תווים.";
      case "Email already exists.":
        return "האימייל כבר קיים במערכת.";
      case "Invalid home code.":
        return "קוד הבית אינו תקף.";
      default:
        return "אירעה שגיאה. נסה שוב מאוחר יותר.";
    }
  };
  const updateHome = (updatedHome) => {
    setHome(updatedHome);
  };

  const updateUser = async (newName, newPicture) => {
    try {
      const response = await fetch(`${baseUrl}/Users/editUserProfilePic&Name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: user.id,
          Name: newName,
          profilePicture: newPicture,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setUser(prev => ({
        ...prev,
        name: newName,
        profilePicture: newPicture
      }));

    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const leaveHome = async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/Users/leaveHome`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // ✅ זה חייב להתאים ל-DTO בצד השרת
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`שגיאה מהשרת: ${errorText}`);
      }

      // עדכון מקומי של context
      setHome(null);
      setUser(prev => ({
        ...prev,
        homeId: null,
      }));

      console.log("התנתקת מהבית בהצלחה.");
      
      router.replace("/JoinOrCreateHomeScreen");
    } catch (error) {
      console.error("שגיאה בהתנתקות מהבית:", error.message);
      setErrorMessage("אירעה שגיאה בעת ההתנתקות מהבית.");
      setErrorVisible(true);
    }
  };



  return (
    <UserAndHomeContext.Provider
      value={{
        user,
        home,
        newUser,
        setHome,
        setUser,
        saveUser,
        register,
        login,
        logout,
        setNewHome,
        joinHome,
        updateHome,
        updateUser,
        leaveHome,
      }}
    >

      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />

    </UserAndHomeContext.Provider>
  );
};

export const useUserAndHome = () => useContext(UserAndHomeContext);
