import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image } from 'react-native';
import PageWithMenu from './Components/PageWithMenu';
import { useUserAndHome } from './Context/UserAndHomeContext';
import { db } from './FirebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import moment from 'moment';
import { useNotification } from './Context/NotificationContext';


export default function ChatScreen() {
  const { user } = useUserAndHome();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();  // Reference to the FlatList

  const { setUnreadCount } = useNotification();

  useEffect(() => {
    const houseId = user?.homeId || "defaultHouse";
    const q = query(
      collection(db, 'houses', houseId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
    });

    setUnreadCount(0); 
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      const houseId = user?.homeId || "defaultHouse";

      const newMessage = {
        text: inputText,
        sender: user.name,
        senderImage: user.profilePicture,
        timestamp: new Date().toISOString(),
        isSender: true
      };

      try {
        await addDoc(collection(db, 'houses', houseId, 'messages'), newMessage);
        setInputText('');
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.sender === user.name;
  
    return (
      <View style={[
        styles.messageRow,
        isCurrentUser ? styles.sentRow : styles.receivedRow
      ]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.senderImage }} style={styles.profilePic} />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage
        ]}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {moment(item.timestamp).format('HH:mm')} {/* You can change format */}
          </Text>
        </View>
        {isCurrentUser && (
          <Image source={{ uri: item.senderImage }} style={styles.profilePic} />
        )}
      </View>
    );
  };

  return (
    <PageWithMenu>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          style={styles.messagesContainer}
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
    flexDirection: 'column', // Stack sender name above the message text
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#d1d8e0',
    borderRadius: 20,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
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
    alignItems: 'flex-end',
    marginVertical: 4,
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
    marginBottom: 4, // Give a little more space between name and message
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
});
