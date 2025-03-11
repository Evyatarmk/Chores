import React, { createContext, useState, useContext } from "react";


const UserAndHomeContext = createContext();

const mockUser = {
  id:1,
  name: "אביתר",
  email: "test@example.com",
  password: "123456",
  homeId: 1,
};
const mockHome = {
  id: "123",
    name: "הבית של אביתר",
    code: "12345678",
    members: [
      { id: "1", name: "אביתר" },
      { id: "2", name: "דני" },
    ],
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
      }}
    >
      {children}
    </UserAndHomeContext.Provider>
  );
};

export const useUserAndHome = () => useContext(UserAndHomeContext);
