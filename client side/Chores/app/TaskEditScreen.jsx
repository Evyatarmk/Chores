import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import DatePickerForTasks from "./Components/DatePickerForTasks";
import TimePickerButton from "./Components/TimePickerButton";
import ItemSelector from "./Components/ItemSelector";

const TaskEditScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { taskId, date } = params;
  const { editTask, getTasksForDate } = useTasks();
  const categories = ["משימה", "אירוע"]; // Available categories


  const task = getTasksForDate(date);

  // Ensure task is not undefined
  const mytask = task.find(task => String(task.id) === String(taskId));

  // Check if the task was found, otherwise return early or handle gracefully
  if (!mytask) {
    return <Text>Task not found</Text>; // Or some error handling UI
  }

  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // Function to toggle date picker
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // Function to toggle date picker

  const currentTime = new Date();
  currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 5) * 5); // Round down to nearest 5 minutes
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const [isEvent, setIsEvent] = useState(mytask.category == "משימה" ? false : true); // Function to toggle date picker

  const [toEditTaskData, setTaskData] = useState({
    title: mytask.title || "",
    description: mytask.description || "",
    startTime: formattedTime,  // Start time
    endTime: formattedTime,    // End time
    startDate: mytask.startDate || new Date(),
    endDate: mytask.endDate || new Date(),
    category: mytask.category || "משימה",
    participants: mytask.participants || [], // Default to empty array
    maxParticipants: mytask.maxParticipants || 1, // Default max participants
  });

  const handleStartDateSelect = (date) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, startDate: date };

      // Update endDate if it's earlier than startDate
      if (new Date(date) > new Date(prevState.endDate)) {
        updatedData.endDate = date;
      }

      if (new Date(date).toLocaleDateString() === new Date(prevState.endDate).toLocaleDateString() && prevState.endTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (start > end) {
          updatedData.endTime = prevState.startTime; // Update end time to match start time
        }
      }

      return updatedData;
    });
  };

  const handleEndDateSelect = (date) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, endDate: date };

      if (new Date(date) < new Date(prevState.startDate)) {
        updatedData.startDate = date;
      }

      if (new Date(date).toLocaleDateString() === new Date(prevState.startDate).toLocaleDateString() && prevState.startTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (end < start) {
          updatedData.endTime = prevState.startTime; // Update end time to match start time
        }
      }

      return updatedData;
    });
  };

  const handleStartTimeSelect = (time) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, startTime: time };

      if (prevState.startDate === prevState.endDate && prevState.endTime) {
        const start = new Date(`2000-01-01T${time}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (start > end) {
          updatedData.endTime = time; // Update end time to match start time
        }
      }

      return updatedData;
    });
  };



  const handleEndTimeSelect = (time) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, endTime: time };

      if (prevState.startDate === prevState.endDate && prevState.startTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${time}`);

        if (end < start) {
          updatedData.endTime = prevState.startTime; // Update end time to match start time
        }
      }

      return updatedData;
    });
  };

  const handleInputChange = (field, value) => {
    if (value == "משימה") {
      setIsEvent(false)
      setTaskData((prevState) => ({
        ...prevState,
        [field]: value,
        maxParticipants: mytask.participants.length || 1 // עדכון הערך של השדה המתאים
      }));
    }
    else {
      setIsEvent(true)
      setTaskData((prevState) => ({
        ...prevState,
        [field]: value,
        maxParticipants: -1 // עדכון הערך של השדה המתאים
      }));
    }

  };


  const handleSave = () => {
    const updatedTask = {
      title: toEditTaskData.title,
      description: toEditTaskData.description,
      category: toEditTaskData.category,
      startDate: toEditTaskData.startDate,
      endDate: toEditTaskData.endDate,
      maxParticipants: parseInt(toEditTaskData.maxParticipants, 10),
    };



    editTask(taskId, updatedTask);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      {/* כותרת המסך */}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>עריכת {mytask.category}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={toEditTaskData.title}
          onChangeText={(text) => setTaskData({ ...toEditTaskData, title: text })}
          placeholder="כותרת"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          value={toEditTaskData.description}
          onChangeText={(text) => setTaskData({ ...toEditTaskData, description: text })}
          placeholder="תיאור"
          placeholderTextColor="#ccc"
        />



        {!isEvent ?
          <TextInput
            style={styles.input}
            value={toEditTaskData.maxParticipants.toString()}
            onChangeText={(text) => setTaskData({ ...toEditTaskData, maxParticipants: text.replace(/[^0-9]/g, '') })}
            placeholder="Max Participants"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
          /> : null}

 <View style={styles.column}>
        <ItemSelector
          items={categories}
          onSelect={(category) => handleInputChange("category", category)}
          defaultSelected={toEditTaskData.category}
          firstItem="משימה"
        />

        <Text style={styles.times}>זמן התחלה</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.dateText}>
              {new Date(toEditTaskData.startDate).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          <View style={styles.timePickerBox}>
            <TimePickerButton
              initialTime={toEditTaskData.startTime}
              onConfirm={handleStartTimeSelect}
            />
          </View>
        </View>

        <DatePickerForTasks
          showModal={showStartDatePicker}
          setShowModal={setShowStartDatePicker}
          selectedDate={toEditTaskData.startDate}
          onDateSelect={handleStartDateSelect}
        />

        <Text style={styles.times}>זמן סיום</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.dateText}>
              {new Date(toEditTaskData.endDate).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          <View style={styles.timePickerBox}>
            <TimePickerButton
              initialTime={toEditTaskData.endTime}
              onConfirm={handleEndTimeSelect}
            />
          </View>
        </View>

        <DatePickerForTasks
          showModal={showEndDatePicker}
          setShowModal={setShowEndDatePicker}
          selectedDate={toEditTaskData.endDate}
          onDateSelect={handleEndDateSelect}
        />
      </View>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>שמור</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 20,
    position: "relative", // חשוב כדי לאפשר positioning פנימי
  },
  headerTitle: {
    position: "absolute", // מיקום עצמאי שלא תלוי בשאר האלמנטים
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    padding: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    textAlign: "right",
    marginBottom: 15,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  dateAndTimeContianer: {
    flexDirection: "row-reverse",
    backgroundColor: "#f0f0f0",
    justifyContent: "space-between",
    width: "100%",
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },

  dateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    writingDirection: "rtl", // 💡 חשוב למובייל
  },
  timePickerBox: {
    borderRadius: 8,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  times: {
    writingDirection: "rtl", // 💡 חשוב למובייל  
    fontSize: 16,
    fontWeight: "bold",
    },
    column: {
      flexDirection: "column",
      alignItems: "flex-end",
      width: "100%",
      gap: 10,
    },

});

export default TaskEditScreen;
