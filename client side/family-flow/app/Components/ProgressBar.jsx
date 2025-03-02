import React from "react";
import { View, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

const ProgressBar = ({ totalItems, completedItems }) => {
  const progress = totalItems > 0 ? completedItems / totalItems : 0;

  return (
    <View style={styles.progressContainer}>
      <Progress.Bar 
        progress={progress} 
        width={null} 
        height={8} 
        color="#28a745" 
        unfilledColor="#ddd" 
        borderWidth={0} 
        animationType="spring"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: { flex: 1,},
});

export default ProgressBar;
