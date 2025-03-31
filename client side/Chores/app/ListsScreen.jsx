import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useLists } from "./Context/ListsContext";
import { Icon } from '@rneui/base';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import NormalHeader from "./Components/NormalHeader"; // תלוי במיקום של תיקיית ה-Header
import ProgressBar from "./Components/ProgressBar";
import OptionsModal from "./Components/OptionsModal";
import AlertModal from "./Components/AlertModal";
import ItemSelector from "./Components/ItemSelector";
import { useCategories } from "./Context/CategoryContext";
import DatePicker from "./Components/DatePicker";
import SelectableDropdown from "./Components/SelectableDropdown";
import PageWithMenu from "./Components/PageWithMenu";

const ListsScreen = () => {
  const { listsData, fetchListsData, deleteList, updateList, copyAllItems, copyUnpurchasedItems, copyPurchasedItems } = useLists();
  const router = useRouter();
  const optionsModalRef = useRef(null);
  const optionsCopyModalRef = useRef(null);
  const inputRef = useRef(null);
  const editModalRef = useRef(null);
  const [currentList, setCurrentList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [listsDataToShow, setListsDataToShow] = useState(null);
  const { categories, addCategory } = useCategories();
  const [showDatePicker, setShowDatePicker] = useState(false); // כאן מוגדרת הפונקציה
  
  useEffect(() => {
    setListsDataToShow(listsData)
  }, [])

  useEffect(() => {
    if (selectedCategory === "הכל") {
      setListsDataToShow(listsData);
    } else {
      setListsDataToShow(
        listsData.filter((item) => item.category === selectedCategory)
      );
    }
  }, [selectedCategory, listsData]);

  const options = [
    { icon: "edit", text: "ערוך", action: "edit" },
    { icon: "content-copy", text: "העתק", action: "copy", iconColor: "#007bff" },
    { icon: "delete", text: "מחיקה", action: "delete", iconColor: "#ff4444" },
    // אפשר להוסיף עוד אפשרויות עם אייקונים אחרים
  ];
  const optionsCopy = [
    { icon: "view-list", text: "כל הפריטים", action: "allItems" },
    { icon: "check-circle", text: "פרטים שנרכשו", action: "purchasedItems", iconColor: "#28a745" },
    { icon: "cancel", text: "פריטים שלא נרכשו", action: "unpurchasedItems", iconColor: "#dc3545" },
  ];
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListsData();
    setRefreshing(false);
  };
  const handleAddingCategory = (newCategory) => {
    addCategory(newCategory)
  }

  const openOptionsPanel = (list) => {
    setCurrentList(list);
    optionsModalRef.current?.open();
  };

  const handleOptionSelect = (option) => {
    if (option === "edit") {
      optionsModalRef.current?.close();
      setTimeout(() => {
        editModalRef.current?.open();
      }, 300);
    } if (option === "delete") {
      handleDeletePress()
    }
    else if (option === "copy") {
      optionsCopyModalRef.current?.open();
      optionsModalRef.current?.close();
    }
  };
  const handleOptionCopySelect = (option) => {
    if (option === "allItems") {
      copyAllItems(currentList.id);
    } else if (option === "purchasedItems") {
      copyPurchasedItems(currentList.id);
    } else if (option === "unpurchasedItems") {
      copyUnpurchasedItems(currentList.id);
    }

    optionsCopyModalRef.current?.close();
  };
  
  const handleDelete = (listId) => {
    deleteList(listId);
    optionsModalRef.current?.close();
  };
  const handleDeletePress = () => {
    setModalVisible(true)
  };
  const handleSave = () => {
    if (currentList.name.trim() && currentList) {
      updateList(currentList.id, currentList);
    }
    setTimeout(() => editModalRef.current?.close(), 200);
  };
  const handleCategorySelect = (category) => {
    setCurrentList((prev) => prev ? { ...prev, category } : prev);
  };
  
  const handleDateSelect = (date) => {
    setCurrentList((prev) => prev ? { ...prev, date } : prev);
  };
  
  const handleNameChange = (name) => {
    setCurrentList((prev) => prev ? { ...prev, name } : prev);
  };
  return (
   <PageWithMenu>
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title="הרשימות שלי" />
      
      <ItemSelector
        items={categories}
        onSelect={setSelectedCategory}
        defaultSelected="הכל"
        firstItem="הכל"
      />
      <FlatList
        data={listsDataToShow}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              router.push({
                pathname: "./ListItemsScreen",
                params: { listId: JSON.stringify(item.id) },
              })
            }
          >
            <Text style={styles.listTitle}>{item.name}</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                totalItems={item.items.length}
                completedItems={item.items.filter((i) => i.isTaken).length}
              />
              <Text style={styles.itemSubtitle}>
                {item.items.filter((i) => i.isTaken).length}/{item.items.length}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => openOptionsPanel(item)}
            >
              <Icon name="more-vert" size={24} color="#888" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#ccc" />
            {<Text style={styles.emptyText}>אין פריטים להצגה</Text>}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9Bd35A', '#689F38']} />
        }
      />
      {/* מודל אפשרויות */}
      <OptionsModal
        optionsModalRef={optionsModalRef}
        handleOptionSelect={handleOptionSelect}
        options={options}
      />
      {/* מודל אפשרויות העתקה */}
      <OptionsModal
        optionsModalRef={optionsCopyModalRef}
        handleOptionSelect={handleOptionCopySelect}
        options={optionsCopy}
      />

      {/*מודל עריכת  */}
      <Modalize
        ref={editModalRef}
        adjustToContentHeight
        handlePosition="inside"
        onOpen={() => {
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>עריכת שם הרשימה</Text>
          <TouchableOpacity onPress={() => editModalRef.current?.close()} style={styles.closeButton}>
            <Icon name="close" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.editPanelContent}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={currentList?.name}
            onChangeText={handleNameChange }
            placeholder="הזן שם חדש"
          />
          <View style={styles.row}>
                  <SelectableDropdown
                    label="קטגוריה"
                    options={categories}
                    selectedValue={currentList?.category}
                    onSelect={handleCategorySelect}
                    onAdding={handleAddingCategory}
                    allowAdding={true}
                    firstItem="ללא קטגוריה"
                  />
                  {/* הצגת יומן לבחירת תאריך אם נבחר להציג */}
                  <DatePicker onDateSelect={handleDateSelect} showModal={showDatePicker} setShowModal={setShowDatePicker} selectedDate={currentList?.date} TodayMinDate={true} />
                </View>
       
          <View style={styles.editButtons}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>שמור</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => editModalRef.current?.close()} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
      <AlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        message="האם אתה בטוח שברצונך למחוק פריט זה?"
        onConfirm={() => { handleDelete(currentList.id); }}
        confirmText="מחק"
        cancelText="ביטול"
      />
    </GestureHandlerRootView>
    <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "./AddListScreen" })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0e5ec"},
  listItem: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    margin: 3
  },
  listTitle: { textAlign: "right", fontSize: 20, fontWeight: "bold", color: "#333", paddingBottom: 10 },
  itemSubtitle: { fontSize: 14, color: "#888", },
  progressBarContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    justifyContent: "center"
  },
  optionsButton: { position: "absolute", top: 12, left: 2, padding: 8, borderRadius: 25, zIndex: 1000 },
  addButton: {
    position: "absolute",
    bottom: 0,
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
  row: {
    flexDirection: "row",
    alignItems: "center",// מגדיר את המיקום של הרכיבים אחד ליד השני
    justifyContent: "flex-end", // מוודא שהרכיבים יתפשטו באופן אחיד
    width: "100%", // יבטיח שהרכיבים יתפשטו לאורך כל הרוחב
    gap: 10
  },
  panelHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  panelTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { padding: 5, backgroundColor: "#ededed", borderRadius: 20 },
  panelContent: { padding: 20 },
  panelOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionIcon: { marginRight: 10 },
  panelOptionText: { fontSize: 16, color: "#333" },
  editPanelContent: { padding: 20 },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
    fontSize: 16,
    textAlign: "right",
  },
  editButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10,padding:10 },
  saveButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 20, width: "50%", alignItems: "center" },
  saveButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { padding: 10, width: "50%", alignItems: "center", backgroundColor: "#ededed", borderRadius: 20 },
  cancelButtonText: { color: "#888" },
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
});

export default ListsScreen;
