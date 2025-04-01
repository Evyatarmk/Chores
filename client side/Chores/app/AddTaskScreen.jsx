import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";

import { v4 as uuidv4 } from "uuid";  // Ensure you import uuid for generating unique IDs
import DateRangePicker from "./Components/DateRangePicker";
import ItemSelector from "./Components/ItemSelector";

const AddTaskScreen = () => {
  const [taskData, setTaskData] = useState({
    id: uuidv4(),
    title: "",
    description: "",
    homeId: "",
    category: "משימה", // Default to "Task"
    participants: [], // Default to empty array
    maxParticipants: 1, // Default max participants
    date: "", // Default date (will be set later)
  });
  const inputRef = useRef(null);
  const router = useRouter();
  const { addTaskForDate } = useTasks();
  const { day } = useLocalSearchParams(); // Get the selected date from params
  const { user } = useUserAndHome();
  const [showDatePicker, setShowDatePicker] = useState(false); // Function to toggle date picker
  const [selectedRange, setSelectedRange] = useState({ start: day, end: null });
  // Update homeId when user changes
  useEffect(() => {
    setTaskData((prevState) => ({
      ...prevState,
      homeId: user.homeId,
      date: day || "", // Initialize with the selected date
    }));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user, day]);

  const categories = ["משימה", "אירוע"]; // Available categories

  const handleAddTask = () => {
    if (!taskData.title) {
      alert("Please enter a title for the task.");
      return;
    }

    const newItem = { ...taskData, id: uuidv4() }; // Copy taskData and generate a new ID
    
    // Add task for the selected date
    addTaskForDate(taskData.date, newItem);

    // Navigate back after adding the task
    router.back();
  };

  const handleClear = () => {
    setTaskData({
      id: uuidv4(),
      title: "",
      description: "",
      homeId: user.homeId,
      category: "משימה",
      participants: [],
      maxParticipants: 0,
      startDate: day || "", // reset to the original date
      endDate: day || "",
    });
    router.back();
  };

  const handleCategorySelect = (category) => {
    setTaskData((prevState) => ({
      ...prevState,
      category, // Update the category in the state
    }));
  };

  const handleDateSelect = (date) => {
    setTaskData((prevState) => ({
      ...prevState,
      date: date, // Update the selected date
    }));
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
            value={taskData.title}
            onChangeText={(text) => setTaskData({ ...taskData, title: text })}
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
            autoFocus
          />
          {taskData.title.length > 0 ? (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Task Description */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="הוסף תיאור"
            value={taskData.description}
            onChangeText={(text) => setTaskData({ ...taskData, description: text })}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
        <TextInput
        style={styles.input}
         placeholder="מספר מקסימלי של משתתפים"
         value={taskData.maxParticipants === 0 || taskData.maxParticipants === '' ? '' : taskData.maxParticipants.toString()}
         onChangeText={(text) => {
           // Check if the input is empty or a valid number
          const numericValue = parseInt(text, 10);
            if (text === '' || !isNaN(numericValue)) {
          setTaskData({ ...taskData, maxParticipants: text === '' ? '' : numericValue });
          }
          }}
        keyboardType="numeric"
           multiline={false}
         />
          </View>


        <View style={styles.column}>
          {/* Category Selector */}
          <ItemSelector
            items={categories}
            onSelect={handleCategorySelect}
            defaultSelected={taskData.category}
            firstItem="משימה"
          />

          {/* Date Picker */}
          <DateRangePicker
        onRangeSelect={(range) => setSelectedRange(range)}
        selectedRange={selectedRange}
        showModal={showDatePicker}
        setShowModal={setShowDatePicker}
      />
          <DatePicker
            onDateSelect={handleDateSelect}
            showModal={showDatePicker}
            setShowModal={setShowDatePicker}
            date={taskData.date}
            minDate={null}
          />
        </View>

        {/* Buttons */}
        <View style={styles.editButtons}>
          <TouchableOpacity onPress={handleAddTask} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>הוסף משימה</Text>
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
    justifyContent: "flex-start",
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
  column: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: "100%",
    gap: 10,
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
  editButtons: {
    flexDirection: "row",
    width: "100%",
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
});

export default AddTaskScreen;
