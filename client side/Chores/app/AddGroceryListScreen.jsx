import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Keyboard, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ItemSelector from "./Components/ItemSelector";
import DatePicker from "./Components/DatePicker";
import { useCategories } from "./Context/CategoryContext";
import { useGrocery } from "./Context/GroceryContext";
import SelectableDropdown from "./Components/SelectableDropdown";

const AddGroceryListScreen = () => {
  const [listName, setListName] = useState("");
  const [category, setCategory] = useState("ללא קטגוריה");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false); // כאן מוגדרת הפונקציה

  const suggestions = [
    "קניות ל",
    "מצרכים למתכון",
    "מצרכים ל",
    "טיול ל",
    "מסיבה",
    "אירוע משפחתי",
    "הכנות לחג",
    "רשימת משימות",
    "סידורים לשבוע",
    "רשימת קניות דחופה",
    "רשימה כללית"
  ]; 
  const inputRef = useRef(null);
  const router = useRouter();
  const { categories } = useCategories();
  const { addNewList } = useGrocery();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSave = () => {
    if (listName.trim() === "") return; // אם השם ריק, אל תאפשר יצירה

    const newList = {
      id: Date.now().toString(),
      name: listName,
      date: date,
      homeId: "home-123",
      category: category,
      items: [],
    };

    addNewList(newList);
    router.back();
  };
  const handleClear = () => setListName("");

  // פונקציה שתעביר את התאריך שנבחר לקומפוננטה הראשית
  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate)
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
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
        {listName.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* הצעות לשמות */}
      <Text style={styles.suggestionsTitle}>הצעות לשם</Text>
      <ItemSelector items={suggestions} onSelect={setListName} />



      <View style={styles.row}>
        <SelectableDropdown
          label="קטגוריה"
          options={categories}
          selectedValue={category}
          onSelect={setCategory}
          allowAdding={true}
          defaultSelected="ללא קטגוריה"
          firstItem="ללא קטגוריה"
        />
        {/* הצגת יומן לבחירת תאריך אם נבחר להציג */}
        <DatePicker onDateSelect={setDate} showModal={showDatePicker} setShowModal={setShowDatePicker} selectedDate={date} />
      </View>


      {/* כפתור יצירת הרשימה */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>צור</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20,
    backgroundColor: "#f4f4f4"
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
  row: {
    flexDirection: "row",
    alignItems: "center",// מגדיר את המיקום של הרכיבים אחד ליד השני
    justifyContent: "flex-end", // מוודא שהרכיבים יתפשטו באופן אחיד
    width: "100%", // יבטיח שהרכיבים יתפשטו לאורך כל הרוחב
    marginTop: 15, // מרווח מהשדות הקודמים
    gap: 10
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
  dateButtonContainer: {
    flexDirection: "row", // שורה
    justifyContent: "flex-end", // מיישר את האלמנטים בצד ימין
    width: "100%", // זה גורם לכך שהכפתור יישאר בצד הימני של המסך
    marginTop: 10, // מרחק מהחלק העליון של המסך
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 20,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 12,
    color: "white",
    marginLeft: 5,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
  },
});

export default AddGroceryListScreen;
