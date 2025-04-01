import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

const DatePickerForTasks = ({ onDateSelect, showModal, setShowModal, selectedDate, minDate }) => {
  const today = new Date().toISOString().split("T")[0];
  const initialDate = selectedDate || today;
  
  const [markedDates, setMarkedDates] = useState({
    [initialDate]: { selected: true, selectedColor: "blue", selectedTextColor: "white" }
  });
  const [day, setDay] = useState(initialDate);

  const handleDayPress = useCallback(
    (day) => {
      setDay(day.dateString);
      setMarkedDates({ [day.dateString]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } });
    },
    []
  );

  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowModal(true)}>
        <Text style={styles.dateButtonText}>{initialDate || "ללא תאריך"}</Text>
      </TouchableOpacity>

      <Modal transparent={true} animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              monthFormat={"yyyy MM"}
              theme={{
                selectedDayBackgroundColor: "blue",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#00adf5",
              }}
              style={styles.calendar}
              minDate={minDate || null}
            />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  onDateSelect(day);
                  setShowModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>אישור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 20,
    justifyContent: "center",

  },
  dateButtonText: {
    fontSize: 20,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  calendar: {
    height: 350,
    width: "100%",
  },
  quickSelectContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  quickSelectButton: {
    backgroundColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  quickSelectButtonText: {
    color: "#007bff",
    fontSize: 14,
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DatePickerForTasks;
