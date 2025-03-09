import React, { createContext, useContext, useState } from "react";

const GroceryContext = createContext();
export const useGrocery = () => useContext(GroceryContext);
export const GroceryProvider = ({ children }) => {
  const [groceryData, setGroceryData] = useState([
    {
      id: 1,
      name: "רשימת מצרכים לפסח",
      items: [
        { id: 1, name: "מצה", quantity: 2, isTaken: false, description: "מצות שמורות ללא חשש קטניות" },
        { id: 2, name: "יין", quantity: 1, isTaken: false, description:""},
      ],
    },
    {
      id: 2,
      name: "רשימת מצרכים לשבוע",
      items: [
        { id: 3, name: "חלב", quantity: 1, isTaken: false, description: "חלב 3% טרי" },
        { id: 4, name: "לחם", quantity: 3, isTaken: false, description: "לחם אחיד פרוס" },
      ],
    },
  ]);
  

  // פונקציה לקבלת פריטים לפי listId
  const getList = (listId) => {
    const list = groceryData.find((list) => list.id === listId);
    return list ;
  };

  const addNewList= (listName) => {
    let newList={
      id: Date.now(),
      name: listName,
      items: [],
    }
    let newGroceryData=[...groceryData,newList]
    setGroceryData(newGroceryData)
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
  const addItems = (listId, newItems) => {
    setGroceryData((prevData) =>
      prevData.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: newItems.reduce((updatedItems, newItem) => {
                if (newItem.quantity === 0) {
                  // אם הכמות היא 0, אל תוסיף את הפריט
                  return updatedItems.filter(item => item.name !== newItem.name || item.description !== newItem.description);
                }
  
                const existingItemIndex = updatedItems.findIndex(item => item.name === newItem.name && item.description === newItem.description);
  
                if (existingItemIndex !== -1) {
                  // אם הפריט כבר קיים, עדכן את הכמות
                  updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: newItem.quantity,
                  };
                } else {
                  // אם הפריט לא קיים, הוסף אותו
                  updatedItems.push(newItem);
                }
  
                return updatedItems;
              }, [...list.items]), // שמור על הרשימה המקורית
            }
          : list
      )
    );
  };
   // פונקציה להעתקת כל הפריטים
const copyAllItems = (listId) => {
  const list = getList(listId);
  const allItems = list.items;

  // יצירת רשימה חדשה עם שם חדש
  const newList = {
    id: Date.now(),
    name: list.name + "-העתק",
    items: [...allItems],
  };

  setGroceryData((prevData) => [...prevData, newList]);
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

  setGroceryData((prevData) => [...prevData, newList]);
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

  setGroceryData((prevData) => [...prevData, newList]);
};

  
  
  

  return (
    <GroceryContext.Provider value={{ groceryData, addItems,updateListName,updateItemField,deleteList,deleteItem, getList, updateItemStatus,addNewList,copyAllItems,copyPurchasedItems  ,copyUnpurchasedItems }}>
      {children}
    </GroceryContext.Provider>
  );
};
