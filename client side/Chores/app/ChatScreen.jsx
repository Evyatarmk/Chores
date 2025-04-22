import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import PageWithMenu from './Components/PageWithMenu';
import { useUserAndHome } from './Context/UserAndHomeContext';
import { db } from './FirebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import moment from 'moment';
import { useNotification } from './Context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChatScreen() {
  const { user } = useUserAndHome();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  const { setUnreadCount } = useNotification();

  // controls whether new content auto‑scrolls
  const [autoScroll, setAutoScroll] = useState(true);

  // load messages and track last‑seen
  useEffect(() => {
    const houseId = user?.homeId;
    if (!houseId) return;

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
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetched);

      const lastSeenStr = await AsyncStorage.getItem(`lastSeen-${houseId}`);
      const lastSeen = lastSeenStr ? new Date(lastSeenStr) : new Date(0);
      const unseen = fetched.filter(msg =>
        new Date(msg.timestamp) > lastSeen && msg.sender !== user.name
      ).length;
      setUnreadCount(unseen);
    });

    return () => {
      AsyncStorage.setItem(`lastSeen-${houseId}`, new Date().toISOString());
      unsubscribe();
    };
  }, [user, setUnreadCount]);

  // auto‑scroll when content changes, but only if autoScroll is true
  const handleContentSizeChange = () => {
    if (autoScroll) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  };

  // detect user scroll up/down
  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
    const atBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    setAutoScroll(atBottom);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
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
      // scroll on send even if user hasn't scrolled away
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === user.id;
    const displayName = isCurrentUser ? user.name : item.sender;
    const senderImage = item.senderImage ||
      (isCurrentUser ? user.profilePicture : null) ||
      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

    return (
      <View style={[
        styles.messageRow,
        isCurrentUser ? styles.sentRow : styles.receivedRow,
      ]}>
        {!isCurrentUser && <Image source={{ uri: senderImage }} style={styles.profilePic} />}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}>
          <Text style={styles.senderName}>{displayName}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{moment(item.timestamp).format('HH:mm')}</Text>
        </View>
        {isCurrentUser && <Image source={{ uri: senderImage }} style={styles.profilePic} />}
      </View>
    );
  };

  return (
    <PageWithMenu>
      <ImageBackground
        source={require('./images/chatBackground.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {!user ? (
            <View style={styles.centeredMessage}>
              <Text style={styles.notLoggedInText}>
                יש להתחבר על מנת להשתמש בצ'אט
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                style={styles.messagesContainer}
                onContentSizeChange={handleContentSizeChange}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />

              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Icon name="send" size={20} color="#fff" />
                </TouchableOpacity>

                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="הקלד הודעה כאן..."
                  style={styles.input}
                />
              </View>
            </>
          )}
        </View>
      </ImageBackground>
    </PageWithMenu>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)', // overlay for readability
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
    fontSize: 16,
    color: '#2c3e50',
  },
  timestamp: {
    fontSize: 12,
    color: '#34495e',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: `white`,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'white',
    borderBottomColor: 'white',
    borderBottomWidth: 10,
    paddingLeft: 5,
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
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  sentRow: { justifyContent: 'flex-end' },
  receivedRow: { justifyContent: 'flex-start' },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sentMessage: {
    backgroundColor: '#90CAF9',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  receivedMessage: {
    backgroundColor: '#D1C4E9',
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
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
    marginRight: 4,


  },

  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

});
