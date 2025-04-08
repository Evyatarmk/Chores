import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import DatePickerForTasks from "./Components/DatePickerForTasks";
import TimePickerButton from "./Components/TimePickerButton";

const TaskEditScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { taskId, date } = params;
  const { editTask, getTask } = useTasks();

  const task = getTask(date, taskId);  // Assuming getTask fetches task by date and ID

  // Ensure the task has the right values when fetched
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [category, setCategory] = useState(task ? task.category : '');
  const [startDate, setStartDate] = useState(task ? task.startDate : new Date());
  const [endDate, setEndDate] = useState(task ? task.endDate : new Date());
  const [startTime, setStartTime] = useState(task ? task.startTime : '');  // Ensure startTime is set correctly
  const [endTime, setEndTime] = useState(task ? task.endTime : '');
  const [maxParticipants, setMaxParticipants] = useState(task ? task.maxParticipants.toString() : '');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleSave = () => {
    const updatedTask = {
      title,
      description,
      category,
      startDate,
      endDate,
      startTime,
      endTime,
      maxParticipants: parseInt(maxParticipants, 10)
    };
    editTask(taskId, updatedTask);  // Adjusted to match your API if necessary
    router.back();  // Navigate back after updating
  };

  // Handle start time selection
  const handleStartTimeSelect = (time) => {
    setStartTime(time); // Directly update startTime

    // If start date is the same as end date and endTime exists, update endTime if needed
    if (startDate === endDate && endTime) {
      const start = new Date(`2000-01-01T${time}`);
      const end = new Date(`2000-01-01T${endTime}`);

      if (start > end) {
        setEndTime(time);  // Update endTime to match startTime if it's later
      }
    }
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
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Category"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          value={maxParticipants}
          onChangeText={text => setMaxParticipants(text.replace(/[^0-9]/g, ''))}
          placeholder="Max Participants"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
        />
        {/* Date and Time Pickers */}
        <Text>זמן התחלה</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} />
          <DatePickerForTasks
            showModal={showStartDatePicker}
            setShowModal={setShowStartDatePicker}
            selectedDate={task.startDate}
            onDateSelect={setStartDate}
          />
          <TimePickerButton
            initialTime={task.startTime}  // Make sure startTime is passed correctly
            onConfirm={handleStartTimeSelect}  // Update startTime when confirmed
          />
        </View>

        <Text>זמן סיום</Text>
        <View style={styles.dateAndTimeContianer}>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} />
          <DatePickerForTasks
            showModal={showEndDatePicker}
            setShowModal={setShowEndDatePicker}
            selectedDate={endDate}
            onDateSelect={setEndDate}
          />
          <TimePickerButton
            initialTime={endTime}
            onConfirm={setEndTime}  // Directly update endTime
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
