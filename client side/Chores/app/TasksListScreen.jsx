import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import { Calendar } from "react-native-calendars";
import NormalHeader from "./Components/NormalHeader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

const TasksListScreen = () => {
  const { tasks, getTasksForDate, editTask, removeTaskForDate, addTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(null);
  const router = useRouter();

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


  return (
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title="המשימות שלי" />
      <Calendar onDayPress={handleDatePress} markedDates={markedDates} />

      <Text style={styles.taskTitle}>
        Tasks for {selectedDate || "Select a Date"}
      </Text>

      <TouchableOpacity style={styles.addButton}  onPress={() => router.push({ pathname: "./AddTaskScreen" ,  params: { day: selectedDate} })}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      <FlatList
        data={getTasksForDate(selectedDate) || []}  // Ensured data is passed correctly
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
