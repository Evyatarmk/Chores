import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Keyboard, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGrocery } from "./Context/GroceryContext";

const AddGroceryListScreen = () => {
  const [listName, setListName] = useState("");
  const [suggestions] = useState(["shopping", "מצרכים", "Supermarket", "Groceries", "ירקות", "Fruit"]);
  const inputRef = useRef(null);
  const router = useRouter();
  const { addNewList } = useGrocery();

  
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSave = () => {
    if (listName.trim() === "") return;
    addNewList(listName);
    Keyboard.dismiss();
    router.back();
  };

  const handleClear = () => {
    setListName(""); // מנקה את ערך שדה הקלט
  };
  const getFormattedDate = () => {
    const timestamp = new Date();
    const formattedDate = timestamp.getFullYear() + '-' + 
                          (timestamp.getMonth() + 1).toString().padStart(2, '0') + '-' +
                          timestamp.getDate().toString().padStart(2, '0');
    return formattedDate;
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always" 
      >
        {/* כותרת המסך */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>רשימה חדשה</Text>
        </View>

        {/* שדה הקלט */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="שם הרשימה החדשה"
            value={listName}
            onChangeText={setListName}
            returnKeyType="done"
            onSubmitEditing={handleSave}
            autoFocus
          />
          {/* כפתור איקס למחיקת הטקסט */}
          {listName.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* הצעות לשמות */}
        <Text style={styles.suggestionsTitle}>הצעות</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => setListName(suggestion)}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* כפתור יצירת הרשימה */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>צור</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",  // שינוי מ-center ל-flex-start
    alignItems: "center",
    padding: 20,
    paddingBottom: 80, // להוסיף מרווח כדי שהכפתור יהיה מעל המקלדת
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    padding: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    textAlign: "right",
  },
  clearButton: {
    position: "absolute",
    top: "50%",
    left: 15,
    transform: [{ translateY: -12 }],
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    alignSelf: "flex-end",
  },
  suggestionsContainer: {
    marginTop: 10,
    paddingRight: 20,
  },
  suggestionItem: {
    height: 35,
    backgroundColor: "#ededed",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  suggestionText: {
    color: "#888",
    fontSize: 12,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",

  },
});

export default AddGroceryListScreen;
