import React, { createContext, useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";


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
  const [user, setUser] = useState(null);
  const [home, setHome] = useState(null);


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
    if (email === mockUser.email && password === mockUser.password) {
      setUser(mockUser);
      setHome(mockHome);
  
      const mockToken = generateMockToken(mockUser.id);
  
      await AsyncStorage.setItem('accessToken', mockToken);
  
      return true;
    } else {
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

  const setNewHome = (homeName) => {
    let newHome = {
      id: "12311",
      name: homeName,
      members: [ { id: user.id, name: user.name },],
    };
    setHome(newHome);
  };

  const joinHome = (homeCode) => {
    if (homeCode === mockHome.code){
      setHome(mockHome)
      return true;
    } 
    return false;
      
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
