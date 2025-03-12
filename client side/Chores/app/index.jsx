import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import HomePageScreen from "./HomePageScreen";
import 'react-native-get-random-values';

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
