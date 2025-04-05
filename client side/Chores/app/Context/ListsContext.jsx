import React, { createContext, useContext, useEffect, useState } from "react";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { useUserAndHome } from "./UserAndHomeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithAuth } from "../Utils/fetchWithAuth"; 

const ListsContext = createContext();
export const useLists = () => useContext(ListsContext);
export const ListsProvider = ({ children }) => {
  const { baseUrl } = useApiUrl();
  const { home ,user} = useUserAndHome();


  const [listsData, setListsData] = useState([
    {
      id: "1",
      name: "רשימת קניות לבית",
      homeId: "home-123",
      category: "קניות",
      date: "", // אין תאריך
      items: [
        {
          id: "item-1",
          name: "חלב",
          quantity: 2,
          isTaken: false,
          description: "חלב 3% שומן 2 ליטר",
          listId: "1",
        },
        {
          id: "item-2",
          name: "לחם",
          quantity: 1,
          isTaken: true,
          description: "לחם מחיטה מלאה",
          listId: "1",
        },
      ],
    },
    {
      id: "2",
      name: "רשימת משימות יומיות",
      homeId: "home-123",
      category: "משימות יומיות",
      date: "2025-03-20", // יש תאריך לדוגמה
      items: [
        {
          id: "task-1",
          name: "לנקות את הבית",
          quantity: 1,
          isTaken: false,
          description: "לנקות את הסלון והמטבח",
          listId: "2",
        },
        {
          id: "task-2",
          name: "לשלם חשבונות",
          quantity: 1,
          isTaken: true,
          description: "חשמל, מים וארנונה",
          listId: "2",
        },
      ],
    },
    {
      id: "3",
      name: "רשימת ציוד לטיול",
      homeId: "home-456",
      category: "טיולים",
      date: "2025-04-05", // יש תאריך לדוגמה
      items: [
        {
          id: "trip-item-1",
          name: "אוהל",
          quantity: 1,
          isTaken: false,
          description: "אוהל ל-4 אנשים",
          listId: "3",
        },
        {
          id: "trip-item-2",
          name: "פנס",
          quantity: 2,
          isTaken: true,
          description: "פנס נטען עם סוללות נוספות",
          listId: "3",
        },
      ],
    },
    {
      id: "4",
      name: "רשימת תכנון אירוע",
      homeId: "home-789",
      category: "אירועים",
      date: "", // אין תאריך
      items: [
        {
          id: "event-task-1",
          name: "להזמין מקום",
          quantity: 1,
          isTaken: true,
          description: "הזמנה למסעדה או אולם קטן",
          listId: "4",
        },
        {
          id: "event-task-2",
          name: "לקנות עוגה",
          quantity: 1,
          isTaken: false,
          description: "עוגת שוקולד עם כיתוב אישי",
          listId: "4",
        },
      ],
    },
  ]);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const handleCloseError = () => {
    setErrorMessage("")
    setErrorVisible(false)
  };
  const fetchListsData = async () => {
    try {
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}`, {
        method: 'GET',
      });
  
      if (!response || !response.ok) {
        throw new Error("שגיאה בהורדת נתונים");
      }
  
      const data = await response.json();

      if (data.length === 0) {
        setListsData([]); // רשימה ריקה
      } else {
        setListsData(data);
      }  
      } catch (error) {
      console.error("שגיאה בקבלת נתוני רשימות:", error);
      setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר");
      setErrorVisible(true);
    }
  };

  useEffect(() => {
    if (home && user) {
      fetchListsData();
    }
  }, [home, user]);

  // פונקציה לקבלת פריטים לפי listId
  const getList = (listId) => {
    const list = listsData.find((list) => list.id === listId);
    return list;
  };

  const addNewList = async (newList) => {
    // עדכון ה-state של המצרכים מיד לאחר יצירת הרשימה
    setListsData((prevData) => [newList, ...prevData]);
    // try {
    //   // שליחה לשרת עם הבקשה ליצור רשימה חדשה
    //   const response = await fetch(`${baseUrl}/Lists/home/${homeId}`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(listName)
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to create list list');
    //   }

    //   // קבלת התשובה מהשרת (הנתונים של הרשימה החדשה)
    //   const serverList = await response.json();

    //   // עדכון הרשימה עם ה-ID שנשלח מהשרת (אם ה-ID שונה מה-local ID)
    //   setListsData((prevData) =>
    //     prevData.map((list) =>
    //       list.id === newList.id ? { ...list, id: serverList.id } : list
    //     )
    //   );
    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר")
    //   setErrorVisible(true)
    //   setListsData((prevData) => prevData.filter((list) => list.id !== newList.id));
    // }
  };


  const deleteList = async (listId) => {
    // שמירת מצב הרשימה לפני המחיקה (למקרה של שגיאה)
    const previousListsData = [...listsData];

    // עדכון הסטייט באופן מקומי כדי להרגיש שהמחיקה מהירה
    setListsData(listsData.filter(list => list.id !== listId));

    // try {
    //   // שליחת בקשת מחיקה לשרת
    //   const response = await fetch(`${baseUrl}/Lists/home/${homeId}/List/${listId}`, {
    //     method: 'DELETE',
    //     headers: { 'Content-Type': 'application/json' }
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to delete list list');
    //   }

    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר");
    //   setErrorVisible(true);
    //   setListsData(previousListsData);
    // }
  };


  const updateList = async (listId, updatedList) => {
    // שמירת הנתונים הישנים למקרה של שגיאה
    const oldList = listsData.find(list => list.id === listId);
  
    // עדכון הסטייט לנתונים החדשים באופן מיידי
    setListsData(prevData =>
      prevData.map(list =>
        list.id === listId ? { ...list, ...updatedList } : list
      )
    );
  
    // try {
    //   // שליחת הבקשה לשרת
    //   const response = await fetch(`${baseUrl}/home/${homeId}/lists/${listId}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedList), // שולח את כל הנתונים המעודכנים
    //   });
  
    //   if (!response.ok) {
    //     throw new Error('Failed to update list list');
    //   }
    // } catch (error) {
    //   setErrorMessage("הייתה בעיה בעדכון הרשימה");
    //   setErrorVisible(true);
  
    //   // שחזור הנתונים במקרה של כישלון
    //   setListsData(prevData =>
    //     prevData.map(list => (list.id === listId ? oldList : list))
    //   );
    // }
  };
  
  
  const updateItemStatus = async (listId, itemId, currentStatus) => {
    const newStatus = !currentStatus; // היפוך הסטטוס
  
    // עדכון מקומי לשיפור חוויית המשתמש
    const updatedListsData = listsData.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, isTaken: newStatus } : item
            ),
          }
        : list
    );
  
    setListsData(updatedListsData);
  // try {
  //     // קריאה לשרת עם הסטטוס החדש ב-URL
  //       const response = await fetch(
  //       `${baseUrl}/Lists/home/${homeId}/List/${listId}/Item/${itemId}/status/${newStatus}`,
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
  //     setListsData((prevData) =>
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
  
  
  const setLists = (newData) => {
    setListsData([...newData])
  };

  const updateItemField = (listId, updatedItem) => {
    setListsData((prevData) =>
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
    setListsData((prevData) =>
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
    setListsData((prevData) =>
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

  const clearCheckedItems = (listId) => {
    setListsData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
            ...list,
            items: list.items.filter((item) => item.isTaken == false),
          }
          : list
      )
    );
  }
  const uncheckAllItems = (listId) => {
    setListsData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
            ...list,
            items: list.items.map((item) => ({ ...item, isTaken: false })),
          }
          : list
      )
    );
  }
    // פונקציה להעתקת כל הפריטים
  const copyAllItems = (listId) => {
    const list = getList(listId);
    const Items = list.items
      .map(item => ({
        ...item,
        isTaken: false, // שינוי ערך isTaken ל-false
      }));

    // יצירת רשימה חדשה עם שם חדש
    const newList = {
      id: Date.now(),
      name: list.name + "-העתק",
      category: list.category,
      date:list.date,
      items: [...Items],
    };

    setListsData((prevData) => [newList, ...prevData]);
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
      category: list.category,
      date:list.date,
      items: [...purchasedItems],
    };

    setListsData((prevData) => [newList, ...prevData]);
  };

  // פונקציה להעתקת פריטים שלא נרכשו
  const copyUnpurchasedItems = (listId) => {
    const list = getList(listId);
    const unpurchasedItems = list.items.filter(item => !item.isTaken);

    // יצירת רשימה חדשה עם שם חדש
    const newList = {
      id: Date.now(),
      name: list.name + "-העתק",
      category: list.category,
      date:list.date,
      items: [...unpurchasedItems],
    };

    setListsData((prevData) => [newList, ...prevData]);
  };





  return (
    <ListsContext.Provider value={{ listsData, setLists,fetchListsData, updateOrAddItems, updateList, updateItemField, deleteList, deleteItem, getList, updateItemStatus, addNewList,clearCheckedItems, uncheckAllItems,copyAllItems, copyPurchasedItems, copyUnpurchasedItems }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </ListsContext.Provider>
  );
};
