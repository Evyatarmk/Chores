import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGrocery } from "./Context/GroceryContext";
import { Icon } from '@rneui/base';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NormalHeader from "./Components/NormalHeader"; // תלוי במיקום של תיקיית ה-Header
import ProgressBar from "./Components/ProgressBar";

const GroceryListsScreen = () => {
  const { groceryData, deleteList, updateListName } = useGrocery();
  const router = useRouter();
  const optionsModalRef = useRef(null);
  const inputRef = useRef(null);
  const editModalRef = useRef(null);
  const [currentList, setCurrentList] = useState(null);
  const [newName, setNewName] = useState("");



  const openOptionsPanel = (list) => {
    setCurrentList(list);
    optionsModalRef.current?.open();
  };

  const handleOptionSelect = (option) => {
    if (option === "edit") {
      setNewName(currentList.name);
      optionsModalRef.current?.close();
      setTimeout(() => {
        editModalRef.current?.open();
      }, 300);
    } else if (option === "delete") {
      handleDelete(currentList.id);
    }
  };

  const handleDelete = (listId) => {
    deleteList(listId);
    optionsModalRef.current?.close();
  };

  const handleSaveNewName = () => {
    if (newName.trim() && currentList) {
      updateListName(currentList.id, newName);
    }
    setTimeout(() => editModalRef.current?.close(), 200);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title="הרשימות שלי" />
      <FlatList
        data={groceryData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              router.push({
                pathname: "./GroceryItemsScreen",
                params: { list: JSON.stringify(item) },
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
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: "./AddGroceryListScreen" })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* מודל אפשרויות */}
      <Modalize ref={optionsModalRef} adjustToContentHeight handlePosition="inside">
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>אפשרויות</Text>
          <TouchableOpacity onPress={() => optionsModalRef.current?.close()} style={styles.closeButton}>
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

      {/* מודל עריכת שם */}
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
            value={newName}
            onChangeText={setNewName}
            placeholder="הזן שם חדש"
          />
          <View style={styles.editButtons}>
            <TouchableOpacity onPress={handleSaveNewName} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>שמור</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => editModalRef.current?.close()} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
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
    gap:5,
    justifyContent:"center"
  },
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
  editButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  saveButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 20, width: "50%", alignItems: "center" },
  saveButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { padding: 10, width: "50%", alignItems: "center", backgroundColor: "#ededed", borderRadius: 20 },
  cancelButtonText: { color: "#888" },
});

export default GroceryListsScreen;
