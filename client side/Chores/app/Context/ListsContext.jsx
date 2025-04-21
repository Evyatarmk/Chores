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
      }, baseUrl);
  
      if (!response || !response.ok) {
        throw new Error("שגיאה בהורדת נתונים");
      }
  
      const data = await response.json();

      if (data.length === 0) {
        setListsData([]); // רשימה ריקה
      } else {
        const cleanedData = data.map((list) =>
          list.date == null ? { ...list, date: "" } : list
        );       
        setListsData(cleanedData);
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
    const list = listsData.find((list) => list.id == listId);
    return list;
  };

  const addNewList = async (newList) => {
    // עדכון ה-state של המצרכים מיד לאחר יצירת הרשימה
    setListsData((prevData) => [newList, ...prevData]);

    try {
      if(newList.date=="")newList.date=null
      // שליחה לשרת עם הבקשה ליצור רשימה חדשה
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}`, {
        method: 'POST',
        body: JSON.stringify(newList)
      }, baseUrl);

      if (!response.ok) {
        throw new Error('Failed to create list list');
      }

      // קבלת התשובה מהשרת (הנתונים של הרשימה החדשה)
      const serverList = await response.json();
      serverList.date=serverList.date==null?"":serverList.date
      // עדכון הרשימה עם ה-ID שנשלח מהשרת (אם ה-ID שונה מה-local ID)
      setListsData((prevData) =>
        prevData.map((list) =>
          list.id === newList.id ? {...serverList} : list
        )
      );
    } catch (error) {
      setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר")
      setErrorVisible(true)
      setListsData((prevData) => prevData.filter((list) => list.id !== newList.id));
    }
  };


  const deleteList = async (listId) => {
    // שמירת מצב הרשימה לפני המחיקה (למקרה של שגיאה)
    const previousListsData = [...listsData];

    // עדכון הסטייט באופן מקומי כדי להרגיש שהמחיקה מהירה
    setListsData(listsData.filter(list => list.id !== listId));

    try {
      // שליחת בקשת מחיקה לשרת
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/List/${listId}`, {
        method: 'DELETE'
      }, baseUrl);

      if (!response.ok) {
        throw new Error('Failed to delete list list');
      }

    } catch (error) {
      setErrorMessage("הייתה בעיה בהתחברות לשרת, אנא נסה שוב מאוחר יותר");
      setErrorVisible(true);
      setListsData(previousListsData);
    }
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
    const updatedListSafe = {
      ...updatedList,
      date: updatedList.date === "" ? null : updatedList.date,
    };
        try {
      // שליחת הבקשה לשרת
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedListSafe), // שולח את כל הנתונים המעודכנים
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error('Failed to update list list');
      }
    } catch (error) {
      setErrorMessage("הייתה בעיה בעדכון הרשימה");
      setErrorVisible(true);
  
      // שחזור הנתונים במקרה של כישלון
      setListsData(prevData =>
        prevData.map(list => (list.id === listId ? oldList : list))
      );
    }
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
  try {
      // קריאה לשרת עם הסטטוס החדש ב-URL
        const response = await fetchWithAuth(
        `${baseUrl}/Lists/home/${home.id}/List/${listId}/Item/${itemId}/status/${newStatus}`,
        {
          method: "PUT",
        }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to update item status");
      }
    } catch (error) {
      console.error("Error updating item status:", error);
  
      // שחזור הנתונים במקרה של כישלון
      setListsData((prevData) =>
        prevData.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, isTaken: currentStatus } : item
                ),
              }
            : list
        )
      );
  
      // הצגת הודעת שגיאה
      setErrorMessage("הייתה בעיה בעדכון הסטטוס, אנא נסה שוב");
      setErrorVisible(true);
    }
  };
  
  const updateItemField = async (listId, updatedItem) => {
    const oldItem = listsData
      .find(list => list.id === listId)
      ?.items.find(item => item.id === updatedItem.id);
  
    // עדכון מיידי של הסטייט
    setListsData(prevData =>
      prevData.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
              ),
            }
          : list
      )
    );
  
    try {
      // שליחת הבקשה לשרת
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/item/${updatedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem),
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
    } catch (error) {
      setErrorMessage("הייתה בעיה בעדכון הפריט");
      setErrorVisible(true);
  
      // שחזור הפריט הישן אם הייתה שגיאה
      setListsData(prevData =>
        prevData.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map(item =>
                  item.id === updatedItem.id ? oldItem : item
                ),
              }
            : list
        )
      );
    }
  };
  
  const deleteItem = async (listId, ItemId) => {
    // שמירת הפריט הישן כדי לשחזר במקרה של שגיאה
    const oldItem = listsData
      .find(list => list.id === listId)
      ?.items.find(item => item.id === ItemId);
  
    // עדכון הסטייט מיידית על ידי הסרת הפריט
    setListsData(prevData =>
      prevData.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter(item => item.id !== ItemId),
            }
          : list
      )
    );
  
    try {
      // שליחת הבקשה לשרת למחיקת הפריט
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/item/${ItemId}`, {
        method: 'DELETE',
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      setErrorMessage("הייתה בעיה בהסרת הפריט");
      setErrorVisible(true);
  
      // שחזור הפריט הישן אם הייתה שגיאה
      setListsData(prevData =>
        prevData.map(list =>
          list.id === listId
            ? {
                ...list,
                items: [...list.items, oldItem], // החזרת הפריט
              }
            : list
        )
      );
    }
  };
  
  const updateOrAddItems = async (listId, newItems) => {
    // שמירת הרשימה הקודמת כדי לשחזר במקרה של שגיאה
    const oldList = listsData.find(list => list.id === listId);
  
    // עדכון הסטייט מיידית על ידי שינוי או הוספת פריטים
    setListsData(prevData =>
      prevData.map(list =>
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
  
    try {
      // שליחת הבקשה לשרת לעדכון או הוספת פריטים
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/items`, {
        method: 'PUT', // עדכון פריטים
        body: JSON.stringify(newItems),
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to update or add items");
      }
  
      // אם הבקשה הצליחה, נעדכן את הסטייט עם הרשימה המעודכנת
      const updatedList = await response.json(); // מקבלים את הרשימה המעודכנת מהשרת
      setListsData(prevData =>
        prevData.map(list =>
          list.id === listId ? { ...list, items: updatedList.items } : list
        )
      );
    } catch (error) {
      setErrorMessage("הייתה בעיה בעדכון או בהוספת הפריטים");
      setErrorVisible(true);
  
      // שחזור הרשימה במקרה של כישלון
      setListsData(prevData =>
        prevData.map(list =>
          list.id === listId
            ? oldList // החזרת הרשימה הקודמת
            : list
        )
      );
    }
  };
  
  

  const clearCheckedItems = async (listId) => {
    // שמירת הרשימה הקודמת כדי לשחזר במקרה של שגיאה
    const oldList = listsData.find(list => list.id === listId);
  
    // עדכון הסטייט מיידית כדי להסיר פריטים שנלקחו
    setListsData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((item) => !item.isTaken), // מסננים את הפריטים שנלקחו
            }
          : list
      )
    );
  
    try {
      // שליחת הבקשה לשרת לעדכון או מחיקת הפריטים שנלקחו
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/clearCheckedItems`, {
        method: 'PUT', // עדכון פריטים
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to clear checked items");
      }
    } catch (error) {
      setErrorMessage("הייתה בעיה בהסרת הפריטים שנלקחו");
      setErrorVisible(true);
  
      // שחזור הרשימה במקרה של כישלון
      setListsData((prevData) =>
        prevData.map((list) =>
          list.id === listId ? oldList : list
        )
      );
    }
  };
  

  const uncheckAllItems = async (listId) => {
    // שמירת הרשימה הקודמת כדי לשחזר במקרה של שגיאה
    const oldList = listsData.find(list => list.id === listId);
  
    // עדכון הסטייט מיידית כך שכל הפריטים יהיו לא מסומנים
    setListsData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) => ({ ...item, isTaken: false })), // עדכון כל הפריטים
            }
          : list
      )
    );
  
    try {
      // שליחת הבקשה לשרת לעדכון מצב של כל הפריטים
      const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/uncheckAllItems`, {
        method: 'PUT', // עדכון מצב כל הפריטים
      }, baseUrl);
  
      if (!response.ok) {
        throw new Error("Failed to uncheck all items");
      }
    } catch (error) {
      setErrorMessage("הייתה בעיה בהסרת סימון הפריטים");
      setErrorVisible(true);
  
      // שחזור הרשימה במקרה של כישלון
      setListsData((prevData) =>
        prevData.map((list) =>
          list.id === listId ? oldList : list
        )
      );
    }
  };
  
// פונקציה להעתקת כל הפריטים
const copyAllItems = async (listId) => {
  const list = getList(listId);
  const items = list.items.map(item => ({
    ...item,
    isTaken: false, // שינוי ערך isTaken ל-false
  }));

  const newList = {
    name: list.name + "-העתק",
    category: list.category,
    date: list.date,
    items: [...items],
  };

  // שמירת המצב הקודם של הסטייט כדי לשחזר במקרה של כישלון
  const previousState = [...listsData];

  try {
    // שליחת הבקשה לשרת להעתקת כל הפריטים
    const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/copyAllItems`, {
      method: 'POST',
    }, baseUrl);

    if (!response.ok) {
      throw new Error("Failed to copy all items");
    }

    const newListData = await response.json(); // קבלת הרשימה החדשה מהשרת

    // עדכון הסטייט עם הרשימה החדשה
    setListsData((prevData) => [newListData, ...prevData]);

  } catch (error) {
    setErrorMessage("הייתה בעיה בהעתקת כל הפריטים");
    setErrorVisible(true);

    // שחזור המצב הקודם במקרה של כישלון
    setListsData(previousState);
  }
};

// פונקציה להעתקת פריטים שנרכשו והגדרת isTaken כ-false
const copyPurchasedItems = async (listId) => {
  const list = getList(listId);
  const purchasedItems = list.items
    .filter(item => item.isTaken)
    .map(item => ({
      ...item,
      isTaken: false, // שינוי ערך isTaken ל-false
    }));

  const newList = {
    name: list.name + "-העתק",
    category: list.category,
    date: list.date,
    items: [...purchasedItems],
  };

  // שמירת המצב הקודם של הסטייט כדי לשחזר במקרה של כישלון
  const previousState = [...listsData];

  try {
    const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/copyPurchasedItems`, {
      method: 'POST',
      body: JSON.stringify(newList),
    }, baseUrl);

    if (!response.ok) {
      throw new Error("Failed to copy purchased items");
    }

    const newListData = await response.json(); // קבלת הרשימה החדשה מהשרת

    setListsData((prevData) => [newListData, ...prevData]);

  } catch (error) {
    setErrorMessage("הייתה בעיה בהעתקת פריטים שנרכשו");
    setErrorVisible(true);

    // שחזור המצב הקודם במקרה של כישלון
    setListsData(previousState);
  }
};

// פונקציה להעתקת פריטים שלא נרכשו
const copyUnpurchasedItems = async (listId) => {
  const list = getList(listId);
  const unpurchasedItems = list.items.filter(item => !item.isTaken);

  const newList = {
    name: list.name + "-העתק",
    category: list.category,
    date: list.date,
    items: [...unpurchasedItems],
  };

  // שמירת המצב הקודם של הסטייט כדי לשחזר במקרה של כישלון
  const previousState = [...listsData];

  try {
    // שליחת הבקשה לשרת להעתקת פריטים שלא נרכשו
    const response = await fetchWithAuth(`${baseUrl}/Lists/home/${home.id}/list/${listId}/copyUnpurchasedItems`, {
      method: 'POST',
      body: JSON.stringify(newList),
    }, baseUrl);

    if (!response.ok) {
      throw new Error("Failed to copy unpurchased items");
    }

    const newListData = await response.json(); // קבלת הרשימה החדשה מהשרת

    // עדכון הסטייט עם הרשימה החדשה
    setListsData((prevData) => [newListData, ...prevData]);

  } catch (error) {
    setErrorMessage("הייתה בעיה בהעתקת פריטים שלא נרכשו");
    setErrorVisible(true);

    // שחזור המצב הקודם במקרה של כישלון
    setListsData(previousState);
  }
};






  return (
    <ListsContext.Provider value={{ listsData,fetchListsData, updateOrAddItems, updateList, updateItemField, deleteList, deleteItem, getList, updateItemStatus, addNewList,clearCheckedItems, uncheckAllItems,copyAllItems, copyPurchasedItems, copyUnpurchasedItems }}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </ListsContext.Provider>
  );
};
