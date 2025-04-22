import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskItem = ({ task, user, selectedDate, signUpForTask, signOutOfTask, markTaskAsCompleted, markTaskAsNotCompleted, openOptionsPanel, router }) => {
  const isUserRegistered = task.participants.some(p => p.id === user?.id);
const categoryColors = {
  משימה: "#90CAF9", // כחול נעים
  אירוע: "#D1C4E9", // סגול רך
};
  return (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => router.push({ pathname: "./TaskDetailsScreen", params: { taskId: task.id, date: selectedDate } })}
    >
        <View style={[styles.sideBar, { backgroundColor: categoryColors[task.category] || "#ccc" }]} />

      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>

      <View style={styles.buttonRow}>
        {isUserRegistered ? (
          <TouchableOpacity onPress={() => signOutOfTask(task.id, user.id)} style={styles.cancelRegisterButton}>
            <Text style={styles.registerText}>בטל הרשמה</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => signUpForTask(task.id, user.id)} style={styles.registerButton}>
            <Text style={styles.registerText}>הירשם</Text>
          </TouchableOpacity>
        )}

        {isUserRegistered && task.category === "משימה" && (
          <TouchableOpacity
            onPress={() => {
              if (task.status) {
                markTaskAsNotCompleted(task.id);
              } else {
                markTaskAsCompleted(task.id);
              }
            }}
            style={[
              styles.registerButton,
              {
                backgroundColor: task.status ? "#FF5722" : "#2196F3",
                marginLeft: 10, // רווח בין הכפתורים
              },
            ]}
          >
            <Text style={styles.registerText}>
              {task.status ? "סמן כלא בוצע" : "סמן כבוצע"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.optionsButton} onPress={() => openOptionsPanel(task)}>
        <Icon name="more-vert" size={24} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: 10,
  },
  taskTitle: {
    textAlign: "right",
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  taskDescription: {
    textAlign: "right",
    fontSize: 14,
    color: "#666",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cancelRegisterButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  registerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  optionsButton: {
    position: "absolute",
    top: 8,
    left: 8,
    padding: 6,
    zIndex: 10,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  sideBar: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 6,
    height: "100%",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  
});

export default TaskItem;
