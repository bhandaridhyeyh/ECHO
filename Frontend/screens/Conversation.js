// import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Image, Pressable, Linking } from 'react-native'
// import React, { useState, useRef , useEffect} from 'react'
// import io from 'socket.io-client';
// import { useNavigation } from '@react-navigation/native';
// const userId = "67ecb962b68701e520a0d553"
// const receiverId = "67ecb9adb68701e520a0d554"

// const SOCKET_SERVER_URL = 'http://192.168.19.29:3600';

// export default function Conversation() {
//     // const [messages, setMessages] = useState([
//     //     { id: '1', text: 'Hello! I am interested in your C - Programming book!', sender: 'me' },
//     //     { id: '2', text: 'Would you like to buy it? 😊', sender: 'other' },
//     //     { id: '3', text: 'Is it helpful for exams..?? 🤔', sender: 'me' },
//     //     { id: '4', text: 'Absolutely, even the faculty uses it for their reference.. 😅', sender: 'other' },
//     //     { id: '5', text: 'Okayy, where shall we meet then??', sender: 'me' },
//     //     { id: '6', text: 'Tea Post @ 4 pm tomorrow.?!', sender: 'other' },
//     // ]);

//     const [messages, setMessages] = useState([]);
//     const [inputMessage, setInputMessage] = useState('');
//     const flatListRef = useRef(null);
//     const socket = useRef(null);

//     useEffect(() => {
//         if (!socket.current) {

//             // Initialize socket connection
//             socket.current = io(SOCKET_SERVER_URL);

//             socket.current.on('connect', () => {
//                 console.log('Connected to chat server');

//                 // Join the chat with current user ID
//                 socket.current.emit('join', userId);

//                 // Get chat history
//                 if (userId && receiverId) {
//                     socket.current.emit('getChatHistory', userId, receiverId);
//                 }
//             });
//             socket.current.on('chatHistory', (chatHistory) => {
//                 const formattedMessages = chatHistory.map(msg => ({
//                     id: msg._id,
//                     text: msg.content,
//                     sender: msg.sender === userId ? 'me' : 'other',
//                     status: msg.status,
//                     timestamp: msg.timestamp
//                 }));
//                 setMessages(formattedMessages);

//                 // Scroll to the end after loading history
//                 if (flatListRef.current && formattedMessages.length > 0) {
//                     setTimeout(() => {
//                         flatListRef.current.scrollToEnd({ animated: false });
//                     }, 200);
//                 }
//             });
//             socket.current.on('receiveMessage', (message) => {
//                 const newMessage = {
//                     id: message._id,
//                     text: message.content,
//                     sender: 'other',
//                     status: message.status,
//                     timestamp: message.timestamp
//                 };

//                 setMessages(prevMessages => [...prevMessages, newMessage]);

//                 // Scroll to the end after receiving a new message
//                 if (flatListRef.current) {
//                     setTimeout(() => {
//                         flatListRef.current.scrollToEnd({ animated: true });
//                     }, 100);
//                 }
//             });
//             // Listen for message status updates
//             socket.current.on('messageStatusUpdate', (update) => {
//                 setMessages(prevMessages =>
//                     prevMessages.map(msg =>
//                         msg.id === update._id ? { ...msg, status: update.status } : msg
//                     )
//                 );
//             });
//             return () => {
//                 if (socket.current) {
//                     if (socket.current) {
//                         socket.current.off('chatHistory');
//                         socket.current.off('receiveMessage');
//                         socket.current.off('messageStatusUpdate');
//                         socket.current.disconnect();
//                     }
//                 }
//             };
//         }
// }, [userId, receiverId]);

//     // Function to send a new message
//     const sendMessage = () => {
//         if (inputMessage.trim()) {
//             socket.current.emit('sendMessage', userId, receiverId, inputMessage);
//             const newMessage = {
//                 id: Date.now().toString(),
//                 text: inputMessage,
//                 sender: 'me',
//             };
//             setMessages((prevMessages) => [...prevMessages, newMessage]);
//             setInputMessage('');
//             flatListRef.current.scrollToEnd({ animated: true }); // Scroll to the end after adding a new message
//         }
//     };

//     // Render a single message bubble
//     const renderMessage = ({ item }) => {
//         const isMyMessage = item.sender === 'me';
//         return (
//             <View
//                 style={[
//                     styles.messageContainer,
//                     isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
//                 ]}
//             >
//                 <Text style={styles.messageText}>{item.text}</Text>
//             </View>
//         );
//     };

//     const makeCall = () => {
//         const phoneNumber = '6351692454';
//         Linking.openURL(`tel:${phoneNumber}`);
//     };

//     const [showPrompts, setShowPrompts] = useState(true);

//     const prompts = ['Hello!', 'Can we meet?', 'Discount?', 'Close deal?']; // Example prompts

//     const handlePromptClick = (prompt) => {
//         setInputMessage(prompt); // Set the prompt as the message when clicked
//         setShowPrompts(false);
//     };

//     const navigation = useNavigation();

//     return (
//         <KeyboardAvoidingView
//             style={styles.container}
//             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust for keyboard overlap
//         >
//             <SafeAreaView style={{ backgroundColor: 'white' }}>
//                 <View style={styles.userInfo}>
//                     <Pressable onPress={() => navigation.goBack()}>
//                         <Image source={require('../assets/icons/icons8-back-38.png')} />
//                     </Pressable>
//                     <Image source={require('../assets/icons/icons8-male-user-50.png')} />
//                     <View style={styles.userName}>
//                         <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 17 }}>Namrata Kaur</Text>
//                         <Text style={{ color: 'black' }}>SY - BBA</Text>
//                     </View>
//                     <Pressable onPress={makeCall}>
//                         <Image source={require('../assets/icons/icons8-make-call-30.png')} />
//                     </Pressable>
//                 </View>
//             </SafeAreaView>
//             {/* Chat messages */}
//             <FlatList
//                 ref={flatListRef} // Set the ref to FlatList
//                 data={messages}
//                 renderItem={renderMessage}
//                 keyExtractor={(item) => item.id}
//                 style={styles.chatList}
//                 onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })} // Scroll to end on size change
//             />

//             {/* Floating prompts */}
//             {showPrompts && (
//                 <View style={styles.promptsContainer}>
//                     {prompts.map((prompt, index) => (
//                         <Pressable key={index} onPress={() => handlePromptClick(prompt)} style={styles.prompt}>
//                             <Text style={styles.promptText}>{prompt}</Text>
//                         </Pressable>
//                     ))}
//                 </View>
//             )}

//             {/* Input field and send button */}
//             <View style={styles.inputContainer}>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Type a message..."
//                     placeholderTextColor={'grey'}
//                     value={inputMessage}
//                     onChangeText={(text) => {
//                         setInputMessage(text);
//                         setShowPrompts(false);
//                     }}
//                 />
//                 <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//                     <Text style={styles.sendButtonText}>Send</Text>
//                 </TouchableOpacity>
//             </View>
//         </KeyboardAvoidingView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     chatList: {
//         flex: 1,
//         flexDirection: 'column',
//         paddingHorizontal: 10,
//         backgroundColor: '#fff',
//         marginVertical: 10
//     },
//     messageContainer: {
//         maxWidth: '70%',
//         padding: 10,
//         marginVertical: 5,
//         borderRadius: 10,
//     },
//     myMessageContainer: {
//         backgroundColor: '#59008F',
//         alignSelf: 'flex-end',
//     },
//     otherMessageContainer: {
//         backgroundColor: '#555',
//         alignSelf: 'flex-start',
//     },
//     messageText: {
//         color: '#fff',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         padding: 10,
//         borderTopWidth: 1,
//         borderTopColor: '#ddd',
//         backgroundColor: '#fff',
//     },
//     input: {
//         flex: 1,
//         padding: 10,
//         borderRadius: 25,
//         backgroundColor: '#f0f0f0',
//         marginRight: 10,
//         color: 'black'
//     },
//     sendButton: {
//         backgroundColor: '#59008F',
//         borderRadius: 25,
//         paddingHorizontal: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     sendButtonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//     },
//     userInfo: {
//         paddingHorizontal: 10,
//         paddingVertical: 12,
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderBottomColor: '#ddd',
//     },
//     userName: {
//         width: 210
//     },
//     promptsContainer: {
//         position: 'absolute',
//         bottom: 75, // Adjust this to control the distance from the chat input
//         left: 10,
//         right: 10,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-around'
//     },
//     prompt: {
//         backgroundColor: '#fff',
//         padding: 8,
//         borderRadius: 20,
//         margin: 4,
//         borderWidth: 1,
//         borderColor: 'grey'
//     },
//     promptText: {
//         color: 'grey'
//     }
// });

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
import React, {useState, useRef, useEffect, useCallback} from 'react';
import io from 'socket.io-client';
import {useNavigation, useRoute} from '@react-navigation/native';

const SOCKET_SERVER_URL = 'http://192.168.19.29:3600';

export default function Conversation() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const flatListRef = useRef(null);
  const socket = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();

  // Get userId from route params
  const userId = route.params?.userId;
  const receiverId = '67ecb9adb68701e520a0d554'; //  Hardcoded,

  const prompts = ['Hello!', 'Can we meet?', 'Discount?', 'Close deal?'];

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 100);
    }
  }, []);

  useEffect(() => {
    socket.current = io(SOCKET_SERVER_URL);

    socket.current.on('connect', () => {
      console.log('Socket connected');

      socket.current.emit('join', userId);

      if (userId && receiverId) {
        socket.current.emit('getChatHistory', userId, receiverId);
      }
    });

    socket.current.on('chatHistory', chatHistory => {
      const formattedMessages = chatHistory.map(msg => ({
        id: msg._id,
        text: msg.content,
        sender: msg.sender === userId ? 'me' : 'other',
        status: msg.status,
        timestamp: msg.timestamp,
      }));
      setMessages(formattedMessages);
      scrollToBottom();
    });

    socket.current.on('receiveMessage', message => {
      const newMessage = {
        id: message._id,
        text: message.content,
        sender: 'other',
        status: message.status,
        timestamp: message.timestamp,
      };
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    });

    socket.current.on('messageStatusUpdate', update => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === update._id ? {...msg, status: update.status} : msg,
        ),
      );
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off();
      }
    };
  }, [scrollToBottom, userId]); // Add userId as a dependency

  const sendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    const tempId = Date.now().toString();

    const newMessage = {
      id: tempId,
      text: trimmedMessage,
      sender: 'me',
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    scrollToBottom();

    socket.current.emit(
      'sendMessage',
      userId,
      receiverId,
      trimmedMessage,
      ackMessage => {
        if (ackMessage && ackMessage._id) {
          // Update the temp message with actual id and status from backend
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? {
                    ...msg,
                    id: ackMessage._id,
                    status: ackMessage.status,
                    timestamp: ackMessage.timestamp,
                  }
                : msg,
            ),
          );
        }
      },
    );
  };

  const handlePromptClick = prompt => {
    setInputMessage(prompt);
    setShowPrompts(false);
  };

  const makeCall = () => Linking.openURL(`tel:6351692454`);

  const renderMessage = ({item}) => {
    const isMyMessage = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        {item.status && (
          <Text style={styles.statusText}>
            {isMyMessage ? item.status : ''}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <SafeAreaView style={{backgroundColor: 'white'}}>
        <View style={styles.userInfo}>
          <Pressable onPress={() => navigation.goBack()}>
            <Image source={require('../assets/icons/icons8-back-38.png')} />
          </Pressable>
          <Image source={require('../assets/icons/icons8-male-user-50.png')} />
          <View style={styles.userName}>
            <Text style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
              Namrata Kaur
            </Text>
            <Text style={{color: 'black'}}>SY - BBA</Text>
          </View>
          <Pressable onPress={makeCall}>
            <Image
              source={require('../assets/icons/icons8-make-call-30.png')}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatList}
        onContentSizeChange={scrollToBottom}
      />

      {showPrompts && (
        <View style={styles.promptsContainer}>
          {prompts.map((prompt, index) => (
            <Pressable
              key={index}
              onPress={() => handlePromptClick(prompt)}
              style={styles.prompt}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={'grey'}
          value={inputMessage}
          onChangeText={text => {
            setInputMessage(text);
            setShowPrompts(false);
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
  container: {flex: 1, backgroundColor: '#fff'},
  chatList: {flex: 1, paddingHorizontal: 10, marginVertical: 10},
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
  messageText: {color: '#fff'},
  statusText: {color: '#ccc', fontSize: 10, marginTop: 2, textAlign: 'right'},
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
  sendButtonText: {color: '#fff', fontWeight: 'bold'},
  userInfo: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {width: 210},
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
  promptText: {color: 'grey'},
});
