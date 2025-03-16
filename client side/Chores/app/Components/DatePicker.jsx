import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars"; // חבילה שמספקת את הקומפוננטה של היומן

const DatePicker = ({ onDateSelect, showModal, setShowModal }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  // קבלת תאריך היום ומחר
  const today = new Date().toISOString().split("T")[0]; // תאריך היום
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // תאריך מחר
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  // פונקציה שתפעיל כאשר התאריך משתנה
  const handleDayPress = useCallback((day) => {
    const newMarkedDates = { [day.dateString]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } };
    setSelectedDate(day.dateString); // עדכון התאריך הנבחר
    setMarkedDates(newMarkedDates); // עדכון markedDates עם התאריך החדש
  }, []);

  const handleQuickSelect = (date) => {
    if (date === null) {
      // אם נבחר "ללא תאריך", נעדכן את הסטייט לערך ריק
      setSelectedDate(""); // איפוס התאריך הנבחר
      setMarkedDates({}); // איפוס markedDates, כלומר, כל הסימונים יימחקו
    } else {
      // אחרת, נעדכן את התאריך הנבחר ונסמן אותו
      const newMarkedDates = { [date]: { selected: true, selectedColor: "blue", selectedTextColor: "white" } };
      setSelectedDate(date); // עדכון התאריך הנבחר
      setMarkedDates(newMarkedDates); // עדכון markedDates
    }
  };
  
  // פונקציה שתסגור את המודל בלי לבצע שום שינוי
  const handleCancel = () => {
    setSelectedDate(null); // איפוס התאריך הנבחר
    setShowModal(false); // סגירת המודל
  };

  // פונקציה שתשמור את התאריך הנבחר ותסגור את המודל
  const handleConfirm = () => {

    if (selectedDate != null) {
      onDateSelect(selectedDate); // מעביר את התאריך הנבחר להורה
    }
    setShowModal(false); // סוגר את המודל
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={showModal}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Calendar
            onDayPress={handleDayPress} // כאשר נבחר תאריך
            markedDates={markedDates} // סימון התאריכים הנבחרים
            monthFormat={"yyyy MM"} // פורמט התצוגה של החודש
            theme={{
              selectedDayBackgroundColor: 'blue',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00adf5',
            }}
            style={styles.calendar} // נוסיף את הסטייל שלנו לכאן
            minDate={today} // הגבלת הבחירה לתאריכים החל מהיום
          />

          <View style={styles.quickSelectContainer}>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => handleQuickSelect(today)} // בחירת "היום"
            >
              <Text style={styles.quickSelectButtonText}>היום</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => handleQuickSelect(tomorrowDate)} // בחירת "מחר"
            >
              <Text style={styles.quickSelectButtonText}>מחר</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => handleQuickSelect(null)} // בחירת "ללא תאריך"
            >
              <Text style={styles.quickSelectButtonText}>ללא תאריך</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel} // סגירת המודל ללא ביצוע שינוי
            >
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm} // אישור הבחירה של התאריך
            >
              <Text style={styles.confirmButtonText}>אישור</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  calendar: {
    height: 350, // גובה קבוע של 350 פיקסלים
    width: "100%", // מותאם לרוחב המלא של המסך
  },
 
  buttonsContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "45%",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  quickSelectContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  quickSelectButton: {
    backgroundColor: "#eeeeee",
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 8,
    width: "30%",
    marginVertical: 5,
  },
  quickSelectButtonText: {
    color: "#007bff",
    fontSize: 12,
    textAlign: "center",
  },
});

export default DatePicker;
