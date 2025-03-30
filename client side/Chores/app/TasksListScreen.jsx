import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import NormalHeader from "./Components/NormalHeader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import PageWithMenu from "./Components/PageWithMenu";

const TasksListScreen = () => {
  const { tasks, removeTaskForDate, getTasksForDate } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const router = useRouter();

  // תאריכים מסומנים ביומן
  const markedDates = Object.keys(tasks).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: "blue" };
    return acc;
  }, {});
  markedDates[selectedDate] = { selected: true, selectedColor: "#1E90FF" };

  return (
    <PageWithMenu>
      <GestureHandlerRootView style={styles.container}>
        <NormalHeader title="המשימות שלי" />

        {/* יומן להצגת התאריכים */}
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            selectedDayBackgroundColor: "#1E90FF",
            todayTextColor: "#1E90FF",
            arrowColor: "#1E90FF",
          }}
        />

        {/* רשימת משימות לתאריך שנבחר */}
        <FlatList
          data={getTasksForDate(selectedDate)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() =>
                router.push({
                  pathname: "./TaskDetailsScreen",
                  params: { taskId: JSON.stringify(item.id),date: JSON.stringify(selectedDate)},
                })
              }
            >
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => openOptionsPanel(item)}
              >
                <Icon name="more-vert" size={24} color="#888" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>אין משימות ליום זה</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "./AddTaskScreen",
              params: { day: selectedDate },
            })
          }
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
      </GestureHandlerRootView>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  taskItem: {
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
  taskTitle: {
    textAlign: "right", fontSize: 20, fontWeight: "bold", color: "#333", paddingBottom: 10 
  },
  optionsButton: { position: "absolute", top: 12, left: 2, padding: 8, borderRadius: 25, zIndex: 1000 },
  taskDescription: { textAlign: "right",fontSize: 14, color: "#888", },
  button: {
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
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
