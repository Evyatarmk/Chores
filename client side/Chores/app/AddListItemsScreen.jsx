import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ClearableInput from "./Components/ClearableInput";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLists } from "./Context/ListsContext";
import { v4 as uuidv4 } from "uuid"; // נדרשת חבילה זו

const AddListItemsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = JSON.parse(params.listId);
  const [inputTextItemName, setInputTextItemName] = useState("");
  const [newItem, setNewItem] = useState(null)
  const { updateOrAddItems,getList } = useLists();

  const [itemsToShow, setItemsToShow] = useState([]);
  const [itemsToAdd, setItemsToAdd] = useState([]);

  useEffect(() => {
    const tempItems = [
      { id: 101, name: "ביצים", description: ""},
      { id: 102, name: "סוכר", description: "שקית 1 ג" },
      { id: 103, name: "מלח", description: "מלח שולחן רגיל"},
    ];
    const tempItemsToShow = tempItems.map((item) => ({
      id: uuidv4(),
      name: item.name,
      description: item.description,
      quantity: 0,
      isTaken: false,
      listId:listId,
    }));
        
    const allItems = [ ...getList(listId).items,...tempItemsToShow];
  
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex((t) => (
        t.name === item.name && t.description === item.description
      ))
    );
    setItemsToShow(uniqueItems);
  }, []);

  const handleAddItem = (item) => {    
    setItemsToAdd((prevItems) => {
      let existingItem = prevItems.find((i) => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id 
        ? { ...i, quantity: i.quantity + 1 }
        : i
      );
    }
      existingItem = itemsToShow.find((i) => i.id === item.id);
      if (existingItem) {
        let newExistingItem={...existingItem,quantity: existingItem.quantity + 1}
        return [...prevItems,newExistingItem]
    }
      let NewItem = { ...item, quantity:item.quantity+1 };
      return [...prevItems, NewItem];
    });
  
    setItemsToShow((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
  
      if (existingItem) {
        return prevItems.map((i) =>
          i.name === item.name && i.description === item.description
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
  
      setNewItem(null);
      let NewItem = { ...item,quantity: 1 };
      return [...prevItems, NewItem];
    });
  };
  

  const handleRemoveItem = (item) => {
    setItemsToAdd((prevItems) => {
      let existingItem = prevItems.find((i) => i.id === item.id);
  
      if (existingItem) {
        return prevItems.map((i) =>
          i.name === item.name && i.description === item.description
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      existingItem = itemsToShow.find((i) => i.id === item.id);
      if (existingItem) {
        let newExistingItem={...existingItem,quantity: existingItem.quantity - 1}
        return [...prevItems,newExistingItem]
    }

    });
  
    setItemsToShow((prevItems) => {
      const existingItem = prevItems.find((i) => i.name === item.name && i.description === item.description);
  
      if (existingItem) {
        return prevItems.map((i) =>
          i.name === item.name && i.description === item.description
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prevItems.filter((i) => i.name !== item.name && i.description !== item.description);
    });
  };
  const handleConfirm = () => {
    updateOrAddItems(listId,itemsToAdd);
     router.back()
  

  };
  const handleInputTextItemChange = (text) => {
    setInputTextItemName(text);
    if(text==""){
      setNewItem(null);
    }
    const existingItem = itemsToShow.find((item) => item.name === text && !item.description);
    if (existingItem) {
      setNewItem(null);
    } else {
      setNewItem({
        id:uuidv4() , // יצירת מזהה ייחודי
        name: text,
        description: "",
        quantity: 0,
        isTaken: false,
        listId:listId,
      });
    }
  };

  const filteredAndSortedItems = itemsToShow
    .filter((item) => item.name.toLowerCase().includes(inputTextItemName.toLowerCase())) // סינון
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); // מיון אלפביתי

  return (
    <View style={styles.container}>
      {/* כותרת המסך */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הוספת פריט</Text>
      </View>

      <TouchableOpacity
      style={styles.confirmButton}
      onPress={handleConfirm}
      >
      <Icon name="check" size={30} color="white" />
      </TouchableOpacity>

      {/* שדה קלט */}
      <ClearableInput
        value={inputTextItemName}
        onChangeText={handleInputTextItemChange}
        placeholder="שם הפריט החדש"
      />

      {/* הצגת פריט חדש אם השם לא ריק */}
      {newItem && newItem.name.trim() !== ""&&(
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() => handleRemoveItem(newItem)}
            style={styles.removeButton}
          >
            {newItem.quantity > 0 && (
              <Ionicons
                name="remove-circle"
                size={28}
                color="#d9534f"
              />
            )}
          </TouchableOpacity>
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{newItem?.name}</Text>
            {newItem?.description ? (
              <Text style={styles.itemDescription}>{newItem?.description}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => handleAddItem(newItem)} style={styles.addButton}>
            <Ionicons
              name="add-circle"
              size={28}
              color={newItem.quantity === 0 ? "#d3d3d3" : "#4CAF50"} // צבע אפור בהיר אם הכמות 0, אחרת ירוק
            />
          </TouchableOpacity>
        </View>
      )}

      {/* רשימת פריטים */}
      <FlatList
        data={filteredAndSortedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.quantity > 0 && (
            <TouchableOpacity
              onPress={() => handleRemoveItem(item)}
              style={styles.removeButton}
            >
                <Ionicons
                  name="remove-circle"
                  size={28}
                  color="#d9534f"
                />
              
            </TouchableOpacity>)}
            {item.quantity ? <Text style={styles.itemDescription}>{item.quantity}</Text> : null}

            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => handleAddItem(item)} style={styles.addButton}>
              <Ionicons
                name="add-circle"
                size={28}
                color={item.quantity === 0 ? "#d3d3d3" : "#4CAF50"} // צבע אפור בהיר אם הכמות 0, אחרת ירוק
              />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }} // הקטנת ה-padding top

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // שים את התוכן בצד שמאל
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  itemDetails: {
    flexDirection: "column",
    marginLeft: 10,
    flex: 1, // וודא שהתוכן ימלא את שאר השטח
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign:"right"
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  addButton: {
    padding: 5,
  },
  removeButton: {
    padding: 5,
    marginRight: 10, // אם תרצה רווח בין כפתור המחיקה לשאר הפריט
  },
});

export default AddListItemsScreen;
