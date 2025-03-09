import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

const AlertModal = ({ visible, onClose, title, message, onConfirm, confirmText = "אישור", cancelText = "ביטול" }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onConfirm(); onClose(); }} style={styles.confirmButton}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  message: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 20 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  cancelButton: { flex: 1, padding: 12, backgroundColor: "#ddd", borderRadius: 10, marginRight: 10, alignItems: "center" },
  confirmButton: { flex: 1, padding: 12, backgroundColor: "#f44336", borderRadius: 10, alignItems: "center" },
  cancelText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  confirmText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
});

export default AlertModal;
