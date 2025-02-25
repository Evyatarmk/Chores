import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useGrocery } from "./Context/GroceryContext";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button, Text, Icon, ListItem, CheckBox } from '@rneui/base';

const GroceryItemsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = JSON.parse(params.listId);
  const { getItemsForList } = useGrocery();
  const [groceryItems, setGroceryItems] = useState([]);
  const [editMode, setEditMode] = useState(false); // מצב עריכה
  useEffect(() => {
    const items = getItemsForList(listId);
    setGroceryItems(items);
  }, [listId]);

  const sortedGroceryItems = [...groceryItems].sort((a, b) => a.isTaken - b.isTaken);

  const deleteItem = (id) => {
    setGroceryItems(groceryItems.filter((item) => item.id !== id));
  };

  const startEditing = (item) => {
    router.push({ pathname: "./EditGroceryItemscreen", params: { item: JSON.stringify(item) } });
  };

  const viewDetails = (item) => {
    router.push({ pathname: "./ItemDetailsScreen", params: { item: JSON.stringify(item) } });
  };

  const toggleTakenStatus = (id) => {
    const updatedGroceryItems = groceryItems.map((item) =>
      item.id === id ? { ...item, isTaken: !item.isTaken } : item
    );
    setGroceryItems(updatedGroceryItems);
  };

  return (
    <View style={styles.container}>
      {/* כפתור חזור */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color="white" />
      </TouchableOpacity>


      {/* כפתור הפעלת מצב עריכה */}
      <TouchableOpacity style={styles.editModeButton} onPress={() => setEditMode(!editMode)}>
        <Icon name="edit" size={24} color="white" />
      </TouchableOpacity>

      <FlatList
        data={sortedGroceryItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ListItem containerStyle={{ borderBottomWidth: 1, borderBottomColor: "#ccc" }} onPress={() => viewDetails(item)}>
            <ListItem.Content>
              <ListItem.Title style={[styles.itemTitle, item.isTaken && styles.takenItem]}>
                {item.name}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.GroceryItemsubtitle}>כמות: {item.quantity}</ListItem.Subtitle>
            </ListItem.Content>
            {!editMode && (
              <CheckBox
                checked={item.isTaken}
                onPress={() => toggleTakenStatus(item.id)}
                containerStyle={styles.checkboxContainer}
              />
            )}

            {editMode && (
              <>
                <Button
                  icon={<Icon name="edit" size={18} color="white" />}
                  buttonStyle={styles.editButton}
                  onPress={() => startEditing(item)}
                />
                <Button
                  icon={<Icon name="delete" size={18} color="white" />}
                  buttonStyle={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}
                />
              </>
            )}
          </ListItem>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>אין פריטים להצגה</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 80 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "./AddGroceryItemscreen" })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f8f9fa" },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#007bff",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignGroceryItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  editModeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#6c757d",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignGroceryItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  itemTitle: { fontSize: 18, fontWeight: "bold" },
  GroceryItemsubtitle: { fontSize: 14, color: "#666" },
  editButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#28a745",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignGroceryItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    alignGroceryItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  checkboxContainer: {
    marginLeft: 10,
  },
  takenItem: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});

export default GroceryItemsScreen;
