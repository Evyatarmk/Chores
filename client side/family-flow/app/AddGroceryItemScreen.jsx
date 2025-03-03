import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ClearableInput from "./Components/ClearableInput";

const AddGroceryItemScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = JSON.parse(params.listId);
  const [inputTextItemName, setInputTextItemName] = useState("");
  const [newItem, setNewItem] = useState({
    id: Date.now(),
    name: "",
    description: "",
    quantity: 1,
    isTaken: false,
  });
  const [itemsToShow, setItemsToShow] = useState([]);

  useEffect(() => {
    const tempItems = [
      { id: 101, name: "ביצים", description: "", quantity: 1, isTaken: false },
      { id: 102, name: "סוכר", description: "שקית 1 ג", quantity: 1, isTaken: false },
      { id: 103, name: "מלח", description: "מלח שולחן רגיל", quantity: 1, isTaken: false },
    ];
    setItemsToShow(tempItems);
  }, []);

  const handleAddItem = (item) => {
    setItemsToShow((prevItems) => {
      if (!prevItems.some((i) => i.id === item.id)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
  };

  const handleRemoveItem = (item) => {
    setItemsToShow((prevItems) => prevItems.filter((i) => i.id !== item.id));
  };

  const handleInputTextItemChange = (text) => {
    setInputTextItemName(text);
    let updatedItem = { ...newItem, name: text };

    // אם השם לא קיים ברשימה, ניצור פריט חדש
    const existingItemIndex = itemsToShow.findIndex((item) => item.name === text);
    if (existingItemIndex >= 0) {
      updatedItem = { ...newItem, name: "" }; // אם השם קיים, ננקה את השם
    }

    setNewItem(updatedItem);
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

      {/* שדה קלט */}
      <ClearableInput
        value={inputTextItemName}
        onChangeText={handleInputTextItemChange}
        placeholder="שם הפריט החדש"
      />

      {/* הצגת פריט חדש אם השם לא ריק */}
      {newItem?.name !== "" && (
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() => handleRemoveItem(newItem)}
            style={styles.removeButton}
          >
            <Ionicons name="remove-circle" size={28} color="#d9534f" />
          </TouchableOpacity>
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{newItem?.name}</Text>
            {newItem?.description ? (
              <Text style={styles.itemDescription}>{newItem?.description}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => handleAddItem(newItem)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      )}

      {/* רשימת פריטים */}
      <FlatList
        data={filteredAndSortedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item)}
              style={styles.removeButton}
            >
              <Ionicons name="remove-circle" size={28} color="#d9534f" />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
            </View>

            <TouchableOpacity onPress={() => handleAddItem(item)} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}
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
  itemContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  itemDetails: {
    flexDirection: "column",
    marginLeft: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
  },
});

export default AddGroceryItemScreen;
