import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import Sidebar from "./Components/SideBar";
import StoryComponent from "./Components/StoryComponent";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";

export default function HomePageScreen() {
  const router = useRouter();
  const { tasks, signUpForTask } = useTasks(); // Get tasks & sign-up function
  const { user } = useUserAndHome(); // Get logged-in user

  if (!user) {
    return (
      <View style={styles.container}>
        <StoryComponent></StoryComponent>
        <Sidebar />
        <Text style={styles.title}>Welcome to Your Chores App</Text>
        <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>
      </View>
    );
  }

  // Flatten tasks and filter by the user's homeId
  const homeTasks = Object.entries(tasks)
    .flatMap(([date, taskList]) =>
      taskList
        .filter((task) => task.homeId === user.homeId) // Only show tasks for this home
        .map((task) => ({ ...task, date }))
    );
    console.log(homeTasks);
  return (
    <View style={styles.container}>
      <Sidebar />
      <Text style={styles.title}>Welcome to Your Chores App</Text>
      <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>

      {/* Task List */}
      <View style={styles.taskContainer}>
        <Text style={styles.dateText}>Tasks for Your Home:</Text>
        {homeTasks.length ? (
          homeTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskText}>
                {task.title} - {task.description}
              </Text>
              <Text>Date: {task.date}</Text>
              <Text>Assigned to: {task.assignedTo || "None"}</Text>
              {!task.assignedTo && (
                <Button
                  title="Sign Up"
                  onPress={() => signUpForTask(user.name, task.date, task.id)}
                />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noTaskText}>No tasks available for your home.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
});
