import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import GroceryListsScreen from "./GroceryListsScreen";
import HomePageScreen from "./HomePageScreen";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
         
          <HomePageScreen />
          
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
