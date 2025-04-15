import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "./Context/TaskContext";
import { useUserAndHome } from "./Context/UserAndHomeContext";

import { v4 as uuidv4 } from "uuid";  // Ensure you import uuid for generating unique IDs
import ItemSelector from "./Components/ItemSelector";
import ClearableInput from "./Components/ClearableInput";
import TimePickerButton from "./Components/TimePickerButton";
import DatePickerForTasks from "./Components/DatePickerForTasks";

const AddTaskScreen = () => {
  const inputRef = useRef(null);
  const router = useRouter();
  const { tasks, addTaskForDate } = useTasks();
  const { day } = useLocalSearchParams(); // Get the selected date from params
  const { user } = useUserAndHome();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // Function to toggle date picker
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // Function to toggle date picker
  const [isEvent, setIsEvent] = useState(true); // Function to toggle date picker
  // Update homeId when user changes
  useEffect(() => {
    setTaskData((prevState) => ({
      ...prevState,
      homeId: user?.homeId,
    }));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user]);


  const currentTime = new Date();
  currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 5) * 5); // עיגול למטה לעד 5 דקות הקרובים
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    homeId: "home1",
    startTime: formattedTime,  // זמן התחלה
    endTime: formattedTime,    // זמן סיום
    startDate: day,
    endDate: day,
    category: "משימה",
    participants: [], // Default to empty array
    maxParticipants: 1, // Default max participants
  });
  const categories = ["משימה", "אירוע"]; // Available categories

  const handleAddTask = () => {
    if (!user || !user.homeId) {
      alert("You must be logged in to add a task.");
      return;
    }

    if (!taskData.title) {
      alert("Please enter a title for the task.");
      return;
    }

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };


    let newItem = { ...taskData, id: uuidv4(), color: getRandomColor() }; // Copy taskData and generate a new ID
    if (taskData.endDate == "" || taskData.endDate == null) {
      newItem = { ...newItem, endDate: taskData.startDate }
    }
    console.log(newItem)
    // Add task for the selected date
    addTaskForDate(newItem, user.homeId);

    

    console.log(tasks);

    // Navigate back after adding the task
    router.back();
  };


  const handleInputChange = (field, value) => {
    setTaskData((prevState) => {
      let updated = {
        ...prevState,
        [field]: value,
      };
  
      if (field === "category") {
        if (value === "אירוע") {
          setIsEvent(false);
          updated.maxParticipants = -1; // ערך לא הגיוני
        } else if (value === "משימה") {
          setIsEvent(true);
          updated.maxParticipants = 1; // או ערך אחר שמתאים כברירת מחדל
        }
      }
  
      return updated;
    });
  };
  

  const handleStartDateSelect = (date) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, startDate: date };

      // אם תאריך הסיום קטן מתאריך ההתחלה, נעדכן אותו
      if (new Date(date) > new Date(prevState.endDate)) {
        updatedData.endDate = date;
      }

      // אם תאריך ההתחלה זהה לתאריך הסיום, נוודא ששעת הסיום לא תהיה לפני שעת ההתחלה
      if (new Date(date).toLocaleDateString() === new Date(prevState.endDate).toLocaleDateString() && prevState.endTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (start > end) {
          updatedData.endTime = prevState.startTime; // עדכון שעת הסיום לשעת התחלה
        }
      }

      return updatedData;
    });
  };

  const handleEndDateSelect = (date) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, endDate: date };

      // אם תאריך הסיום קטן מתאריך ההתחלה, נעדכן גם את תאריך ההתחלה
      if (new Date(date) < new Date(prevState.startDate)) {
        updatedData.startDate = date;
      }

      // אם תאריך הסיום זהה לתאריך ההתחלה, נוודא ששעת הסיום לא תהיה לפני שעת ההתחלה
      if (new Date(date).toLocaleDateString() === new Date(prevState.startDate).toLocaleDateString() && prevState.startTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (end < start) {
          updatedData.endTime = prevState.startTime; // עדכון שעת הסיום לשעת התחלה
        }
      }

      return updatedData;
    });
  };

  const handleStartTimeSelect = (time) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, startTime: time };

      // אם התאריך זהה ושעת ההתחלה גדולה משעת הסיום, נעדכן את שעת הסיום לשעת התחלה
      if (prevState.startDate === prevState.endDate && prevState.endTime) {
        const start = new Date(`2000-01-01T${time}`);
        const end = new Date(`2000-01-01T${prevState.endTime}`);

        if (start > end) {
          updatedData.endTime = time; // עדכון שעת הסיום לשעת התחלה
        }
      }

      return updatedData;
    });
  };

  const handleEndTimeSelect = (time) => {
    setTaskData((prevState) => {
      const updatedData = { ...prevState, endTime: time };

      // אם התאריך זהה ושעת הסיום קטנה משעת ההתחלה, נעדכן את שעת הסיום לשעת התחלה
      if (prevState.startDate === prevState.endDate && prevState.startTime) {
        const start = new Date(`2000-01-01T${prevState.startTime}`);
        const end = new Date(`2000-01-01T${time}`);

        if (end < start) {
          updatedData.endTime = prevState.startTime; // עדכון שעת הסיום לשעת התחלה
        }
      }

      return updatedData;
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הוסף משימה</Text>
        </View>

        {/* Task Title
        <ClearableInput
          value={taskData.title}
          onChangeText={(value) => handleInputChange("title", value)}
          placeholder={"כותרת למשימה"}
          style={styles.titleInput}
        /> */}

        {/* Task Title */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="כותרת למשימה"
            value={taskData.title}
            onChangeText={(value) => handleInputChange("title", value)}
          />
        </View>

        {/* Task Description */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="הוסף תיאור"
            value={taskData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            multiline
          />
        </View>
        {isEvent? <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="מספר מקסימלי של משתתפים"
            value={taskData.maxParticipants === 0 || taskData.maxParticipants === '' ? '' : taskData.maxParticipants.toString()}
            onChangeText={(text) => {
              const numericValue = parseInt(text, 10);
              if (text === '' || !isNaN(numericValue)) {
                handleInputChange("maxParticipants", text === '' ? '' : numericValue);
              }
            }}
            keyboardType="numeric"
            multiline={false}
          />
        </View>:null}
       


        <View style={styles.column}>
          {/* Category Selector */}
          <ItemSelector
            items={categories}
            onSelect={(category) => handleInputChange("category", category)}
            defaultSelected={taskData.category}
            firstItem="משימה"
          />
          <Text>זמן התחלה</Text>
          <View style={styles.dateAndTimeContianer}>
            {/* Date Picker */}
            <DatePickerForTasks
              onDateSelect={handleStartDateSelect}
              showModal={showStartDatePicker}
              setShowModal={setShowStartDatePicker}
              selectedDate={taskData?.startDate}
            />
            {/* Time Picker */}
            <TimePickerButton
              onConfirm={handleStartTimeSelect}
              initialTime={taskData.startTime}
            />
          </View>

          <Text>זמן סוף</Text>
          <View style={styles.dateAndTimeContianer}>
            {/* Date Picker */}
            <DatePickerForTasks
              onDateSelect={handleEndDateSelect}
              showModal={showEndDatePicker}
              setShowModal={setShowEndDatePicker}
              selectedDate={taskData?.endDate}
            />
            {/* Time Picker */}
            <TimePickerButton
              onConfirm={handleEndTimeSelect}
              initialTime={taskData.endTime}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.editButtons}>
          <TouchableOpacity onPress={handleAddTask} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>הוסף משימה</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 80, // Add padding for the button to be above the keyboard
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  titleInput: {
    marginBottom: 15,

  },
  inputContainer: {
    width: "100%",
    position: "relative",
  },
  column: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: "100%",
    gap: 10,
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
  editButtons: {
    flexDirection: "row",
    width: "100%",
  },
  clearButton: {
    position: "absolute",
    top: "50%",
    left: 15,
    transform: [{ translateY: -12 }],
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
  },
});

export default AddTaskScreen;
