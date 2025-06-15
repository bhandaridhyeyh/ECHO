import { StyleSheet, Text, View, Alert, Image, SafeAreaView, Pressable, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAccessToken } from '../utilities/keychainUtils';
import { API_URL } from '@env'
import Icon from 'react-native-vector-icons/Ionicons';

const Ask = () => {
  const [isFlagged, setIsFlagged] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const textInputRef = useRef(null);
  const navigation = useNavigation();
  const prompts = ['Is this available?', 'Looking for notes', 'Can anyone lend this?'];
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getAccessToken();
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    };
    fetchUser();
  }, []);

  const handleImagePress = () => {
    setIsFlagged(!isFlagged);
  };

  useEffect(() => {
    if (isFlagged) {
      Alert.alert(
        "Flagged!",
        "Flags the post as urgent and important, making it visible at the top on your profile to notice."
      );
    }
  }, [isFlagged]);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 300); // 300ms delay to allow screen to settle

      return () => clearTimeout(timer);
    }, [])
  );

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt);
    setShowPrompts(false);
  };

  const handlePostClick = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to post an item.');
        navigation.navigate('Login'); // Redirect to login if no token
        return;
      }

      const response = await axios.post(`${API_URL}/echoes/creat`, {
        content: inputMessage,
        markedAsFlagged: isFlagged,  // Send flag status
      },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

      if (response.status === 201) {
        Alert.alert("Success", "Echo Posted Successfully!");
        setInputMessage('');
        setShowPrompts(true);
        setIsFlagged(false);
        navigation.navigate('Echoes');
      }
    }
    catch (error) {
      console.log('Error Posting:', JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to post. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 85}
      >
        <Text style={styles.heading}>Ask</Text>

        <View style={styles.inputContainer}>
          <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
            {user?.data?.ProfilePicture ? (
              <Image
                source={{ uri: user.data.ProfilePicture }}
                style={{ width: 40, height: 40, borderRadius: 20, marginTop: 5, marginRight: 5 }}
              />
            ) : (
              <Icon name="person-circle-outline" size={40} color="#888" />
            )}

            <TextInput
              ref={textInputRef}
              multiline={true}
              numberOfLines={50}
              placeholder='Want something? Ask for it...'
              placeholderTextColor={"#555"}
              style={styles.input}
              value={inputMessage}
              onChangeText={(text) => {
                setInputMessage(text);
                setShowPrompts(text.trim() === '');
              }}
            />
            <Pressable style={styles.post} onPress={handlePostClick}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Post</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showPrompts && (
        <View style={{ zIndex: 5, position: 'absolute', bottom: 110, marginStart: 15 }}>
          <Text style={{ color: '#555', fontSize: 15 }}>Try asking:</Text>
        </View>
      )}

      {showPrompts && (
        <View style={styles.promptsContainer}>
          {prompts.map((prompt, index) => (
            <Pressable key={index} onPress={() => handlePromptClick(prompt)} style={styles.prompt}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleImagePress}>
          {isFlagged ? (
            <Icon name="flag" size={20} color="red" />
          ) : (
            <Icon name="flag-outline" size={20} color="red" />
          )}
        </TouchableOpacity>

        {!isFlagged ? (
          <Text style={{ color: '#555', width: 350, fontSize: 15 }}>
            Mark it flagged!
          </Text>
        ) : (
          <Text style={{ color: '#555', width: 350, fontSize: 15 }}>Flagged <Icon name="checkmark" size={14} color="black" /></Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Ask;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 30,
    color: 'black',
    alignSelf: 'center',
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingTop: 10,
    flex: 1,
    gap: 10,
  },
  input: {
    backgroundColor: 'white',
    width: 300,
    textAlignVertical: 'top',
    color: 'black',
    paddingTop: 15,
    flex: 1,
    marginEnd: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 3,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    padding: 10,
    gap: 10,
  },
  post: {
    backgroundColor: '#350f55',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  promptsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  prompt: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'grey'
  },
  promptText: {
    color: 'grey',
    fontSize: 12
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  }
});