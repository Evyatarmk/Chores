import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// 1. Create the context
const NotificationContext = createContext();

// 2. Create the provider
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to send notifications!');
        return;
      }
    } else {
      handleRegistrationError('Must use physical device for notifications');
    }
  }

  function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  // 🛎 Schedule a local notification 1 day before the event date
  async function scheduleNotificationOneDayBefore(eventDate, title = 'Chore Reminder', body = 'You have a chore tomorrow!') {
    const triggerDate = new Date(eventDate);
    triggerDate.setDate(triggerDate.getDate() - 1); // Move 1 day earlier

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: triggerDate,
    });
  }


  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, scheduleNotificationOneDayBefore }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotification = () => useContext(NotificationContext);
