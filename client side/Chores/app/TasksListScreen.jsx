import React, { useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import { Calendar } from "react-native-calendars";
import NormalHeader from "./Components/NormalHeader";
import BottomSheetModal from "./Components/BottomSheetModal";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TasksListScreen = () => {
  const { tasks, getTasksForDate, editTask, removeTaskForDate, addTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(null);
  const modalRef = useRef(null);

  // Correct initialization for currentItem
  const [currentItem, setCurrentItem] = useState({id:"",title:"",date: "", description: "", completed: false });

  // Open and close modal functions
  const openModal = () => modalRef.current?.open();
  const closeModal = () => modalRef.current?.close();

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Marking selected dates for the calendar
  const markedDates = tasks.reduce((acc, task) => {
    acc[task.date] = { marked: true, dotColor: "red" };
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, selectedColor: "#007bff" };
  }

  // Handle adding a new task
  const handleAddTask = () => {
    if (currentItem.name &&  selectedDate) {
      addTask({
        id: uuidv4(), // Generate a unique ID
        title: currentItem.name,
        date: selectedDate, // Use selectedDate directly
        description:currentItem.description,
        completed: currentItem.completed,
      });
      closeModal(); // Close modal after task is added
    } else {
      alert("Please fill out both name and description.");
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title="המשימות שלי" />
      <Calendar onDayPress={handleDatePress} markedDates={markedDates} />

      <Text style={styles.taskTitle}>
        Tasks for {selectedDate || "Select a Date"}
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      <FlatList
        data={getTasksForDate(selectedDate) || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.title}</Text>
            <Text style={styles.taskText}>{item.description}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Edit" onPress={() => editTask(item.id, { title: "Updated Task" })} />
              <Button title="Remove" color="red" onPress={() => removeTaskForDate(item.id)} />
            </View>
          </View>
        )}
      />

      {/* Bottom Sheet Modal */}
      <BottomSheetModal modalRef={modalRef} onClose={closeModal} title="Add Task">
        <TextInput
          style={styles.input}
          placeholder="Task Name"
          value={currentItem.name}
          onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Add a note"
          value={currentItem.description}
          onChangeText={(text) => setCurrentItem({ ...currentItem, description: text })}
        />
     
       <View style={styles.editButtons}> 
                  <TouchableOpacity onPress={handleAddTask} style={styles.addTaskButton}>
                    <Text style={styles.addTaskButtonText}>הוסף משימה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>ביטול</Text>
                  </TouchableOpacity>
                </View>
      </BottomSheetModal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f4f4" },
  taskTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  taskItem: { padding: 10, backgroundColor: "white", borderRadius: 5, marginVertical: 5 },
  taskText: { fontSize: 16 },
  buttonContainer: { flexDirection: "row", marginTop: 5, gap: 10 },
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
    padding: 10, // Adds internal space within the button
  },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5, backgroundColor: "white" },
      
  editButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  addTaskButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 20, width: "50%", alignItems: "center" },
  addTaskButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { padding: 10, width: "50%", alignItems: "center", backgroundColor: "#ededed", borderRadius: 20 },
  cancelButtonText: { color: "#888" },
});

export default TasksListScreen;
