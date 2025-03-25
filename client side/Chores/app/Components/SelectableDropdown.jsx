import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from "@rneui/base";

const SelectableDropdown = ({ 
  options, 
  selectedValue, 
  onSelect, 
  label = "קטגוריה", 
  allowAdding = false,
  firstItem, 
  onAdding,
  defaultSelected = "" 
}) => {
  const [visible, setVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newOption, setNewOption] = useState("");
  const inputRef = useRef(null);

  const filteredItems = Array.from(
    new Set(defaultSelected ? [firstItem, defaultSelected, ...options] : [firstItem, ...options])
  );

  const handleSelect = (option) => {
    onSelect(option);
    setVisible(false);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      if (onAdding) {
        onAdding(newOption.trim()); // קריאה לפונקציה על מנת לעדכן את הקונטקסט או הסטייט
      }
      onSelect(newOption.trim());
      setNewOption("");
      setAddModalVisible(false); // Close the modal only after adding the option
    }
  };

  const handlePressOutsideAddModal = () => {
    setAddModalVisible(false); // Close the modal when pressing outside
  };

  const handlePressInsideAddModal = (e) => {
    e.stopPropagation(); // Prevent modal closure when clicking inside
  };

 
  return (
    <View>
      {/* Button to open the dropdown */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)}>
        <Text 
          style={styles.buttonText}
          numberOfLines={1}  // Ensures only one line of text
          ellipsizeMode="tail" // Shows ellipsis if text doesn't fit
        >{selectedValue}</Text>
      </TouchableOpacity>

      {/* Options Menu */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.option, selectedValue === item && styles.selectedOption]} // Change color for selected item
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            {allowAdding ? (
              <TouchableOpacity 
                style={styles.addOption} 
                onPress={() => { 
                  setVisible(false); 
                  setAddModalVisible(true); 
                }}
              >
                <Icon name="add" size={20} color="#007bff" />
                <Text style={styles.addOptionText}>הוספת {label}</Text>
              </TouchableOpacity>
            ):null}
          </View>
        </Pressable>
      </Modal>

      {/* Modal for adding new option */}
      <Modal transparent visible={addModalVisible} 
      animationType="fade"
      onOpen={() => {
        setTimeout(() => inputRef.current?.focus(), 300);
      }}
      >
        <Pressable style={styles.overlay} onPress={handlePressOutsideAddModal}> 
          <View 
            style={styles.addModalWrapper} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableOpacity style={styles.addModal} onPress={handlePressInsideAddModal}>
              <Text style={styles.addTitle}>הוסף {label} חדש</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={`הכנס ${label}`}
                value={newOption}
                onChangeText={setNewOption}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
                <Text style={styles.addButtonText}>הוסף</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 5, 
    paddingHorizontal: 8, 
    borderRadius: 20,
    justifyContent: "center",
    maxWidth: 150, 
    overflow: "hidden",
  },
  buttonText: { 
    fontSize: 12,
    color: "white",
    marginLeft: 5,
    textAlign: "center",
    numberOfLines: 1,
    ellipsizeMode: "tail", 
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdown: {
    backgroundColor: "#fff",
    width: "80%",
    height: "60%",
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 5,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  optionText: { fontSize: 16, color: "#333" },
  selectedOption: {
    backgroundColor: "#d1e7ff", 
  },
  addOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  addOptionText: { marginLeft: 5, fontSize: 16, color: "#007bff" },
  addModalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  addModal: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  addTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  addButtonText: { color: "white", fontSize: 16 },
});

export default SelectableDropdown;
