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
    setTaskData((prevState) => ({
      ...prevState,
      [field]: value,  // עדכון הערך של השדה המתאים
    }));
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>עריכת משימה</Text>
        <View style={{ width: 28 }} />
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
        {/* <TextInput
          style={styles.input}
          value={toEditTaskData.category}
          onChangeText={(text) => setTaskData({ ...toEditTaskData, category: text })}
          placeholder="Category"
          placeholderTextColor="#ccc"
        /> */}

        <TextInput
          style={styles.input}
          value={toEditTaskData.maxParticipants.toString()}
          onChangeText={(text) => setTaskData({ ...toEditTaskData, maxParticipants: text.replace(/[^0-9]/g, '') })}
          placeholder="Max Participants"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
        />

        <ItemSelector
          items={categories}
          onSelect={(category) => handleInputChange("category", category)}
          defaultSelected={toEditTaskData.category}
          firstItem="משימה"
        />

        <Text>זמן התחלה</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} />
          <DatePickerForTasks
            showModal={showStartDatePicker}
            setShowModal={setShowStartDatePicker}
            selectedDate={toEditTaskData.startDate}
            onDateSelect={handleStartDateSelect}
          />
          <TimePickerButton
            initialTime={toEditTaskData.startTime}
            onConfirm={handleStartTimeSelect}
          />
        </View>

        <Text>זמן סיום</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} />
          <DatePickerForTasks
            showModal={showEndDatePicker}
            setShowModal={setShowEndDatePicker}
            selectedDate={toEditTaskData.endDate}
            onDateSelect={handleEndDateSelect}
          />
          <TimePickerButton
            initialTime={toEditTaskData.endTime}
            onConfirm={handleEndTimeSelect}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerTitle: {
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
    marginLeft: 20
  },
});

export default TaskEditScreen;
