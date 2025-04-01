import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

const DateRangePicker = ({ onDateSelect, showModal, setShowModal, selectedRange }) => {
  const [range, setRange] = useState(selectedRange || { start: null, end: null });

  const handleDayPress = (day) => {
    const { start, end } = range;
    if (!start || (start && end)) {
      setRange({ start: day.dateString, end: null });
    } 
    else {
      setRange({ start, end: day.dateString >= start ? day.dateString : start });
    }
  };

  const markedDates = {};
  if (range.start) {
    markedDates[range.start] = { startingDay: true, color: "#007bff", textColor: "white" };
  }
  if (range.end) {
    markedDates[range.end] = { endingDay: true, color: "#007bff", textColor: "white" };
  }
  if (range.start && range.end) {
    let currentDate = new Date(range.start);
    while (currentDate < new Date(range.end)) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dateStr = currentDate.toISOString().split("T")[0];
      if (dateStr !== range.end) {
        markedDates[dateStr] = { color: "#b3d7ff", textColor: "black" };
      }
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowModal(true)}>
        <Ionicons name="calendar" size={12} color="white" />
        <Text style={styles.dateButtonText}>
          {range.start ? `${range.start} ${range.end==null? "":"- "+range.end }` : "בחר טווח תאריכים"}
        </Text>
      </TouchableOpacity>

      <Modal transparent={true} animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType="period"
              theme={{
                selectedDayBackgroundColor: "#007bff",
                todayTextColor: "#00adf5",
              }}
              style={styles.calendar}
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  onDateSelect(range);
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
    
  },
  dateButtonText: {
    fontSize: 18,
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

export default DateRangePicker;
