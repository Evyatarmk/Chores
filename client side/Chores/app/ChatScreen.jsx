import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image } from 'react-native';
import PageWithMenu from './Components/PageWithMenu';
import { useUserAndHome } from './Context/UserAndHomeContext';
import { db } from './FirebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import moment from 'moment';
import { useNotification } from './Context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const { user } = useUserAndHome();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  const { setUnreadCount } = useNotification();

  useEffect(() => {
    const houseId = user?.homeId;
    if (!houseId) {
      console.warn("User has no house. Skipping chat loading.");
      return;
    }

    // כשנכנסים לצ'אט – עדכון זמן צפייה ואיפוס מונה
    const markAsSeen = async () => {
      await AsyncStorage.setItem(`lastSeen-${houseId}`, new Date().toISOString());
      setUnreadCount(0);
    };

    markAsSeen();

    const q = query(
      collection(db, 'houses', houseId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMessages(fetchedMessages);

      const lastSeenStr = await AsyncStorage.getItem(`lastSeen-${houseId}`);
      const lastSeen = lastSeenStr ? new Date(lastSeenStr) : new Date(0);

      const unseenCount = fetchedMessages.filter(msg => {
        const msgTime = new Date(msg.timestamp);
        return msgTime > lastSeen && msg.sender !== user.name;
      }).length;

      setUnreadCount(unseenCount);

      // גלילה לסוף
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });

    return () => {
      const now = new Date().toISOString();
      AsyncStorage.setItem(`lastSeen-${houseId}`, now);
      unsubscribe();
    };
  }, []);


  const handleSend = async () => {
    if (inputText.trim()) {
      const houseId = user?.homeId || "defaultHouse";

      const newMessage = {
        text: inputText,
        senderId: user.id,
        sender: user.name,
        senderImage: user.profilePicture,
        timestamp: new Date().toISOString(),
        isSender: true
      };

      try {
        await addDoc(collection(db, 'houses', houseId, 'messages'), newMessage);
        setInputText('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };
  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === user.id;
    const displayName = isCurrentUser ? user.name : item.sender;


    // נשתמש בתמונה מההודעה, ואם אין – ננסה לשלוף מהקונטקסט או ברירת מחדל
    const senderImage =
      item.senderImage ||
      (isCurrentUser ? user.profilePicture : null) ||
      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

    return (
      <View
        style={[
          styles.messageRow,
          isCurrentUser ? styles.sentRow : styles.receivedRow,
        ]}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: senderImage }}
            style={styles.profilePic}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          <Text style={styles.senderName}>{displayName}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {moment(item.timestamp).format('HH:mm')}
          </Text>
        </View>

        {isCurrentUser && (
          <Image
            source={{ uri: senderImage }}
            style={styles.profilePic}
          />
        )}
      </View>
    );
  };



  return (
    <PageWithMenu>
      <View style={styles.container}>
        {!user ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.notLoggedInText}>יש להתחבר על מנת להשתמש בצ'אט</Text>
          </View>
        ) : (
          <>
            {/* FlatList וכל הצ'אט הרגיל */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={item => item.id}
              style={styles.messagesContainer}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }}
            />
  
            <View style={styles.inputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                style={styles.input}
              />
              <Button
                title="Send"
                onPress={handleSend}
                color="#075E54"
              />
            </View>
          </>
        )}
      </View>
    </PageWithMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#e0e5ec',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    flexDirection: 'column',
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#d1d8e0',
    borderRadius: 20,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  messageText: {
    color: '#2c3e50',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#34495e',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#bdc3c7',
    borderBottomWidth: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // כדי שהתמונה תהיה למעלה
    marginVertical: 6,
  },

  sentRow: {
    justifyContent: 'flex-end',
  },
  receivedRow: {
    justifyContent: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sentMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  receivedMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },  
});
