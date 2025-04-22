import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskItem = ({ task, user, selectedDate, signUpForTask, signOutOfTask, markTaskAsCompleted, markTaskAsNotCompleted, openOptionsPanel, router }) => {
 console.log(task)
  const isUserRegistered = task.participants.some(p => p.id === user?.id);
const categoryColors = {
  משימה: "#90CAF9", // כחול נעים
  אירוע: "#D1C4E9", // סגול רך
};
const convertTo12HourFormat = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
  return (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => router.push({ pathname: "./TaskDetailsScreen", params: { taskId: task.id, date: selectedDate } })}
    >
        <View style={[styles.sideBar, { backgroundColor: categoryColors[task.category] || "#ccc" }]} />

      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.dateText}>
  {(() => {
    const startDateObj = new Date(task.startDate);
    const endDateObj = new Date(task.endDate);

    const startDateStr = startDateObj.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const endDateStr = endDateObj.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const sameDate = startDateObj.toDateString() === endDateObj.toDateString();
    const sameTime = task.startTime === task.endTime;

    const formattedStartTime = convertTo12HourFormat(task.startTime);
    const formattedEndTime = convertTo12HourFormat(task.endTime);

    if (sameDate && sameTime) {
      return `${startDateStr}\nבשעה ${formattedStartTime}`;
    }

    if (sameDate) {
      return `${startDateStr}\nבשעה ${formattedStartTime} - ${formattedEndTime}`;
    }

    return `${startDateStr} - ${endDateStr}\nבשעה ${formattedStartTime} - ${formattedEndTime}`;
  })()}
</Text>


      <Text style={styles.taskDescription}numberOfLines={1}
  ellipsizeMode="tail">{task.description}</Text>

      <View style={styles.buttonRow}>
        {isUserRegistered ? (
          <TouchableOpacity onPress={() => signOutOfTask(task.id, user.id)} style={styles.cancelRegisterButton}>
            <Text style={styles.cancelRegisterText}>בטל הרשמה</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
          disabled={task.participants.length >= task.maxparticipants}
          onPress={() => signUpForTask(task.id, user.id)}
          style={[
            styles.registerButton,
            task.participants.length >= task.maxparticipants && { backgroundColor: 'gray' } // optional: make it look disabled
          ]}
        >
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
              task.status ? styles.cancelRegisterButton:styles.registerButton ,
              {
                marginLeft: 10, // רווח בין הכפתורים
              },
            ]}
          >
            <Text style={task.status ? styles.cancelRegisterText:styles.registerText }>
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
  dateText: {
    textAlign: "right",
    fontSize: 13,
    color: "#999",
    marginBottom: 6,
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
    fontSize: 14,
    color: "#666",
    textAlign: "right", 
    paddingLeft:150
  },
  registerButton: {
    backgroundColor: '#e0f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // לאנדרואיד
  },
  cancelRegisterButton: {
    backgroundColor:  "#EF9A9A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // לאנדרואיד
  },
  registerText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelRegisterText: {
    color:'#e53935',
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
