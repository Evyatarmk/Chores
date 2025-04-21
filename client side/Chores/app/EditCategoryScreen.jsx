import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useCategories } from "./Context/CategoryContext";
import { Ionicons } from '@expo/vector-icons';
import NormalHeader from "./Components/NormalHeader";
import AlertModal from "./Components/AlertModal";
import { useUserAndHome } from './Context/UserAndHomeContext';
import { v4 as uuidv4 } from 'uuid';

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
      <NormalHeader title="חזור" />
      <Text style={styles.title}>הוספת קטגוריה</Text>

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
        <Text style={styles.label}>שם הקטגוריה:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="הקלד שם לקטגוריה"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add-circle-outline" size={30} color="green" />
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
    marginBottom: 10,
    alignItems: "center",
    textAlign: "right",
    writingDirection: "rtl", // 💡 חשוב למובייל 

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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
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
    backgroundColor: 'green',
    borderRadius: 5,
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
