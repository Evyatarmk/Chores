import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTasks } from "./Context/TaskContext"; 
import { Calendar } from "react-native-calendars";
import NormalHeader from "./Components/NormalHeader"; 

const TasksListScreen = () => {
  const { tasks, getTasksForDate } = useTasks();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Convert tasks into `markedDates` format
  const markedDates = tasks.reduce((acc, task) => {
    acc[task.date] = { marked: true, dotColor: "red" }; // Mark the date with a dot
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, selectedColor: "#007bff" };
  }

  return (
    <View style={styles.container}>
      <NormalHeader title="המשימות שלי" />
      <Calendar 
        onDayPress={handleDatePress}
        markedDates={markedDates}
      />
      
      <Text style={styles.taskTitle}>
        Tasks for {selectedDate || "Select a Date"}
      </Text>

      <FlatList
        data={getTasksForDate(selectedDate)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f4f4" },
  taskTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  taskItem: { padding: 10, backgroundColor: "white", borderRadius: 5, marginVertical: 5 },
  taskText: { fontSize: 16 },
});

export default TasksListScreen;
