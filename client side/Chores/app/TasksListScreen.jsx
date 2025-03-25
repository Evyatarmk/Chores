import React, { useState } from "react";
import { View, Text, StyleSheet,Button,TouchableOpacity, FlatList} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import NormalHeader from "./Components/NormalHeader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Agenda } from "react-native-calendars";
import PageWithMenu from "./Components/PageWithMenu";

const TasksListScreen = () => {
  const { tasks, editTask, removeTaskForDate, getTasksForDate } = useTasks();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const router = useRouter();

  // Handle date press
  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
  };

  // Prepare marked dates
  const markedDates = Object.keys(tasks).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: "blue" };
    return acc;
  }, {});

  // Ensure selected date is highlighted
  markedDates[selectedDate] = { selected: true, selectedColor: "#007bff" };

  return (
    <PageWithMenu>
    <GestureHandlerRootView style={styles.container}>
      <NormalHeader title="המשימות שלי" />

      <Agenda
         items={{
          [selectedDate]: getTasksForDate(selectedDate),
        }}
        onDayPress={handleDatePress}
        markedDates={markedDates}
        selected={selectedDate}
        renderItem={( item ) => ( 
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item?.title}</Text>
            <Text style={styles.taskDescription}>{item?.description}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => console.log(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.removeButton]}
                onPress ={() => removeTaskForDate(selectedDate,item.id)} 
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        theme={{
          selectedDayBackgroundColor: "#1E90FF",
          todayTextColor: "#1E90FF",
          agendaTodayColor: "#1E90FF",
        }}
        renderEmptyData={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this day</Text>
          </View>
        )}
      />

  

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (selectedDate) {
            router.push({
              pathname: "./AddTaskScreen",
              params: { day: selectedDate },
            });
          }
        }}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </GestureHandlerRootView>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: "#FFFFFF",
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  removeButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
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
});

export default TasksListScreen;
