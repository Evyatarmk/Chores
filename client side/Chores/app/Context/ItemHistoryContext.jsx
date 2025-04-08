import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";
import { useApiUrl } from "./ApiUrlProvider";

const ItemHistoryContext = createContext();

export const ItemHistoryProvider = ({ children }) => {
  const [itemHistory, setItemHistory] = useState([]);
  const { home, user } = useUserAndHome();
  const { baseUrl } = useApiUrl();

  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const handleCloseError = () => {
    setErrorMessage("");
    setErrorVisible(false);
  };

  const addItemHistory = async (newItemHistory) => {
    // שמירת המצב הקודם למקרה של שגיאה
    const prevItemHistory = [...itemHistory];
    
    // עדכון ויזואלי מיידי
    const updatedItemHistory = [...itemHistory, newItemHistory];
    setItemHistory(updatedItemHistory);

    try {
      const response = await fetchWithAuth(`${baseUrl}/home/${home.id}/itemhistory`, {
        method: 'POST',
        body: JSON.stringify(newItemHistory),
      });

      if (!response.ok) {
        throw new Error("שגיאה בהוספת היסטוריית פריט");
      }
      // לא צריך לעדכן שוב את הסטייט אם כבר הוספנו ויזואלית
      // אבל אם אתה רוצה להיות מדויק - תוכל לעדכן עם הנתונים שחזרו

    } catch (error) {
      console.error("שגיאה בהוספת היסטוריית פריט:", error);
      setItemHistory(prevItemHistory); // שחזור למצב הקודם
      setErrorMessage("שגיאה בהוספת היסטוריית הפריט, נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };

  const getItemHistoryByCategory = async (category) => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/ItemHistory/home/${home.id}/category/${category}`, {
        method: 'GET',
      });

      if (!response || !response.ok) {
        throw new Error("שגיאה בקבלת היסטוריית פריטים");
      }

      const data = await response.json();
      return(data);
    } catch (error) {
      console.error("שגיאה בקבלת היסטוריית פריטים:", error);
      setErrorMessage("לא ניתן לטעון היסטוריית פריטים, אנא נסה שוב מאוחר יותר");
      setErrorVisible(true);
      
    }
  };

  return (
    <ItemHistoryContext.Provider value={{itemHistory, getItemHistoryByCategory, addItemHistory }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </ItemHistoryContext.Provider>
  );
};

export const useItemHistory = () => useContext(ItemHistoryContext);
