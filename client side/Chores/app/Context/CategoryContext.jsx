import React, { createContext, useState, useContext, useEffect } from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";
import { useApiUrl } from "./ApiUrlProvider";
import { Alert } from "react-native";

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
      }, baseUrl);
  
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

  const deleteCategory = async (categoryId) => {
    // שמירת המצב הקודם למקרה של שגיאה
    const prevCategories = [...categories];
  
    // עדכון ויזואלי מיידי
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
  
    try {
      const response = await fetchWithAuth(`${baseUrl}/home/${home.id}/categories/${categoryId}`, {
        method: 'DELETE',
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("שגיאה במחיקת הקטגוריה");
      }
  
      // אם הצליח - סבבה, אין צורך לעדכן שוב
  
    } catch (error) {
      console.error("שגיאה במחיקת קטגוריה:", error);
      setCategories(prevCategories); // שחזור למצב הקודם
      setErrorMessage("שגיאה במחיקת הקטגוריה, נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };

  const updateCategory = async (updatedCategory) => {
    
    try {
        const response = await fetch(`${baseUrl}/home/${home.id}/categories/${updatedCategory.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCategory.name),
        });

        // Log the response to check status and response body
        console.log('Response Status:', response.status);
        console.log('Response Body:', await response.text());

        if (!response.ok) {
            throw new Error('Failed to update category');
        }

        const updatedData = await response.json();
        console.log('Category updated successfully:', updatedData);

        // Optional: Refresh the categories list here if needed

    } catch (error) {
        console.error('Error updating category:', error);
        Alert.alert('Error', 'Could not update the category. Please try again.');
    }
};


  
  


  
  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/home/${home.id}/categories`, {
        method: 'GET',
      }, baseUrl);
  
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
  }, [home, user,categories]);
  return (
    <CategoryContext.Provider value={{ categories, addCategory ,deleteCategory,updateCategory}}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />

    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
