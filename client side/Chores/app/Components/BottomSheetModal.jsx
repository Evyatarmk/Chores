import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Modalize } from "react-native-modalize";
import Icon from "react-native-vector-icons/MaterialIcons";

const BottomSheetModal = ({ modalRef, onClose, title, children }) => {
  return (
    <Modalize ref={modalRef} adjustToContentHeight handlePosition="inside" onOverlayPress={onClose}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={styles.panelContent}>{children}</View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  panelHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  panelTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { padding: 5, backgroundColor: "#ededed", borderRadius: 20 },
  panelContent: { padding: 20 },

});

export default BottomSheetModal;
