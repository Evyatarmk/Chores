import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ErrorNotification = ({ visible, message, duration = 3000 ,onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); 

  useEffect(() => {
    if (visible && message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose()); // קריאה ל-onClose בסיום האנימציה
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  if (!visible || !message) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ErrorNotification;
