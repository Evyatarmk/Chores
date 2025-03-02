import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useGrocery } from "./Context/GroceryContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from '@rneui/base';
import NormalHeader from "./Components/NormalHeader";
import ProgressBar from "./Components/ProgressBar";
import BottomSheetModal from "./Components/BottomSheetModal";
import FloatingLabelInput from "./Components/FloatingLabelInput";

const GroceryItemsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const list = JSON.parse(params.list);
  const editModalRef = useRef(null);
  const [currentItem, setCurrentItem] = useState(null);
  const { getItemsForList, updateItemStatus, groceryData ,updateItemField} = useGrocery();
  const [groceryItems, setGroceryItems] = useState([]);

  useEffect(() => {
    const items = getItemsForList(list.id);
    const sortedItems = [...items].sort((a, b) => a.isTaken - b.isTaken);
    setGroceryItems(sortedItems);
  }, [list.id, groceryData]);

  const viewDetails = (item) => {
    console.log("fff")
    setCurrentItem(item)
    editModalRef.current?.open();
  }
  const closeModal = () => {
    editModalRef.current?.close();
    updateItemField(list.id,currentItem)
    setCurrentItem(null); 
  };
  const handleInputChange = (field, value) => {
    setCurrentItem((prevItem) => {
      if (!prevItem) return prevItem; // מונע שגיאות אם currentItem הוא null
      const updatedItem = { ...prevItem, [field]: value };
      return updatedItem; // מחזיר את הערך החדש לסטייט)
  })
    }

  return (
    <View style={styles.container}>
      <NormalHeader title={list.name} />
      <View>
        <ProgressBar totalItems={groceryItems.length} completedItems={groceryItems.filter(item => item.isTaken).length} />
      </View>

      <FlatList
        data={groceryItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.itemContainer, item.isTaken && styles.takenItem]} onPress={() => viewDetails(item)}>
            <Text style={styles.GroceryItemsubtitle}>{item.quantity}</Text>
            <View style={styles.ItemRightSide}>
              <Text style={[styles.itemTitle, item.isTaken && styles.takenItem]}>
                {item.name}
              </Text>
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

            </View>
          </TouchableOpacity>
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

      <BottomSheetModal modalRef={editModalRef} onClose={closeModal}>
      <View style={{ padding: 20 }}>
        <TextInput
          value={currentItem?.name}
          style={styles.input}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="הזן שם חדש"
        />

        <View style={styles.quantityContainer}>
         
          <TouchableOpacity
            onPress={() => updateQuantity('increment')}
            style={styles.iconButton}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity> 
          <TouchableOpacity
            onPress={() => updateQuantity('decrement')}
            style={styles.iconButton}
          >
            <Icon name="remove" size={24} color="white"  />
          </TouchableOpacity>
          <TextInput
          value={currentItem?.quantity}
          style={styles.input}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="הזן תיאור למוצר"
        />
        </View>
        <TextInput
          value={currentItem?.name}
          style={styles.input}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="הזן שם חדש"
        />
      </View>
    
    </BottomSheetModal>
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
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
  ItemRightSide: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
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
  inputWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection:"column-reverse"
  },
  input: {
    height: 40,
    fontSize: 16,
    textAlign: 'right', // הצבה בצד ימין
    
  },
  floatingLabel: {
    fontSize: 10,
    backgroundColor: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"flex-end",
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius:50,
    backgroundColor:"#007bff",
    margin:5
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 10,
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
    backgroundColor: "#f4f4f4",
    color: "#888",
  },
});

export default GroceryItemsScreen;
