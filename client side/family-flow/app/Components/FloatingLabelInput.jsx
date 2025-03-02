import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FloatingLabelInput = ({ value, onChangeText, label }) => {
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (text) => {
    onChangeText(text); 
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
    setFocus(true);
  };

  return (
    <View style={styles.inputWrapper}>
      {/* תווית תמידית */}
      {(!value || value === '') && !focus && (
        <TouchableOpacity onPress={handleLabelPress}>
          <Text style={styles.placeholder}>{label}</Text>
        </TouchableOpacity>
      )}

      {/* שדה קלט */}
      {(value || focus) && (
        <TextInput
          ref={inputRef}
          value={value}
          style={styles.input}
          onChangeText={handleInputChange}
          underlineColorAndroid="transparent" // ביטול קו תחתון (למכשירים אנדרואיד)
          selectionColor="transparent" // אפשרות להוריד צבע בזמן פוקוס
          onFocus={() => setFocus(true)}
          onBlur={() => value === '' && setFocus(false)}
        />
      )}

      {/* תווית צפה */}
      {((value || value === '') || focus) && (
        <Text style={styles.floatingLabel}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 20,
    borderWidth:2,
    borderColor:'#333'
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // צבע תחתון
    fontSize: 16,
    textAlign: 'right', // הצבה בצד ימין
    paddingRight: 20, // רווח פנימי בצד ימין
    paddingTop: 20, // שולי עליונים
    opacity: 0, // שדה הקלט לא נראה, אך תופס מקום

  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 16,
    color: '#888',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1, // לוודא שהתווית תהיה מעל שדה הקלט
  },
  placeholder: {
    color: '#888',
    fontSize: 16,
   
  },
});

export default FloatingLabelInput;
