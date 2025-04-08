import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

const DatePicker = ({ onDateSelect, showModal, setShowModal, selectedDate, TodayMinDate=false }) => {
  const today = new Date().toISOString().split("T")[0];
  const [markedDates, setMarkedDates] = useState(
    selectedDate ? { [selectedDate]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } } : {}
  );
  const [day, setDay] = useState(selectedDate || "");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const handleDayPress = useCallback(
    (day) => {
      setDay(day.dateString);
      setMarkedDates({ [day.dateString]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } });
    },
    []
  );

  const handleQuickSelect = (date) => {
    setDay(date || "");
    setMarkedDates(date ? { [date]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } } : {});
  };

  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowModal(true)}>
        <Ionicons name="calendar" size={12} color="white" />
        <Text style={styles.dateButtonText}>{selectedDate==""?"ללא תאריך":selectedDate.split("T")[0]}</Text>
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
              minDate={TodayMinDate?today:null}
            />

            <View style={styles.quickSelectContainer}>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => handleQuickSelect(today)}>
                <Text style={styles.quickSelectButtonText}>היום</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => handleQuickSelect(tomorrowDate)}>
                <Text style={styles.quickSelectButtonText}>מחר</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => handleQuickSelect(null)}>
                <Text style={styles.quickSelectButtonText}>ללא תאריך</Text>
              </TouchableOpacity>
            </View>

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
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 20,
    justifyContent: "center",
    maxWidth: 120,
  },
  dateButtonText: {
    fontSize: 12,
    color: "white",
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

export default DatePicker;
