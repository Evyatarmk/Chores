import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import Icon from "react-native-vector-icons/MaterialIcons";

const Tag = ({ label, color }) => (
  <View style={[styles.tag, { backgroundColor: color.bg }]}>
    <Text style={[styles.tagText, { color: color.text }]}>{label}</Text>
  </View>
);

const TaskDetailsScreen = () => {
  const router = useRouter();
  const { taskId, date } = useLocalSearchParams();
  const { getTasksForDate, tasks } = useTasks();

  const [taskData, setTaskData] = useState(null);

  const handleEdit = () => {
    router.push({ pathname: "./TaskEditScreen", params: { taskId, date } });
  };

  useEffect(() => {
    if (date && taskId) {
      const tasksForDate = getTasksForDate(date);
      console.log("lkkkk")
      const fetchedTask = tasksForDate.find(task => String(task.id) === String(taskId));
      if (fetchedTask) setTaskData(fetchedTask);
    }
  }, [date, taskId, tasks]);
  useEffect(() => {
    const fetchedTask = tasks.find(task => String(task.id) === String(taskId));
    if (fetchedTask) setTaskData(fetchedTask);
  }, [tasks]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>פרטי משימה</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>
          כותרת
        </Text>
        <Text style={styles.value}>{taskData?.title || "לא צוינה"}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>
          תיאור
        </Text>
        <Text style={styles.value}>{taskData?.description || "אין תיאור"}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>
          קטגוריה
        </Text>
        <Text style={styles.value}>{taskData?.category || "לא צוינה קטגוריה"}</Text>
      </View>

      {taskData?.category === "משימה" && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>
            סטטוס
          </Text>
          <View style={{ alignSelf: "flex-end" }}>
            <Tag
              label={taskData?.status ? "בוצע" : "לא בוצע"}
              color={
                taskData?.status
                  ? { bg: "#D1FAE5", text: "#065F46" }
                  : { bg: "#FEE2E2", text: "#991B1B" }
              }
            />
          </View>
        </View>
      )}

      <View style={styles.detailRow}>
        <Text style={styles.label}>
          תאריך
        </Text>
        <Text style={styles.value}>
          {taskData?.startDate && taskData?.endDate ? (() => {
            const start = new Date(taskData.startDate).toLocaleDateString('he-IL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });
            const end = new Date(taskData.endDate).toLocaleDateString('he-IL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            return start === end ? start : `${start} - ${end}`;
          })() : "תאריך לא זמין"}
        </Text>

      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>
          משתתפים
        </Text>
        <Text style={styles.value}>
          {taskData?.participants?.length > 0
            ? taskData.participants.map(p => p.name).join(", ")
            : "אין משתתפים"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>
          מגבלת משתתפים
        </Text>
        <Text style={styles.value}>
          {taskData?.maxParticipants > 0 ? taskData.maxParticipants : "לא קיימת מגבלה"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  editIcon: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
    elevation: 2,
  },
  detailRow: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
    flexDirection: "column",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    flexDirection: "row",
    textAlign: "right",
  },
  iconInline: {
    marginLeft: 6,
  },
  value: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 5,
    textAlign: "right",
    lineHeight: 22,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TaskDetailsScreen;
