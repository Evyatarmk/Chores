import React, { createContext, useState, useContext } from "react";


const UserAndHomeContext = createContext();

const mockUser = {
  id:1,
  name: "אביתר",
  email: "t",
  password: "1",
  homeId: 1,
  role: "admin",
  profilePicture: "https://www.coaching-center.co.il/wp-content/uploads/2014/12/%D7%90%D7%99%D7%A9_%D7%9E%D7%9B%D7%99%D7%A8%D7%95%D7%AA_coaching_center.jpg",
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

  const login = (email, password) => {
    if (email === mockUser.email && password === mockUser.password) {
      setUser(mockUser);
      setHome(mockHome);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setUser(null)
    setHome(null);
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
