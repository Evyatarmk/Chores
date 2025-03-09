import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomSheetModal from "./BottomSheetModal";

const OptionsModal = ({ optionsModalRef, handleOptionSelect, options }) => {
  return (
    <BottomSheetModal modalRef={optionsModalRef} title="אפשרויות" onClose={() => optionsModalRef.current?.close()}>
      <View style={styles.panelContent}>
        {options.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => handleOptionSelect(option.action)} 
            style={styles.panelOption}
          >
            <Icon name={option.icon} size={20} color={option.iconColor || '#000'} style={styles.optionIcon} />
            <Text style={styles.panelOptionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetModal>
  );
  
};
const styles = StyleSheet.create({
  panelOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionIcon: {
    marginLeft: 10,
  },
  panelOptionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default OptionsModal;