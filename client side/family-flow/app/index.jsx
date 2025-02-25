import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import GroceryListsScreen from "./GroceryListsScreen";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
          <GroceryListsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
