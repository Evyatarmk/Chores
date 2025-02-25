import React, { useRef, useState } from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGrocery } from "./Context/GroceryContext";
import { Icon } from '@rneui/base';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';  // ייבוא של GestureHandlerRootView

const GroceryListsScreen = () => {
  const { groceryData } = useGrocery();
  const router = useRouter();
  const modalizeRef = useRef(null);
  const [currentList, setCurrentList] = useState(null);

  const openPanel = (listId) => {
    setCurrentList(listId);
    modalizeRef.current?.open();
  };

  const handleOptionSelect = (option) => {
    if (option === "edit") {
      console.log("עריכה של רשימה", currentList);
    } else if (option === "delete") {
      console.log("מחיקה של רשימה", currentList);
    }
    modalizeRef.current?.close();
  };

  return (
    <GestureHandlerRootView style={styles.container}> {/* הוספת GestureHandlerRootView */}
      <FlatList
        data={groceryData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <TouchableOpacity onPress={() => router.push({ pathname: "./GroceryItemsScreen", params: { listId: JSON.stringify(item.id) } })} style={styles.innerItem}>
              <Text style={styles.listTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>
                {item.items.filter(i => i.isTaken).length}/{item.items.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionsButton} onPress={() => openPanel(item.id)}>
              <Icon name="more-vert" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "./AddGroceryListScreen" })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* מודל עם החלקה מלמטה */}
      <Modalize ref={modalizeRef} adjustToContentHeight handlePosition="inside">
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>אפשרויות</Text>
          <TouchableOpacity onPress={() => modalizeRef.current?.close()} style={styles.closeButton}>
            <Icon name="close" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.panelContent}>
          <TouchableOpacity onPress={() => handleOptionSelect("edit")} style={styles.panelOption}>
            <Icon name="edit" size={20} style={styles.optionIcon} />
            <Text style={styles.panelOptionText}>שנה שם</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleOptionSelect("delete")} style={styles.panelOption}>
            <Icon name="delete" size={20} color="#ff4444" style={styles.optionIcon} />
            <Text style={styles.panelOptionText}>מחיקה</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f4f4f4" },
  listItem: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  listTitle: { direction: "rtl", fontSize: 20, fontWeight: "bold", color: "#333", paddingBottom: 10 },
  itemSubtitle: { fontSize: 14, color: "#888", marginTop: 4 },
  optionsButton: { position: "absolute", top: 12, left: 2, padding: 8, borderRadius: 25, zIndex: 1000 },
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
  panelContent: {
    padding: 20,
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
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
    backgroundColor: "#ededed",
    borderRadius: "50%",
  },
  panelOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionIcon: {
    marginRight: 10,
  },
  panelOptionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default GroceryListsScreen;
