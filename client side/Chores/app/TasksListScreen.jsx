import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTasks } from "./Context/TaskContext";
import NormalHeader from "./Components/NormalHeader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import PageWithMenu from "./Components/PageWithMenu";
import OptionsModal from "./Components/OptionsModal";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import AlertModal from "./Components/AlertModal";

const TasksListScreen = () => {
  const { tasks, removeTaskForDate, getTasksForDate, signUpForTask, signOutOfTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);

  const router = useRouter();
  const optionsModalRef = useRef(null);
  const editModalRef = useRef(null)
  const [currentList, setCurrentList] = useState(null);
  const { user } = useUserAndHome()
  const categoryColors = {
    משימה: "#42A5F5", // כחול נעים
    אירוע: "#AB47BC", // סגול רך
  };
  const DEFAULT_CATEGORY_COLOR = "#90CAF9"; // צבע ברירת מחדל  
  const options = [
    { icon: "edit", text: "ערוך", action: "edit" },
    { icon: "delete", text: "מחיקה", action: "delete", iconColor: "#ff4444" },
  ];
  const handleOptionSelect = (option) => {
    if (option === "edit") {
      optionsModalRef.current?.close();
      handleEdit()
      setTimeout(() => {
        editModalRef.current?.open();
      }, 300);
    } if (option === "delete") {
      setModalDeleteVisible(true)
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "./TaskEditScreen",
      params: { taskId: currentList.id, date: selectedDate }
    })
  };
  const handleDelete = () => {
    optionsModalRef.current?.close();
    removeTaskForDate(currentList.id)
  };
  const openOptionsPanel = (list) => {
    setCurrentList(list);
    optionsModalRef.current?.open();
  };


  const renderMarkedDates = () => {
    const markedDates = {};
  
    Object.keys(tasks).forEach((dateKey) => {
      tasks[dateKey].forEach((task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
  
        const color = categoryColors[task.category] || DEFAULT_CATEGORY_COLOR;
  
        let current = new Date(startDate);
  
        while (current <= endDate) {
          const dateStr = current.toISOString().split('T')[0];
  
          const period = {
            startingDay: dateStr === startDateStr,
            endingDay: dateStr === endDateStr,
            color: color,
            textColor: 'white',
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
  
    // 🎯 הוספת היום שנבחר כ-selected
    if (!markedDates[selectedDate]) {
      markedDates[selectedDate] = {};
    }
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = "#42A5F5"; // צבע הבחירה שאת רוצה
    markedDates[selectedDate].selectedTextColor = "#fff";
  
    return markedDates;
  };
  





  return (
    <PageWithMenu>
      <GestureHandlerRootView style={styles.container}>
        <NormalHeader title="המשימות של הבית"></NormalHeader>
        {/* יומן להצגת התאריכים */}
        <Calendar
          markedDates={renderMarkedDates()}
          markingType={"multi-period"}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);

          }}
          theme={{
            selectedDayBackgroundColor: "#1E90FF",
            todayTextColor: "#1E90FF",
            arrowColor: "#1E90FF",
          }}
        />

        {/* רשימת משימות לתאריך שנבחר */}
        <FlatList
          data={getTasksForDate(selectedDate)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isUserRegistered = item.participants.some(participant => participant.id === user?.id); // כאן אתה בודק אם המשתמש רשום, תחליף ב-id של המשתמש שלך
            console.log(item.category)
            return (
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() =>
                  router.push({
                    pathname: "./TaskDetailsScreen",
                    params: { taskId: item.id, date: selectedDate },
                  })
                }
              >
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDescription}>{item.description}</Text>

                {item.category === "אירוע" ? (
                  isUserRegistered ? (
                    <TouchableOpacity onPress={() => signOutOfTask(item.id, user.id)} style={styles.cancelRegisterButton}>
                      <Text style={styles.registerText}>בטל הרשמה</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => signUpForTask(item.id, user.id)} style={styles.registerButton}>
                      <Text style={styles.registerText}>הירשם לאירוע</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  item.participants.length < item.maxParticipants ? (
                    isUserRegistered ? (
                      <TouchableOpacity onPress={() => signOutOfTask(item.id, user.id)} style={styles.cancelRegisterButton}>
                        <Text style={styles.registerText}>בטל הרשמה</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => signUpForTask(item.id, user.id)} style={styles.registerButton}>
                        <Text style={styles.registerText}>הירשם למשימה</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    isUserRegistered && (
                      <TouchableOpacity onPress={() => signOutOfTask(item.id, user.id)} style={styles.cancelRegisterButton}>
                        <Text style={styles.registerText}>בטל הרשמה</Text>
                      </TouchableOpacity>
                    )
                  )
                )}
                {isUserRegistered && !item.completedAt && item.category === "משימה" && (
                  <TouchableOpacity
                    onPress={async () => {
                      await markTaskAsCompleted(item.id, user.id);
                    }}
                    style={[styles.registerButton, { backgroundColor: "#2196F3", marginTop: 10 }]}
                  >
                    <Text style={styles.registerText}>סמן כבוצע</Text>
                  </TouchableOpacity>
                )}




                <TouchableOpacity
                  style={styles.optionsButton}
                  onPress={() => openOptionsPanel(item)}
                >
                  <Icon name="more-vert" size={24} color="#888" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>אין משימות ליום זה</Text>
            </View>
          }
        />


        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "./AddTaskScreen",
              params: { day: selectedDate },
            })
          }
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
        {/* מודל אפשרויות */}
        <OptionsModal
          optionsModalRef={optionsModalRef}
          handleOptionSelect={handleOptionSelect}
          options={options}
        />
        <AlertModal
          visible={modalDeleteVisible}
          onClose={() => setModalDeleteVisible(false)}
          message="האם אתה בטוח שברצונך למחוק פריטים אלו?"
          onConfirm={handleDelete}
          confirmText="מחק"
          cancelText="ביטול"
        />
      </GestureHandlerRootView>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

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
    margin: 3
  },
  taskTitle: {
    textAlign: "right", fontSize: 20, fontWeight: "bold", color: "#333", paddingBottom: 10
  },
  taskDescription: {
    textAlign: "right",
    fontSize: 14,
    color: "#888",
    paddingBottom: 8,  // Adjust padding for better spacing
  },
  optionsButton: {
    position: "absolute",
    top: 12,
    left: 2,
    padding: 8,
    borderRadius: 25,
    zIndex: 1000
  },
  button: {
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center", // Center the empty state text
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
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
  cancelRegisterButton: {
    width: 160,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  }
});

export default TasksListScreen;
