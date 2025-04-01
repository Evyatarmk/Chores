import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimePickerButton = ({ onConfirm, initialTime }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (initialTime) {
      const parsedTime = new Date(`2000-01-01T${initialTime}`);
      setTime(parsedTime);
    }
  }, [initialTime]);

  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setTime(selectedDate);
      onConfirm && onConfirm(selectedDate.toTimeString().slice(0, 5)); // מחזיר שעה בפורמט HH:MM
    }
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.buttonText}>
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="clock"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default TimePickerButton;
