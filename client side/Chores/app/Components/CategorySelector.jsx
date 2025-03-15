import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet } from "react-native";
import { useCategories } from "../Context/CategoryContext";

const CategorySelector = ({ onSelectCategory }) => {
  const { categories, addCategory } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.selectedCategory,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: "#1E90FF",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  addCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 10,
  },
});

export default CategorySelector;
