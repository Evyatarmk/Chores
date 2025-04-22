import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useCategories } from "./Context/CategoryContext";
import { Ionicons } from '@expo/vector-icons';
import NormalHeader from "./Components/NormalHeader";
import AlertModal from "./Components/AlertModal";
import { useUserAndHome } from './Context/UserAndHomeContext';
import { v4 as uuidv4 } from 'uuid';
import Icon from "react-native-vector-icons/MaterialIcons";

const EditCategoryScreen = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const { use, home } = useUserAndHome();

  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Function to handle adding a category
  const handleAddCategory = () => {
    if (!name.trim() || !home?.id) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    const newCategory = {
      name: name,
      id: uuidv4(),
      homeId: home.id,
    };

    addCategory(newCategory);
    setName('');
  };

  // Function to handle deleting a category
  const handleDeleteCategory = (id) => {
    setCategoryIdToDelete(id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const confirmDelete = () => {
    deleteCategory(categoryIdToDelete);
    closeModal();
  };

  // Function to handle editing a category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setEditModalVisible(true);
  };

  const handleConfirmEdit = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategory({ ...editingCategory, name: newCategoryName });
      setEditModalVisible(false);
      setEditingCategory(null);
      setNewCategoryName('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NormalHeader title="עריכת קטגוריות" />

      {categories.map((category) => (
  <View key={category.id} style={styles.row}>
    <Text style={styles.categoryText}>{category.name}</Text>

    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => handleEditCategory(category)}>
      <Icon name={"edit"} size={30} color={ '#000'} style={styles.optionIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleDeleteCategory(category.id)}>
            <Icon name={"delete"} size={30} color={ "#ff4444"} style={styles.optionIcon} />
      </TouchableOpacity>
    </View>
  </View>
))}


      <View style={styles.form}>
        <Text style={styles.label}>שם הקטגוריה:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="הקלד שם לקטגוריה"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Text style={styles.addButtonText}>הוסף קטגוריה</Text>
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

      {/* Modal for Edit Category */}
      <Modal transparent visible={editModalVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>עריכת קטגוריה</Text>

            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="New category name"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>ביטול</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmEdit}
              >
                <Text style={styles.confirmText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal:5 // אפור בהיר רגוע
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: "#333",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  
  categoryText: {
    fontSize: 18,
    color: "#333",
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl",
  },
  
  iconContainer: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 5,
  },
  form: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "right",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
    width: "100%",

  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#e6f2ff",
    paddingVertical: 10,
    borderRadius: 15,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#007AFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 20,
    padding: 10,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
  },
});


export default EditCategoryScreen;
