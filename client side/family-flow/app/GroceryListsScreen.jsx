import React from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useGrocery } from "./Context/GroceryContext";

const GroceryListsScreen = () => {
  const { groceryData } = useGrocery();
  const router = useRouter(); 

  const handleListPress = (listId) => {
    router.push({ pathname: "./GroceryItemsScreen", params: { listId: JSON.stringify(listId) } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groceryData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListPress(item.id)}>
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f4f4" },
  listItem: { padding: 16, backgroundColor: "#fff", marginBottom: 8, borderRadius: 5 },
  listTitle: { fontSize: 18 },
});

export default GroceryListsScreen;
