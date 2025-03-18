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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AlertModal from "./Components/AlertModal";
import OptionsModal from "./Components/OptionsModal";

const GroceryItemsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listId = JSON.parse(params.listId);
  const editModalRef = useRef(null);
  const [currentItem, setCurrentItem] = useState(null);
  const { getList, updateItemStatus, groceryData, updateItemField ,deleteItem,clearCheckedItems,uncheckAllItems} = useGrocery();
  const [groceryItems, setGroceryItems] = useState([]);
  const [list, setList] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClearCheckedItemsVisible, setModalClearCheckedItemsVisible] = useState(false);
  const optionsModalRef = useRef(null);
  
  useEffect(() => {
    const list = getList(listId);
    setList(list)
    const sortedItems = [...list.items].sort((a, b) => a.isTaken - b.isTaken);
    setGroceryItems(sortedItems);
  }, [listId, groceryData]);

  const options = [
    { icon: "refresh", text: "ביטול סימון הכל", action: "uncheckAllItems", iconColor: "#ff8800" },
    { icon: "delete", text: "מחיקת פריטים שנעשו", action: "delete", iconColor: "#ff4444" },
  ];
  const handleOptionSelect = (option) => {
    if (option === "uncheckAllItems") {
      uncheckAllItems(listId)
      optionsModalRef.current?.close();
    } if (option === "delete") {
      setModalClearCheckedItemsVisible(true)
    }
  };

  const viewDetails = (item) => {
    setCurrentItem(item)
    editModalRef.current?.open();
  }
  const closeModal = () => {
    editModalRef.current?.close();
    updateItemField(list.id, currentItem)
    setCurrentItem(null);
  };
  const handleDelete = () => {
    editModalRef.current?.close();
    deleteItem(listId,currentItem?.id);
    setCurrentItem(null);
  };
  const handleClearCheckedItems = () => {
    optionsModalRef.current?.close();
    clearCheckedItems(listId);
  };
  
  const handleDeletePress = () => {
    setModalVisible(true)
  };
  const updateQuantity = (action) => {
    setCurrentItem((prevItem) => {
      if (!prevItem) return prevItem;

      const currentQuantity = Number(prevItem.quantity) || 0; // מוודא שהכמות היא מספר

      if (action === "increment") {
        return { ...prevItem, quantity: currentQuantity + 1 };
      } else {
        return { ...prevItem, quantity: Math.max(currentQuantity - 1, 0) }; // מונע מספר שלילי
      }
    });
  };
 
  const handleInputChange = (field, value) => {
    setCurrentItem((prevItem) => {
      if (!prevItem) return prevItem;

      let updatedValue = value;

      if (field === "quantity") {
        updatedValue = Number(value); // הופך את הערך למספר
        if (isNaN(updatedValue) || updatedValue < 0) updatedValue = 0; // מונע ערכים לא תקינים
      }

      return { ...prevItem, [field]: updatedValue };
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title={list?.name} onOptionPress={()=>{optionsModalRef.current?.open()}}/>
      <View style={styles.ProgressBar}>
        <ProgressBar totalItems={groceryItems.length} completedItems={groceryItems.filter(item => item.isTaken).length} />
      </View>
{/* מודל אפשרויות */}
<OptionsModal
        optionsModalRef={optionsModalRef}
        handleOptionSelect={handleOptionSelect}
        options={options}
      />
      <FlatList
        data={groceryItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.itemContainer, item.isTaken && styles.takenItem]} onPress={() => viewDetails(item)}>
              <Text style={styles.GroceryItemsubtitle}>{item.quantity}</Text>
              <View style={styles.ItemDetails}>
                <Text style={[styles.itemTitle, item.isTaken && styles.takenItem]}>
                  {item.name}
                </Text> 
                {item.description ? (
              <Text style={styles.itemDescription}>{item.description}</Text>
            ):null}  
            </View>
            <TouchableOpacity
                  onPress={() => updateItemStatus(list.id, item.id,item.isTaken)}
                  style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkboxCircle,
                      item.isTaken && styles.checked,
                    ]}>
                    {item.isTaken && <Icon name="check" size={18} color="white" />}
                  </View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#ccc" />
            {<Text style={styles.emptyText}>אין פריטים להצגה</Text>}       
           </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }} // הקטנת ה-padding top
      />

      <TouchableOpacity style={styles.addButton} 
      onPress={() =>
        router.push({
          pathname: "./AddGroceryItemScreen",
          params: { listId: JSON.stringify(list.id)},
        })
      }
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      <BottomSheetModal title="עריכת פריט" modalRef={editModalRef} onClose={closeModal}>
        <View style={{ padding: 10 }}>
          <TextInput
            value={currentItem?.name}
            style={styles.input}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="הזן שם"
          />
          <TextInput
            value={currentItem?.description}
            style={styles.input}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="להוסיף הערה"
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
              <Icon name="remove" size={24} color="white" />
            </TouchableOpacity>
            <TextInput
              value={currentItem?.quantity?.toString() || ""}
              style={styles.inputQuantity}
              onChangeText={(text) => handleInputChange('quantity', text)}
              placeholder="כמות"
              keyboardType="numeric"
            />
          </View>
           <TouchableOpacity onPress={handleDeletePress} style={styles.panelOption}>
                      <Icon name="delete" size={20} color="#ff4444" style={styles.optionIcon} />
                      <Text style={styles.panelOptionText}>מחיקה</Text>
           </TouchableOpacity>
        </View>

      </BottomSheetModal>
      <AlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message="האם אתה בטוח שברצונך למחוק פריט זה?"
        onConfirm={handleDelete}
        confirmText="מחק"
        cancelText="ביטול"
      />
       <AlertModal
        visible={modalClearCheckedItemsVisible}
        onClose={() => setModalClearCheckedItemsVisible(false)}
        message="האם אתה בטוח שברצונך למחוק פריטים אלו?"
        onConfirm={handleClearCheckedItems}
        confirmText="מחק"
        cancelText="ביטול"
      />
    </GestureHandlerRootView>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  itemTitle: {  textAlign: "right",fontSize: 18, fontWeight: "bold"},
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#ffffff",
    marginBottom: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconButton: {
    backgroundColor: "#007bff", // צבע כחול יפה
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  input: {
    height: 50,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#ededed",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd", // מסגרת עדינה
    paddingHorizontal: 10,
    marginBottom:5,
  },
  inputQuantity:{
    flex:1,
    height: 50,
    textAlign:"right" , 
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#ededed",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  ProgressBar: {
    height: 8
  },
 
  itemDescription: {
    textAlign: "right",
    fontSize: 12,
    color: "#666"
  },
  ItemDetails: { flexDirection: "column", alignItems: "flex-end",flex:1 },
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


  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#007bff",
    margin: 5
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
  panelOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
  },
  panelOptionText: { fontSize: 16, color: "#333" },

});

export default GroceryItemsScreen;
