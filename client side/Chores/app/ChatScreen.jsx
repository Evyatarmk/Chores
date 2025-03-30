import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PageWithMenu from './Components/PageWithMenu';
import { useUserAndHome } from './Context/UserAndHomeContext';

export default function ChatScreen() {
  const { user } = useUserAndHome();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();  // Reference to the FlatList

  useEffect(() => {
    // Whenever messages update, scroll to the end of the FlatList
    if (messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: user.name,
        senderImage: user.profilePicture,
        timestamp: new Date().toISOString(),
        isSender: true
      };
      setMessages(previousMessages => [...previousMessages, newMessage]);  // Append new message
      setInputText('');
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={[styles.messageBubble, item.isSender ? styles.sentMessage : styles.receivedMessage]}>
      <Image source={{ uri: item.senderImage }} style={styles.profilePic} />
      <View style={styles.textContainer}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

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
    backgroundColor: '#e0e5ec', // Lighter blue-gray for the background
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#d1d8e0', // Slightly darker for the message bubbles
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
    color: '#2c3e50', // Dark blue for text, similar to the icon color
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#34495e', // A subtler dark shade for timestamps
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#bdc3c7' // Light gray for borders and separations
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
});