import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import PageWithMenu from "./Components/PageWithMenu";
import StoryComponent from "./Components/StoryComponent";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import PodiumComponent from "./Components/PodiumComponent";  // Import the new PodiumComponent


export default function HomePageScreen() {
  const router = useRouter();
  const { tasks, signUpForTask,signOutOfTask } = useTasks(); // Get tasks & sign-up function
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

  // Calculate top contributors - Sample logic (modify as per actual task structure)
  const currentMonth = new Date().getMonth() + 1;  // Adjusting for 0-index
  const contributions = {}; // Example structure: {userId: taskCount}

  // Mock calculation logic (replace with actual data logic)
  Object.values(tasks).forEach(dayTasks => {
    dayTasks.forEach(task => {
      if (task.completedBy && new Date(task.completionDate).getMonth() + 1 === currentMonth) {
        contributions[task.completedBy] = (contributions[task.completedBy] || 0) + 1;
      }
    });
  });

  // Convert to array and sort to find top 3 contributors


  const topContributors = [
    {
      name: user.name,
      tasksCompleted: user.tasksStats.completedTasksByMonth[currentMonth] || 0
    },  // Assuming 'user' is the logged-in user
    { name: "Danny", tasksCompleted: 10 },
    { name: "Sarah", tasksCompleted: 8 }
  ];

  // Flatten tasks and filter by the user's homeId
  const homeTasks = Object.entries(tasks)
    .flatMap(([date, taskList]) =>
      taskList
        .filter((task) => task.homeId === user.homeId) // Only show tasks for this home
        .map((task) => ({ ...task, date }))
    );
    console.log(homeTasks);
  return (
    <PageWithMenu>
      <StoryComponent></StoryComponent>

      <Text style={styles.title}>Welcome to Your Chores App</Text>
      <Text style={styles.subtitle}>Manage your daily tasks efficiently!</Text>
      <PodiumComponent contributors={topContributors} />
 {/* Task List */}
<View style={styles.taskContainer}>
  <Text style={styles.dateText}>Tasks for Your Home:</Text>
  {homeTasks.length ? (
    homeTasks.map((task) => {
      const isUserSignedUp = task.participants?.some(p => p.id === user.id); // Check if the user is signed up

      return (
        <View key={task.id} style={styles.taskItem}>
          <Text style={styles.taskText}>
            {task.title} - {task.description}
          </Text>
          <Text>Date: {task.date}</Text>
          <Text>
            Assigned to: {task.participants && task.participants.length > 0
              ? task.participants.map(p => p.name).join(", ") // Display participant names
              : "None"}
          </Text>

          {isUserSignedUp ? (
            <Button
              title="Sign Out"
              onPress={() => signOutOfTask(task.date, task.id)}
              color="red"
            />
          ) : (
            <Button
              title="Sign Up"
              onPress={() => signUpForTask(task.date, task.id)}
            />
          )}
        </View>
      );
    })
  ) : (
    <Text style={styles.noTaskText}>No tasks available for your home.</Text>
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
});
