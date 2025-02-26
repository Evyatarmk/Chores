import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@rneui/base';
import { useRouter } from 'expo-router';

const NormalHeader = ({ title, onOptionPress }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>

      {/* כפתור חזור */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* כותרת */}
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>

     
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => openOptionsPanel(item)}
      >
        <Icon name="more-vert" size={24} color="#888" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: 'center',
    padding:10
  },
  optionButton: {
    borderRadius: 20,
    marginRight: 10, 
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
    flex: 1, // הכותרת תתפוס את כל החלל המרכזי,
  },
  placeholder: {
    width: 40, // למילוי החלל בצד ימין
  },
  optionsButton: {},

});

export default NormalHeader;
