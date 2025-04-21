import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { taskId, date } = params;
  const { getTasksForDate } = useTasks();

  const [taskData, setTaskData] = useState(null);
  const handleEdit = () => {
    router.push({
      pathname: "./TaskEditScreen",
      params: { taskId, date }    })
  };

  useEffect(() => {
    if (date && taskId) {
      console.log("Fetching task with date:", String(date), "and taskId:", taskId);
      
      const tasksForDate = getTasksForDate(date);
      console.log("All tasks for date:", tasksForDate);
  
      const fetchedTask = tasksForDate.find(task => String(task.id) === String(taskId)); // ודא שהשוואת id היא תקינה גם אם יש סוגים שונים
  
      console.log("Fetched specific task:", fetchedTask);
  
      if (fetchedTask) {
        setTaskData(fetchedTask); // שמור רק את המשימה שנמצאה
      }
    }
  }, [date, taskId, getTasksForDate]);
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>פרטי המשימה</Text>

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
        <Text style={styles.date}>
          תאריך: {taskData?.startDate && taskData?.endDate ? `${taskData.startDate} - ${taskData.endDate}` : "תאריך לא זמין"}
        </Text>
      </View>

      {/* Participants */}
      <View style={styles.detailsContainer}>
        <Text style={styles.participants}>
          משתתפים: {taskData?.participants?.length > 0 ? taskData?.participants.map(p => p.name).join(", ") : "אין משתתפים"}
        </Text>
      </View>

      {/* Max Participants */}
      <View style={styles.detailsContainer}>
        <Text style={styles.maxParticipants}>
          מגבלת משתתפים: {taskData?.maxParticipants > 0 ? taskData.maxParticipants : "לא קיימת מגבלה"}
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  detailsContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
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
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
});

export default TaskDetailsScreen;