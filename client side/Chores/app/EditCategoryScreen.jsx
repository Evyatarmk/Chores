import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useCategories } from "./Context/CategoryContext";
import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo-vector-icons installed
import NormalHeader from "./Components/NormalHeader";
import AlertModal from "./Components/AlertModal"; // Import your custom modal component

const EditCategoryScreen = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);

  const [name, setName] = useState('');
  const [homeId, setHomeId] = useState('');

  // Function to handle adding a category
  const handleAddCategory = () => {
    if (!name.trim() || !homeId.trim()) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    const newCategory = {
      name: name,
      homeId: parseInt(homeId),
    };

    addCategory(newCategory);
    setName('');
    setHomeId('');
  };

  // Function to handle deleting a category
  const handleDeleteCategory = (id) => {
    setCategoryIdToDelete(id);
    setModalVisible(true);  // Show the modal when user clicks delete
  };

  // Close the modal without deleting
  const closeModal = () => {
    setModalVisible(false);
  };

  // Confirm deletion and proceed to delete the category
  const confirmDelete = () => {
    deleteCategory(categoryIdToDelete);  // Call deleteCategory with the selected category ID
    closeModal();  // Close the modal after deletion
  };

  // Function to handle editing a category
  const handleEditCategory = (category) => {
    setName(category.name);
    setHomeId(category.homeId.toString());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NormalHeader title="חזור" />
      <Text style={styles.title}>Categories</Text>

      {categories.map((category) => (
        <View key={category.id} style={styles.row}>
          <Text style={styles.categoryText}>{category.name}</Text>

          <TouchableOpacity onPress={() => handleEditCategory(category)}>
            <Ionicons name="create-outline" size={24} color="blue" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDeleteCategory(category.id)}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.form}>
        <Text style={styles.label}>Category Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter category name"
        />

        <Text style={styles.label}>Home ID:</Text>
        <TextInput
          style={styles.input}
          value={homeId}
          onChangeText={setHomeId}
          placeholder="Enter Home ID"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add-circle-outline" size={30} color="green" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Delete Confirmation */}
      <AlertModal
        visible={modalVisible}
        onClose={closeModal}
        title="מחיקת קטגוריה"
        message="האם אתה בטוח שברצונך למחוק את הקטגוריה?"
        onConfirm={confirmDelete}
        confirmText="מחק"
        cancelText="ביטול"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  categoryText: {
    flex: 1,
    fontSize: 18,
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 18,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'green',
  },
});

export default EditCategoryScreen;
