import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Pressable, TextInput, Dimensions, LogBox, Alert } from 'react-native';
import { API_URL } from '@env';
import axios from 'axios';
import { getAccessToken, getCurrentUserId } from '../utilities/keychainUtils';

LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
]);

const BuyingChats = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const currentUserId = await getCurrentUserId();
        setCurrentUserId(currentUserId);
        const token = await getAccessToken();
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in to post an item.');
          navigation.navigate('Login');
          return;
        }
        const res = await axios.get(`${API_URL}/Chat/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setChats(data);
        setFilteredChats(data);
      } catch (err) {
        console.log('Error fetching chats:', JSON.stringify(err, null, 2));
      }
    };
    fetchChats();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => {
        const otherUser = chat.participants.find(p => p._id !== currentUserId);
        return otherUser?.fullName?.toLowerCase().includes(text.toLowerCase());
      });
      setFilteredChats(filtered);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <Text style={styles.heading}>Chats</Text>
      <View style={styles.header}>
        <Pressable style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.searchbar, { width: screenWidth * 0.9 }]}>
            <Image
              source={require('../assets/icons/icons8-search-24.png')}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search from your chats"
              placeholderTextColor="#555"
              style={[styles.searchInput, { width: '85%' }]}
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.details}>
        {filteredChats.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
            No chats found.
          </Text>
        ) : (
          filteredChats.map((chat, idx) => {
            const otherUser = chat.participants.find(p => p._id !== currentUserId);
            return (
              <React.Fragment key={chat._id || idx}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Conversation', {
                      chatId: chat._id,
                      chat,
                      receiverId: otherUser._id,
                      receiverName: otherUser.fullName,
                      receiverDetails: `${otherUser.course} - ${otherUser.program}`,
                      receiverImage: typeof otherUser?.ProfilePicture === 'string' ? otherUser.ProfilePicture : null,
                    })
                  }
                >
                  <View style={[styles.chat, { width: screenWidth * 0.95 }]}>
                    <Image
                      source={
                        otherUser?.ProfilePicture
                          ? { uri: otherUser.ProfilePicture }
                          : require('../assets/images/user.png')
                      }
                      style={styles.chatImage}
                    />
                    <View style={{ marginLeft: 12, width: '60%', justifyContent: 'center' }}>
                      <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>
                        {otherUser?.fullName || 'Unknown User'}
                      </Text>
                      <Text style={{ color: 'black' }}>
                        {otherUser?.course} - {otherUser?.program}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                {idx < filteredChats.length - 1 && (
                  <View style={[styles.separator, { width: screenWidth * 0.9 }]} />
                )}
              </React.Fragment>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
};

export default BuyingChats;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  heading: {
    color: 'black',
    textAlign: 'center',
    fontSize: 30,
    marginVertical: '5%'
  },
  details: {
    flexDirection: 'column',
    marginTop: '0.5%',
    alignSelf: 'center',
    width: '95%',
    flexGrow: 1,
  },
  tabBar: {
    backgroundColor: '#350f55',
    elevation: 10
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#fff',
    height: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
    marginBottom: '5%'
  },
  searchbar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 1,
    elevation: 4,
    paddingHorizontal: '2.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2%',
    paddingVertical: '1%',
  },
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  searchInput: {
    fontSize: 17,
    color: 'black',
    flex: 1,
  },
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2%',
    paddingVertical: '3%',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  separator: {
    height: 0.5,
    backgroundColor: "grey",
    alignSelf: 'center',
    marginTop: '2%',
    marginBottom: '2%',
  },
  noChatImage: {
    marginVertical: '5%',
    resizeMode: 'contain',
  },
  noChatText: {
    color: 'grey',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: '5%',
  },
  post: {
    alignSelf: 'center',
    backgroundColor: "#5D4F00",
    width: '60%',
    marginTop: '7.5%',
    height: 'auto',
    elevation: 3,
    padding: '3%',
    borderRadius: 10,
  },
  postText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});