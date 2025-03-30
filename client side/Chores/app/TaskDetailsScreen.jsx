import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";

const TaskDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { taskId, date } = params;
  const { getTask } = useTasks();

  const [taskData, setTaskData] = useState(null);

  useEffect(() => {
    if (date && taskId) {
      console.log("Fetching task with date:", String(date), "and taskId:", taskId);
      const fetchedTask = getTask(date, taskId);
      console.log("Fetched task:", fetchedTask);
      
      // Ensure taskData is always an object and participants is an array
      setTaskData(fetchedTask);
    }
  }, [date, taskId, getTask]); // Added `getTask` as a dependency to ensure it updates correctly

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרטי המשימה</Text>
      </View>

      {/* Task Title */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>כותרת: {taskData?.title || "לא צוינה"}</Text>
      </View>

      {/* Task Description */}
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>תיאור: {taskData?.description || "אין תיאור"}</Text>
      </View>

      {/* Task Category */}
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>קטגוריה: {taskData?.category || "לא צוינה קטגוריה"}</Text>
      </View>

      {/* Task Date */}
      <View style={styles.detailsContainer}>
        <Text style={styles.date}>תאריך: {taskData?.date || "תאריך לא זמין"}</Text>
      </View>

     
      <View style={styles.detailsContainer}>
        <Text style={styles.participants}>
          משתתפים: {taskData?.participants && taskData?.participants.length > 0
            ? taskData?.participants.map(participant => participant.name).join(", ")
            : "אין משתתפים"}
        </Text>
      </View>

      {/* Task Max Participants */}
      <View style={styles.detailsContainer}>
        <Text style={styles.maxParticipants}>
          מגבלת משתתפים: {taskData?.maxParticipants > 0 ? taskData.maxParticipants : "לא קיימת מגבלה"}
        </Text>
      </View>

      {/* Edit Button */}
      <View style={styles.editButtonContainer}>
        <TouchableOpacity onPress={() => router.push("/edit-task")}>
          <Text style={styles.editButton}>ערוך משימה</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  category: {
    fontSize: 16,
    color: "#007bff",
  },
  date: {
    fontSize: 16,
    color: "#555",
  },
  participants: {
    fontSize: 16,
    color: "#555",
  },
  maxParticipants: {
    fontSize: 16,
    color: "#555",
  },
  editButtonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  editButton: {
    fontSize: 18,
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default TaskDetailsScreen;
