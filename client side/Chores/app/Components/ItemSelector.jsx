import React, { useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const ItemSelector = ({ items = [], onSelect, defaultSelected = null ,firstItem }) => {
  const [selectedItem, setSelectedItem] = useState(defaultSelected);
  const flatListRef = useRef(null);

  const handleSelect = (item) => {
    setSelectedItem(item);
    onSelect(item);
  };
  const filteredItems = Array.from(
    new Set(defaultSelected ? [firstItem,defaultSelected , ...items] : items)
  );
    return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        horizontal
        ref={flatListRef}
        inverted
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemButton,
              selectedItem === item && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text
              style={[
                styles.itemText,
                selectedItem === item && styles.selectedText,
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
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  selectedItem: {
    backgroundColor: "#1E90FF",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
});

export default ItemSelector;
