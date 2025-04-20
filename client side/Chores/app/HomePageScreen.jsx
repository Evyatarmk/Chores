import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import PageWithMenu from "./Components/PageWithMenu";
import StoryComponent from "./Components/StoryComponent";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import PodiumComponent from "./Components/PodiumComponent";  // Import the new PodiumComponent


export default function HomePageScreen() {
  const router = useRouter();
  const { availableTasksForNextMonth, myTasks, signUpForTask, signOutOfTask } = useTasks(); // Get tasks & sign-up function
  const { user } = useUserAndHome(); // Get logged-in user







  if (!user) {
    return (
      <PageWithMenu >
        <StoryComponent></StoryComponent>
        <Text style={styles.title}>Welcome to Your Chores App</Text>
        <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>
      </PageWithMenu>
    );

  }

  return (
    <PageWithMenu>
      <StoryComponent />
      <ScrollView>
        <Text style={styles.sectionTitle}>המשימות שלי לשבוע הקרוב</Text>
        <View style={styles.listContainer}>
          <FlatList
            data={myTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: task }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  router.push({
                    pathname: "./TaskDetailsScreen",
                    params: { taskId: task.id, date: task.startDate.split("T")[0] },
                  });
                }}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskInfo}>תאריך התחלה: {task.startDate.split("T")[0]}</Text>
                <Text style={styles.taskInfo}>קטגוריה: {task.category}</Text>
                <View style={styles.buttonWrapper}>
                  {/* כפתור ביטול הרשמה */}
                  <View style={[styles.buttonContainer, task.category === "משימה" && styles.withMargin]}>
                    <Button
                      title="בטל הרשמה"
                      color="#ff4d4d"
                      onPress={() => signOutOfTask(task.id, user.id)}
                    />
                  </View>
                  {/* כפתור סמן כבוצע */}
                  {task.category === "משימה" && (
                    <View style={styles.buttonContainer}>
                    <Button
                      title={task.status ? "סמן כלא בוצע" : "סמן כבוצע"} 
                      color={task.status ? "#f44336" : "#4CAF50"} // אדום לביטול, ירוק לביצוע
                      onPress={() => {
                        console.log(task.status)
                        if (task.status) {
                          markTaskAsNotCompleted(task.id); // משימה בוצעה - אז מסמנים כלא בוצעה
                        } else {
                          markTaskAsCompleted(task.id);     // משימה לא בוצעה - אז מסמנים כבוצעה
                        }
                      }}
                    />
                  </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.noTaskText}>אין משימות</Text>}
          />
        </View>
  
        <Text style={styles.sectionTitle}>משימות ואירועים זמינים החודש</Text>
        <View style={styles.listContainer}>
          <FlatList
            data={availableTasksForNextMonth}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: task }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  router.push({
                    pathname: "./TaskDetailsScreen",
                    params: { taskId: task.id, date: task.startDate.split("T")[0] },
                  });
                }}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskInfo}>תאריך התחלה: {task.startDate.split("T")[0]}</Text>
                <Text style={styles.taskInfo}>קטגוריה: {task.category}</Text>
                <View style={styles.buttonWrapper}>
                  <View style={[styles.buttonContainer, task.category === "משימה" && styles.withMargin]}>
                    <TouchableOpacity onPress={() => signUpForTask(task.id, user.id)} style={styles.registerButton}>
                      <Text style={styles.registerText}>הירשם למשימה</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.noTaskText}>אין משימות</Text>}
          />
        </View>
      </ScrollView>
    </PageWithMenu>
  );
  


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e5ec",
  },
  listContainer: {
    height: 300, // הגובה הקבוע לכל רשימה (תוכל לשנות את הערך כאן בהתאם לצורך)
    marginBottom: 10, // רווח בין הרשימות
  },
  registerButton: {
    width: 160,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  taskContainer: {
    width: "100%",
    marginTop: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  taskItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noTaskText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    textAlign: "center",
    color: "#333",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  taskInfo: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },

  buttonWrapper: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  buttonContainer: {
    flex: 1,
  },

  withMargin: {
    marginRight: 10,
  },



});
