import React, { createContext, useContext, useEffect, useState } from "react";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";

const GroceryContext = createContext();
export const useGrocery = () => useContext(GroceryContext);
export const GroceryProvider = ({ children }) => {
  const { baseUrl } = useApiUrl();
  const [groceryData, setGroceryData] = useState(
[
      {
        id: "1",
        name: "רשימת קניות לבית",
        homeId: "home-123",
        category: "shopping",
        items: [
          {
            id: "item-1",
            name: "חלב",
            quantity: 2,
            isTaken: false,
            description: "חלב 3% שומן 2 ליטר",
            groceryListId: "1",
          },
          {
            id: "item-2",
            name: "לחם",
            quantity: 1,
            isTaken: true,
            description: "לחם מחיטה מלאה",
            groceryListId: "1",
          },
        ],
      },
      {
        id: "2",
        name: "רשימת משימות יומיות",
        homeId: "home-123",
        category: "tasks",
        items: [
          {
            id: "task-1",
            name: "לנקות את הבית",
            quantity: 1, // אפשר להתייחס לכמות כעדיפות או חשיבות
            isTaken: false, // יכול לשמש במקום `isCompleted`
            description: "לנקות את הסלון והמטבח",
            groceryListId: "2", // מזהה כללי, גם אם זו לא רשימת קניות
          },
          {
            id: "task-2",
            name: "לשלם חשבונות",
            quantity: 1,
            isTaken: true,
            description: "חשמל, מים וארנונה",
            groceryListId: "2",
          },
        ],
      },
      {
        id: "3",
        name: "רשימת ציוד לטיול",
        homeId: "home-456",
        category: "trips",
        items: [
          {
            id: "trip-item-1",
            name: "אוהל",
            quantity: 1,
            isTaken: false,
            description: "אוהל ל-4 אנשים",
            groceryListId: "3",
          },
          {
            id: "trip-item-2",
            name: "פנס",
            quantity: 2,
            isTaken: true,
            description: "פנס נטען עם סוללות נוספות",
            groceryListId: "3",
          },
        ],
      },
      {
        id: "4",
        name: "רשימת תכנון אירוע",
        homeId: "home-789",
        category: "events",
        items: [
          {
            id: "event-task-1",
            name: "להזמין מקום",
            quantity: 1,
            isTaken: true,
            description: "הזמנה למסעדה או אולם קטן",
            groceryListId: "4",
          },
          {
            id: "event-task-2",
            name: "לקנות עוגה",
            quantity: 1,
            isTaken: false,
            description: "עוגת שוקולד עם כיתוב אישי",
            groceryListId: "4",
          },
        ],
      },
    ]
    
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const homeId = "home1";


  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const fetchGroceryData = async () => {
    console.log("fff")
    try {
      const response = await fetch(`${baseUrl}/GroceryLists/home/${homeId}`);
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
    //fetchGroceryData();
  }, []);


  // פונקציה לקבלת פריטים לפי listId
  const getList = (listId) => {
    const list = groceryData.find((list) => list.id === listId);
    return list;
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
    // try {
    //   // שליחה לשרת עם הבקשה ליצור רשימה חדשה
    //   const response = await fetch(`${baseUrl}/GroceryLists/home/${homeId}`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(listName)
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to create grocery list');
    //   }

    //   // קבלת התשובה מהשרת (הנתונים של הרשימה החדשה)
    //   const serverList = await response.json();

    //   // עדכון הרשימה עם ה-ID שנשלח מהשרת (אם ה-ID שונה מה-local ID)
    //   setGroceryData((prevData) =>
    //     prevData.map((list) =>
    //       list.id === newList.id ? { ...list, id: serverList.id } : list
    //     )
    //   );
    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר")
    //   setErrorVisible(true)
    //   setGroceryData((prevData) => prevData.filter((list) => list.id !== newList.id));
    // }
  };


  const deleteList = async (listId) => {
    // שמירת מצב הרשימה לפני המחיקה (למקרה של שגיאה)
    const previousGroceryData = [...groceryData];

    // עדכון הסטייט באופן מקומי כדי להרגיש שהמחיקה מהירה
    setGroceryData(groceryData.filter(list => list.id !== listId));

    // try {
    //   // שליחת בקשת מחיקה לשרת
    //   const response = await fetch(`${baseUrl}/GroceryLists/home/${homeId}/List/${listId}`, {
    //     method: 'DELETE',
    //     headers: { 'Content-Type': 'application/json' }
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to delete grocery list');
    //   }

    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר");
    //   setErrorVisible(true);
    //   setGroceryData(previousGroceryData);
    // }
  };


  const updateListName = async (listId, newName) => {
    const oldName = groceryData.find(list => list.id === listId)?.name;
    setGroceryData(prevData =>
      prevData.map(list =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );

    // try {
    //   // שליחת הבקשה לשרת
    //   const response = await fetch(`${baseUrl}/GroceryLists/home/${homeId}/list/${listId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newName),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to update grocery list name');
    //   }

    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בעדכון שם הרשימה");
    //   setErrorVisible(true);

    //   // שחזור השם הישן במקרה של כישלון
    //   setGroceryData(prevData =>
    //     prevData.map(list =>
    //       list.id === listId ? { ...list, name: oldName } : list
    //     )
    //   );
    // }
  };

  const updateItemStatus = async (listId, itemId, currentStatus) => {
    const newStatus = !currentStatus; // היפוך הסטטוס
  
    // עדכון מקומי לשיפור חוויית המשתמש
    const updatedGroceryData = groceryData.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, isTaken: newStatus } : item
            ),
          }
        : list
    );
  
    setGroceryData(updatedGroceryData);
  // try {
  //     // קריאה לשרת עם הסטטוס החדש ב-URL
  //       const response = await fetch(
  //       `${baseUrl}/GroceryLists/home/${homeId}/List/${listId}/Item/${itemId}/status/${newStatus}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  
  //     if (!response.ok) {
  //       throw new Error("Failed to update item status");
  //     }
  //   } catch (error) {
  //     console.error("Error updating item status:", error);
  
  //     // שחזור הנתונים במקרה של כישלון
  //     setGroceryData((prevData) =>
  //       prevData.map((list) =>
  //         list.id === listId
  //           ? {
  //               ...list,
  //               items: list.items.map((item) =>
  //                 item.id === itemId ? { ...item, isTaken: currentStatus } : item
  //               ),
  //             }
  //           : list
  //       )
  //     );
  
  //     // הצגת הודעת שגיאה
  //     setErrorMessage("הייתה בעיה בעדכון הסטטוס, אנא נסה שוב");
  //     setErrorVisible(true);
  //   }
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
  const deleteItem = (listId, ItemId) => {
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

    setGroceryData((prevData) => [newList, ...prevData]);
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

    setGroceryData((prevData) => [newList, ...prevData]);
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

    setGroceryData((prevData) => [newList, ...prevData]);
  };





  return (
    <GroceryContext.Provider value={{ groceryData, fetchGroceryData, updateOrAddItems, updateListName, updateItemField, deleteList, deleteItem, getList, updateItemStatus, addNewList, copyAllItems, copyPurchasedItems, copyUnpurchasedItems }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </GroceryContext.Provider>
  );
};
