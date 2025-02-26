import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useGrocery } from "./Context/GroceryContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Button, Text, CheckBox } from '@rneui/base';
import NormalHeader from "./Components/NormalHeader";

const GroceryItemsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const list = JSON.parse(params.list);

  const { getItemsForList, updateItemStatus } = useGrocery();
  const [groceryItems, setGroceryItems] = useState([]);
  const [editMode, setEditMode] = useState(false); // מצב עריכה

  useEffect(() => {
    const items = getItemsForList(list.id);
    const sortedItems = [...items].sort((a, b) => a.isTaken - b.isTaken);
    setGroceryItems(sortedItems);
  }, [list.id, getItemsForList]);


  return (
    <View style={styles.container}>
      <NormalHeader title={list.name} />
      <FlatList
        data={groceryItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, item.isTaken && styles.takenItem]} onPress={() => viewDetails(item)}>
              <Text style={styles.GroceryItemsubtitle}>{item.quantity}</Text>
            <View style={styles.ItemRightSide}>
              <Text style={[styles.itemTitle, item.isTaken && styles.takenItem]}>
                {item.name}
              </Text>
            {!editMode && (
              <TouchableOpacity
                onPress={() => updateItemStatus(list.id, item.id)}
                style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkboxCircle,
                    item.isTaken && styles.checked,
                  ]}>
                  {item.isTaken && <Icon name="check" size={18} color="white" />}
                </View>
              </TouchableOpacity>
            )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>אין פריטים להצגה</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }} // הקטנת ה-padding top
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "./AddGroceryItemscreen" })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,  backgroundColor: "#f4f4f4" },
  itemTitle: { fontSize: 18, fontWeight: "bold" }, 
  itemContainer: { 
    flexDirection: "row", 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: "#ffffff",
    marginBottom: 1,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    elevation: 5, 
  },
   ItemRightSide: { flexDirection: 'row' ,justifyContent: 'space-between',alignItems: 'center', },
  GroceryItemsubtitle: { fontSize: 18, color: "#666" }, 
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  checkboxContainer: {
    paddingLeft: 8
  },
  checkboxCircle: {
    width: 25,
    height: 25,
    borderRadius: 15, // זה יוצר את המעגל
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',

  },
  checked: {
    backgroundColor: '#28a745', // צבע ירוק כאשר נבחר
    borderWidth: 0,

  },
  takenItem: {
    backgroundColor: "#f4f4f4" ,
    color: "#888",
  },
});

export default GroceryItemsScreen;
