import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";



const TaskEditScreen = () => {
  const router = useRouter();

return (
  <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
        </View>
)
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  header: {
    justifyContent: "space-between",
    marginBottom: 20,
    textAlign: "center",
  },

});

export default TaskEditScreen;
