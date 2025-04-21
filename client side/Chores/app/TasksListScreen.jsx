import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import NormalHeader from "./Components/NormalHeader";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import PageWithMenu from "./Components/PageWithMenu";
import OptionsModal from "./Components/OptionsModal";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import AlertModal from "./Components/AlertModal";
import { useApiUrl } from "./Context/ApiUrlProvider";
import TaskItem from "./Components/TaskItem";

const TasksListScreen = () => {
  const { tasksFormatted, removeTaskForDate, getTasksForDate, signUpForTask, signOutOfTask, markTaskAsCompleted, markTaskAsNotCompleted } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [currentList, setCurrentList] = useState(null);
  const { user } = useUserAndHome();
  const router = useRouter();
  const optionsModalRef = useRef(null);

  const categoryColors = {
    משימה: "#42A5F5", // כחול נעים
    אירוע: "#AB47BC", // סגול רך
  };
  const DEFAULT_CATEGORY_COLOR = "#90CAF9";

  const options = [
    { icon: "edit", text: "ערוך", action: "edit" },
    { icon: "delete", text: "מחק", action: "delete", iconColor: "#ff4444" },
  ];

  const handleOptionSelect = (option) => {
    if (option.action === "edit") {
      router.push({
        pathname: "./TaskEditScreen",
        params: { taskId: currentList.id, date: selectedDate },
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

  const openOptionsPanel = (list) => {
    setCurrentList(list);
    optionsModalRef.current?.open();
  };

  const renderMarkedDates = () => {
    const markedDates = {};

    Object.keys(tasksFormatted).forEach((dateKey) => {
      tasksFormatted[dateKey].forEach((task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const color = categoryColors[task.category] || DEFAULT_CATEGORY_COLOR;

        let current = new Date(startDate);
        while (current <= endDate) {
          const dateStr = current.toISOString().split("T")[0];

          const period = {
            startingDay: dateStr === startDate.toISOString().split("T")[0],
            endingDay: dateStr === endDate.toISOString().split("T")[0],
            color: color,
            textColor: "white",
          };

          if (!markedDates[dateStr]) {
            markedDates[dateStr] = { periods: [period] };
          } else {
            markedDates[dateStr].periods.push(period);
          }

          current.setDate(current.getDate() + 1);
        }
      });
    });

    // הוספת היום הנבחר
    if (!markedDates[selectedDate]) {
      markedDates[selectedDate] = {};
    }
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = "#42A5F5";
    markedDates[selectedDate].selectedTextColor = "#fff";

    return markedDates;
  };



  return (
    <PageWithMenu>
      <GestureHandlerRootView style={styles.container}>
        <NormalHeader title="המשימות של הבית" />

        <View style={{ marginBottom: 20 }}>
  <Calendar
    markedDates={renderMarkedDates()}
    markingType="multi-period"
    onDayPress={(day) => setSelectedDate(day.dateString)}
    theme={{
      selectedDayBackgroundColor: "#1E90FF",
      todayTextColor: "#1E90FF",
      arrowColor: "#1E90FF",
    }}
  />
</View>
        <FlatList
          data={getTasksForDate(selectedDate)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              user={user}
              selectedDate={selectedDate}
              signUpForTask={signUpForTask}
              signOutOfTask={signOutOfTask}
              markTaskAsCompleted={markTaskAsCompleted}
              markTaskAsNotCompleted={markTaskAsNotCompleted}
              openOptionsPanel={()=>openOptionsPanel(item)}
              router={router}
            />
          )}
         
          
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>אין משימות ליום זה</Text>
            </View>
          }
        />
       

        <OptionsModal
          optionsModalRef={optionsModalRef}
          handleOptionSelect={(option) => handleOptionSelect(option)}
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
   
         <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({ pathname: "./AddTaskScreen", params: { day: selectedDate } })}
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
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
    marginBottom: 8,
  },
  registerButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  cancelRegisterButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
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
});

export default TasksListScreen;
