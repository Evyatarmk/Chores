import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/base';
import { useRouter } from 'expo-router';

const NormalHeader = ({ title, onOptionPress, targetScreen }) => {
  const router = useRouter();

  const handleNavigate = () => {
    if (targetScreen) {
      router.push(targetScreen); // ניווט לדף שצוין ב-targetScreen
    }else{

      router.back()
    }
  };

  return (
    <View style={styles.header}>
      {/* כפתור חזור */}
      <TouchableOpacity onPress={() => handleNavigate()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* כותרת */}
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>

      {/* כפתור אפשרויות - יוצג רק אם onOptionPress קיים */}
      {onOptionPress && (
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={onOptionPress}
        >
          <Icon name="more-vert" size={24} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#333",
    textAlign: 'right',
    flex: 1, 
  },
  optionsButton: {
    padding: 5,
  },
  navigateButton: {
    padding: 5,
    borderRadius: 20,
  },
});

export default NormalHeader;
