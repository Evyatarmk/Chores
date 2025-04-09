import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";
import { useApiUrl } from "./ApiUrlProvider";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(["קניות", "משימות", "טיולים", "אירועים", "בית", "עבודה"]);
  const { home ,user} = useUserAndHome();
    const { baseUrl } = useApiUrl();
  
const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  console.log(categories)

  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const addCategory = async (newCategory) => {
  
    // שמירת המצב הקודם למקרה של שגיאה
    const prevCategories = [...categories];
    // עדכון ויזואלי מיידי
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
  console.log(JSON.stringify( newCategory ))
    try {
      const response = await fetchWithAuth(`${baseUrl}/home/${home.id}/categories`, {
        method: 'POST',
        body: JSON.stringify( newCategory ),
      });
  
      if (!response.ok) {
        throw new Error("שגיאה ביצירת קטגוריה");
      }
  
      // לא צריך לעדכן שוב את הסטייט אם כבר הוספנו ויזואלית
      // אבל אם אתה רוצה להיות מדויק - תוכל לעדכן עם הנתונים שחזרו
  
    } catch (error) {
      console.error("שגיאה בהוספת קטגוריה:", error);
      setCategories(prevCategories); // שחזור למצב הקודם
      setErrorMessage("שגיאה בהוספת הקטגוריה, נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };

  
  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/home/${home.id}/categories`, {
        method: 'GET',
      });
  
      if (!response || !response.ok) {
        throw new Error("שגיאה בקבלת קטגוריות");
      }
  
      const data = await response.json();
  
      setCategories(data);
  
    } catch (error) {
      console.error("שגיאה בקבלת קטגוריות:", error);
      setErrorMessage("לא ניתן לטעון קטגוריות, אנא נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };


  useEffect(() => {
    if (home && user) {
      fetchCategories();
    }
  }, [home, user]);
  return (
    <CategoryContext.Provider value={{ categories, addCategory }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />

    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
