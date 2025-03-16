import React, { createContext, useState, useContext } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(["קניות", "משימות", "טיולים", "אירועים", "בית", "עבודה"]);

  const addCategory = (newCategory) => {
    if (newCategory.trim() !== "" && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
