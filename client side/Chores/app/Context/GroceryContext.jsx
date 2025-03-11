import React, { createContext, useContext, useEffect, useState } from "react";
import { useApiUrl } from "./ApiUrlProvider";
import  ErrorNotification from "../Components/ErrorNotification";

const GroceryContext = createContext();
export const useGrocery = () => useContext(GroceryContext);
export const GroceryProvider = ({ children }) => {
  const {baseUrl} = useApiUrl();
  const [groceryData, setGroceryData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const fetchGroceryData = async () => {
    console.log("fff")
    try {
      const response = await fetch(baseUrl+"/GroceryLists/home/home1"); 
      if (!response.ok) {
        throw new Error("שגיאה בהורדת נתונים");
      }
      const data = await response.json();
      setGroceryData(data);
    } catch (error) {
      setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר")
      setErrorVisible(true)
    } finally {
      
    }
  };

  useEffect(() => {
    fetchGroceryData();
  }, []);


  // פונקציה לקבלת פריטים לפי listId
  const getList = (listId) => {
    const list = groceryData.find((list) => list.id === listId);
    return list ;
  };

  const addNewList = async (listName) => {
    // יצירת רשימה חדשה בצד הלקוח ומייד עדכון ה-state
    const newList = {
      id: Date.now(),  // יצירת ID ייחודי לפי זמן
      name: listName,
      items: [],
    };
  
    // עדכון ה-state של המצרכים מיד לאחר יצירת הרשימה
    setGroceryData((prevData) => [newList, ...prevData]);
    const homeId = "home1";
    try {
      // שליחה לשרת עם הבקשה ליצור רשימה חדשה
      const response = await  fetch(`${baseUrl}/GroceryLists/home/${homeId}`,  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(listName)
      });
  
      if (!response.ok) {
        throw new Error('Failed to create grocery list');
      }
  
      // קבלת התשובה מהשרת (הנתונים של הרשימה החדשה)
      const serverList = await response.json();
  
      // עדכון הרשימה עם ה-ID שנשלח מהשרת (אם ה-ID שונה מה-local ID)
      setGroceryData((prevData) =>
        prevData.map((list) =>
          list.id === newList.id ? { ...list, id: serverList.id } : list
        )
      );
    } catch (error) {
      setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר")
      setErrorVisible(true)
      setGroceryData((prevData) => prevData.filter((list) => list.id !== newList.id));
    }
  };

  

  const deleteList= (listId) => {
    let newGroceryData=groceryData.filter(list=>list.id!=listId)
    setGroceryData(newGroceryData)
  }; 
  const updateListName = (listId, newName) => {
    setGroceryData(prevData =>
      prevData.map(list => 
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  };
  
  // פונקציה לעדכון פריט ברשימה
  const updateItemStatus = (listId, itemId) => {
    const updatedGroceryData = groceryData.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId
                ? { ...item, isTaken: !item.isTaken }
                : item
            ),
          }
        : list
    );
    setGroceryData(updatedGroceryData);
  };
  const updateItemField = (listId, updatedItem) => {
    setGroceryData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === updatedItem.id
                  ? { ...item, ...updatedItem }
                  : item
              ),
            }
          : list
      )
    );
  };
  const deleteItem = (listId,ItemId) => {
    setGroceryData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((item) => item.id !== ItemId),
            }
          : list
      )
    );
  };
  const updateOrAddItems = (listId, newItems) => {
    setGroceryData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: newItems.reduce((updatedItems, newItem) => {
                const existingItemIndex = updatedItems.findIndex(item => item.id === newItem.id);
  
                if (existingItemIndex !== -1) {
                  // אם הפריט קיים, נעדכן את הכמות או נמחק אותו אם הכמות היא 0
                  if (newItem.quantity === 0) {
                    return updatedItems.filter(item => item.id !== newItem.id);
                  } else {
                    updatedItems[existingItemIndex] = {
                      ...updatedItems[existingItemIndex],
                      quantity: newItem.quantity,
                    };
                  }
                } else if (newItem.quantity > 0) {
                  // אם הפריט לא קיים וכמותו גדולה מאפס, נוסיף אותו
                  updatedItems.push(newItem);
                }
  
                return updatedItems;
              }, [...list.items]), // שמירת הרשימה המקורית
            }
          : list
      )
    );
  };
  
   // פונקציה להעתקת כל הפריטים
const copyAllItems = (listId) => {
  const list = getList(listId);
  const allItems = list.items;
 const Items = list.items
    .map(item => ({
      ...item,
      isTaken: false, // שינוי ערך isTaken ל-false
    }));

  // יצירת רשימה חדשה עם שם חדש
  const newList = {
    id: Date.now(),
    name: list.name + "-העתק",
    items: [...Items],
  };
 
  setGroceryData((prevData) => [ newList,...prevData]);
};
// פונקציה להעתקת פריטים שנרכשו והגדרת isTaken כ-false
const copyPurchasedItems = (listId) => {
  const list = getList(listId);
  const purchasedItems = list.items
    .filter(item => item.isTaken)
    .map(item => ({
      ...item,
      isTaken: false, // שינוי ערך isTaken ל-false
    }));

  // יצירת רשימה חדשה עם שם חדש
  const newList = {
    id: Date.now(),
    name: list.name + "-העתק",
    items: [...purchasedItems],
  };

  setGroceryData((prevData) => [ newList,...prevData]);
};

// פונקציה להעתקת פריטים שלא נרכשו
const copyUnpurchasedItems = (listId) => {
  const list = getList(listId);
  const unpurchasedItems = list.items.filter(item => !item.isTaken);

  // יצירת רשימה חדשה עם שם חדש
  const newList = {
    id: Date.now(),
    name: list.name + "-העתק",
    items: [...unpurchasedItems],
  };

  setGroceryData((prevData) => [ newList,...prevData]);
};

  
  
  

  return (
    <GroceryContext.Provider value={{ groceryData,fetchGroceryData, updateOrAddItems,updateListName,updateItemField,deleteList,deleteItem, getList, updateItemStatus,addNewList,copyAllItems,copyPurchasedItems  ,copyUnpurchasedItems }}>
      {children}
    <ErrorNotification message={errorMessage} visible={errorVisible} onClose ={handleCloseError}/>
    </GroceryContext.Provider>
  );
};
