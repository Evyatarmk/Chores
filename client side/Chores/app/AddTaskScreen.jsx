import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";

import { v4 as uuidv4 } from "uuid";  // Ensure you import uuid for generating unique IDs

const AddTaskScreen = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const inputRef = useRef(null);
    const router = useRouter();
    const { addTaskForDate } = useTasks();
    const { day } = useLocalSearchParams(); // Get the selected date from params
    const { user } = useUserAndHome();
  
    console.log("Selected Date:", day); // Debugging log
  
    // Initialize task item
    const [currentItem, setCurrentItem] = useState({
      id: uuidv4(), // Generate a unique ID
      title: "",
      description: "",
      homeId:""
    });
  
    useEffect(() => {
      setTimeout(() => inputRef.current?.focus(), 100);
    }, []);
  
    const handleAddTask = () => {
      if (!title) {
        alert("Please enter a title for the task.");
        return;
      }
    
      const newItem = { id: uuidv4(), title, description, homeId:user.homeId };
      console.log("New Task to Add:", newItem); // Log here
      
      // Add task for the selected date
      addTaskForDate(day, newItem);
    
      // Navigate back after adding the task
      router.back();
    };
  
    const handleClear = () => {
      setTitle("");
      setDescription("");
      router.back();
    };
  
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>הוסף משימה</Text>
          </View>
  
          {/* Task Title */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="כותרת המשימה"
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
              autoFocus
            />
            {title.length > 0? (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            ):null}
          </View>
  
          {/* Task Description */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="הוסף תיאור"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
  
          {/* Selected Date */}
          <Text style={styles.selectedDateText}>
            תאריך נבחר: {day || "לא נבחר תאריך"}
          </Text>
  
          {/* Buttons */}
          <View style={styles.editButtons}>
            <TouchableOpacity onPress={handleAddTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>הוסף משימה</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "flex-start",  // Change from center to flex-start
    alignItems: "center",
    padding: 20,
    paddingBottom: 80, // Add padding for the button to be above the keyboard
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
    marginBottom: 15,
  },
  clearButton: {
    position: "absolute",
    top: "50%",
    left: 15,
    transform: [{ translateY: -12 }],
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
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    color: "white",
  },
});

export default AddTaskScreen;
