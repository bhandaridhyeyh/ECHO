import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentUserId } from '../utilities/keychainUtils.js';
import socket from '../utilities/socket.js';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Conversation() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, chat, receiverId, receiverName, receiverDetails, receiverContact, receiverImage } = route.params;
  const [userId, setUserId] = useState(null);

  const prompts = ['Hello!', 'Can we meet?', 'Discount?', 'Close deal?'];

  const sortByTimestamp = (arr) =>
    arr
      .filter((msg) => msg.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  useEffect(() => {
    (async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    })();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (!userId || !receiverId) return;

    if (!socket || !socket.connected) {
      socket.connect();
      socket.emit("register", userId);
    }

    socket.emit(
      'getChatHistory',
      { userId, receiverId },
      (chatHistory) => {
        if (chatHistory?.messages?.length) {
          const formatted = chatHistory.messages.map((msg) => ({
            id: msg._id,
            text: msg.content,
            sender: msg.sender._id === userId ? 'me' : 'other',
            status: msg.status,
            timestamp: msg.timestamp,
          }));
          setMessages(sortByTimestamp(formatted));
          scrollToBottom();
        }
      }
    );

    const handleReceiveMessage = (message) => {
      const newMessage = {
        id: message._id,
        text: message.content,
        sender: 'other',
        status: message.status,
        timestamp: message.timestamp,
      };
      setMessages((prev) => sortByTimestamp([...prev, newMessage]));
      scrollToBottom();
    };

    const handleStatusUpdate = (update) => {
      setMessages((prev) =>
        sortByTimestamp(
          prev.map((msg) =>
            msg.id === update._id ? { ...msg, status: update.status } : msg
          )
        )
      );
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('messageStatusUpdate', handleStatusUpdate);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('messageStatusUpdate', handleStatusUpdate);
    };
  }, [userId, receiverId, scrollToBottom]);

  const sendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || !userId || !receiverId) return;

    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      text: trimmed,
      sender: 'me',
      status: 'sending',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => sortByTimestamp([...prev, newMessage]));
    setInputMessage('');
    scrollToBottom();

    socket.emit(
      'sendMessage',
      { chatId: chatId, senderId: userId, receiverId, content: trimmed },
      (ackMessage) => {
        if (ackMessage?._id) {
          setMessages((prev) =>
            sortByTimestamp(
              prev.map((msg) =>
                msg.id === tempId
                  ? {
                      ...msg,
                      id: ackMessage._id,
                      status: ackMessage.status,
                      timestamp: ackMessage.timestamp,
                    }
                  : msg
              )
            )
          );
        }
      }
    );
  };

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt);
    setShowPrompts(false);
  };

  const makeCall = () => {
    if (receiverContact) {
      Linking.openURL(`tel:${receiverContact}`);
    } else {
      alert('Phone number not available');
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        {item.timestamp && (
          <Text style={styles.statusText}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={{ backgroundColor: 'white' }}>
        <View style={styles.userInfo}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="chevron-back-outline" size={30} color="black" />
          </Pressable>
          <TouchableOpacity onPress={() => navigation.navigate('OtherUser', { userId: receiverId })} style={styles.userInfo1}>
            <Image
              style={{ width: 40, height: 40, borderRadius: 20 }}
              source={receiverImage ? { uri: receiverImage } : require('../assets/images/user.png')}
            />
            <View style={styles.userName}>
              <Text style={styles.userNameText}>{receiverName}</Text>
              <Text style={{ color: 'black' }}>{receiverDetails}</Text>
            </View>
          </TouchableOpacity>
          <Pressable onPress={makeCall}>
            <Icon name="call" size={30} color="black" />
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        onContentSizeChange={scrollToBottom}
      />

      { messages.length === 0 && showPrompts && (
        <View style={styles.promptsContainer}>
          {prompts.map((prompt, idx) => (
            <Pressable key={idx} onPress={() => handlePromptClick(prompt)} style={styles.prompt}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="grey"
          value={inputMessage}
          onChangeText={(text) => {
            setInputMessage(text);
            if (text.length > 0) setShowPrompts(false);
          }}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatList: { flex: 1, paddingHorizontal: 10, marginVertical: 10 },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessageContainer: {
    backgroundColor: '#59008F',
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    backgroundColor: '#555',
    alignSelf: 'flex-start',
  },
  messageText: { color: '#fff' },
  statusText: { color: '#ccc', fontSize: 10, marginTop: 2, textAlign: 'right' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    color: 'black',
  },
  sendButton: {
    backgroundColor: '#59008F',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  userInfo: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfo1: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    gap: 10,
  },
  userName: { flexDirection: 'column', justifyContent: 'center' },
  userNameText: { color: 'black', fontWeight: 'bold', fontSize: 17 },
  promptsContainer: {
    position: 'absolute',
    bottom: 75,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  prompt: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'grey',
  },
  promptText: { color: 'grey' },
});
