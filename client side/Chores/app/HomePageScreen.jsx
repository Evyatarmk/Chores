import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import PageWithMenu from "./Components/PageWithMenu";
import StoryComponent from "./Components/StoryComponent";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import PodiumComponent from "./Components/PodiumComponent";  // Import the new PodiumComponent


export default function HomePageScreen() {
  const router = useRouter();
  const { myTasks, signUpForTask, signOutOfTask, fetchMyTasks } = useTasks(); // Get tasks & sign-up function
  const { user } = useUserAndHome(); // Get logged-in user



  useEffect(() => {
    if (user && user.id) {
      fetchMyTasks(user.id);
    }
  }, [user]);




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
    <PageWithMenu >
      <StoryComponent></StoryComponent>
      <Text style={styles.title}>Welcome to Your Chores App</Text>
      <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>


      <View>
        <Text style={styles.sectionTitle}>המשימות שלי</Text>
        {myTasks.length === 0 ? (
          <Text style={styles.noTaskText}>אין משימות</Text>
        ) : (
          myTasks.map((task) => (
            <TouchableOpacity 
            key={task.id} 
            style={styles.card}
            onPress={() =>{
              router.push({
                pathname: "./TaskDetailsScreen",
                params: { taskId: task.id, date: task.startDate.split("T")[0] },
            })}}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskInfo}>תאריך התחלה: {task.startDate.split("T")[0]}</Text>
              <Text style={styles.taskInfo}>קטגוריה: {task.category}</Text>
              <View style={styles.buttonWrapper}>
                <Button
                  title="בטל הרשמה"
                  color="#ff4d4d"
                  onPress={() => signOutOfTask(task.id, user.id)}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>


    </PageWithMenu>





  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e5ec",
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
    alignItems: "flex-start",
  },

});
