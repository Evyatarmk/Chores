import React, { createContext, useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { useApiUrl } from "./ApiUrlProvider";


const UserAndHomeContext = createContext();

const mockUser = {
  id: "t",
  name: "אביתר",
  email: "t",
  password: "1",
  homeId: "home1",
  role: "admin",
  profilePicture: "https://www.coaching-center.co.il/wp-content/uploads/2014/12/%D7%90%D7%99%D7%A9_%D7%9E%D7%9B%D7%99%D7%A8%D7%95%D7%AA_coaching_center.jpg",
  tasksStats: {
    completedTasksByMonth: {
      1: 10, 
      2: 8,   
      3: 12,
    },
    totalCompletedTasks: 30,
  },
};
const mockHome = {
  id: "123",
  name: "הבית של אביתר",
    code: "12345678",
    members: [
      { id: "1", name: "אביתר", role: "admin",publicId:1 }, // אביתר הוא המנהל
      { id: "2", name: "דני", role: "user",publicId:2 }, // דני הוא חבר רגיל
    ]
};

export const UserAndHomeProvider = ({ children }) => {
  const { baseUrl } = useApiUrl();
  const [user, setUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [home, setHome] = useState(null);

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
        // במקרה של שגיאה, לדוג' אם המייל כבר קיים או לא ניתן ליצור את הבית
        const errorData = await response.json();
        console.error('Error:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error creating home:', error);
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
        // במקרה של שגיאה, לדוג' אם המייל כבר קיים או לא ניתן להצטרף לבית
        const errorData = await response.json();
        console.error('Error:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error joining home:', error);
      return false;
    }
  };
  

  const updateHome = (updatedHome) => {
    setHome(updatedHome);
  };
  const updateUser = (newName,newPicture) => {
    setUser((prev)=>({...prev,name:newName,profilePicture:newPicture}));
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
      }}
    >
      {children}
    </UserAndHomeContext.Provider>
  );
};

export const useUserAndHome = () => useContext(UserAndHomeContext);
