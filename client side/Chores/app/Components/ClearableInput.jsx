import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ClearableInput = ({ value, onChangeText, placeholder }) => {
  const handleClear = () => onChangeText("");

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={24} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  clearButton: {
    position: "absolute",
    top: "50%",
    left: 15,
    transform: [{ translateY: -12 }],
  },
});

export default ClearableInput;
