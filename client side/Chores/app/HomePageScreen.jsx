
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import PageWithMenu from "./Components/PageWithMenu";
import StoryComponent from "./Components/StoryComponent";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import TaskItem from "./Components/TaskItem";
import OptionsModal from "./Components/OptionsModal";
import AlertModal from "./Components/AlertModal";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function HomePageScreen() {
  const router = useRouter();
  const { availableTasksForNextMonth, removeTaskForDate, myTasks, signUpForTask, signOutOfTask, markTaskAsCompleted, markTaskAsNotCompleted } = useTasks();
  const { user } = useUserAndHome();
  const optionsModalRef = useRef(null);
  const [currentList, setCurrentList] = useState(null);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("myTasks"); // טאב נבחר

  const options = [
    { icon: "edit", text: "ערוך", action: "edit" },
    { icon: "delete", text: "מחק", action: "delete", iconColor: "#ff4444" },
  ];

  const handleOptionSelect = (option) => {
    if (option.action === "edit") {
      router.push({
        pathname: "./TaskEditScreen",
        params: { taskId: currentList.id, date: currentList.startDate.split("T")[0] },
      });
    } else if (option.action == "delete") {
      setModalDeleteVisible(true);
    }
    optionsModalRef.current?.close();
  };

  const handleDelete = () => {
    if (currentList) {
      removeTaskForDate(currentList.id);
      setModalDeleteVisible(false);
    }
  };

  const openOptionsPanel = (task) => {
    setCurrentList(task);
    optionsModalRef.current?.open();
  };

  const sortedMyTasks = [...myTasks].sort((a, b) => {
    // שלב 1: לפי האם בוצע
    if (a.status !== b.status) {
      return a.status ? 1 : -1; // משימות שבוצעו עוברות למטה
    }
  
    // שלב 2: אם אותו סטטוס, מיון לפי סוג (משימה לפני אירוע)
    if (a.category !== b.category) {
      return a.category === "משימה" ? -1 : 1;
    }
  
    return 0; // אותו סטטוס ואותו סוג
  });
  
  const displayedTasks = activeTab === "myTasks" ? sortedMyTasks : availableTasksForNextMonth;
    const sectionTitle = activeTab === "myTasks" ? "המשימות שלי לשבוע הקרוב" : "משימות ואירועים זמינים החודש";

  return (
    <PageWithMenu>
      <StoryComponent />
<GestureHandlerRootView>
      {/* טאב-באר */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "myTasks" && styles.activeTab]}
          onPress={() => setActiveTab("myTasks")}
        >
          <Text style={[styles.tabText, activeTab === "myTasks" && styles.activeTabText]}>המשימות שלי</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "monthly" && styles.activeTab]}
          onPress={() => setActiveTab("monthly")}
        >
          <Text style={[styles.tabText, activeTab === "monthly" && styles.activeTabText]}>משימות החודש</Text>
        </TouchableOpacity>
      </View>

      {/* כותרת */}
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      {/* רשימת משימות */}
      <FlatList
        contentContainerStyle={{ paddingBottom: 100 }}
        data={displayedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: task }) => (
          <TaskItem
            task={task}
            user={user}
            selectedDate={task.startDate.split("T")[0]}
            signUpForTask={signUpForTask}
            signOutOfTask={signOutOfTask}
            markTaskAsCompleted={markTaskAsCompleted}
            markTaskAsNotCompleted={markTaskAsNotCompleted}
            openOptionsPanel={() => openOptionsPanel(task)}
            router={router}
          />
        )}
        ListEmptyComponent={<Text style={styles.noTaskText}>אין משימות</Text>}
      />

      <OptionsModal
        optionsModalRef={optionsModalRef}
        handleOptionSelect={handleOptionSelect}
        options={options}
      />
      <AlertModal
        visible={modalDeleteVisible}
        onClose={() => setModalDeleteVisible(false)}
        message="האם אתה בטוח שברצונך למחוק פריט זה?"
        onConfirm={handleDelete}
        confirmText="מחק"
        cancelText="ביטול"
      />
      </GestureHandlerRootView>
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
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
  },
  
  tabButton: {
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "transparent", // לא נבחר
  },
  
  activeTab: {
    borderBottomColor: '#007bff', // קו ירוק מתחת לנבחר
  },
  
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  
  activeTabText: {
    color:'#007bff',
  },
  
  noTaskText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
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
