// ProductInfo.js
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  ImageBackground,
  Linking,
  Share,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { getCurrentUserId, getAccessToken } from '../utilities/keychainUtils';
import axios from 'axios';
import { API_URL } from '@env'
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ProductInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product} = route.params; // Extract product from route parameters
  const { width: screenWidth } = useWindowDimensions();
  const [seller, setSeller] = useState(
    typeof product?.seller === 'object' ? product?.seller : null
  );
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = await getCurrentUserId(); // this is just an ID string
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    console.log("ProductInfo received product:", product);
  }, []);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (typeof product?.seller === 'string') {
        try {
          const token = await getAccessToken();
          const response = await axios.get(`${API_URL}/user/profile/${product.seller}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data?.data) {
            setSeller(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching seller details:', error);
        }
      }
    };

    fetchSellerDetails();
  }, [product?.seller]);

  const handleChatPress = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to post an item.');
        navigation.navigate('Login');
        return;
      }
      const participant_id1 = await getCurrentUserId();
      const participant_id2 = seller?._id;

      if (participant_id1 === participant_id2) {
        Alert.alert("Notice", "You cannot chat with yourself.");
        return;
      }

      const response = await axios.post(`${API_URL}/Chat/create`, {
        participant_id1,
        participant_id2,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Chat created:', response.data.data);
      navigation.navigate('Conversation', {
        chatId: response.data.data._id,
        receiverId: participant_id2,
        receiverName: seller?.fullName,
        receiverDetails: `${seller?.course} - ${seller?.program}`,
        receiverImage: typeof seller?.ProfilePicture === 'string' ? seller.ProfilePicture : null,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Use the product data to determine the image source
  // Assuming your product object has an 'Productpicture' property which is the URI
  const productImageSource = product?.image
    ? { uri: product.image }
    : require('../assets/images/university.png'); // Fallback image

  // Convert the createdAt timestamp to a Date object
  const createdAtDate = new Date(product?.createdAt);

  // Format the date (you can customize this format)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  const formattedDate = createdAtDate.toLocaleDateString('en-IN', options); // Using 'en-IN' locale for India

  const navigateToPayment = product => {
    navigation.navigate('Payment', { product ,seller });
  };

  const makeCall = async () => {
    const participant_id1 = await getCurrentUserId(); // current user
    const participant_id2 = seller?._id;     // seller
    const phoneNumber = seller?.contactNumber;

    if (participant_id1 === participant_id2) {
      Alert.alert("Notice", "You cannot call your own number.");
      return;
    }

    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert("Phone number not available.");
    }
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this amazing product sold by your friend: ${String(
          product?.title,
        )} at just ₹${String(product?.price)}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with an activity (e.g., shared via a specific app)
        } else {
          // Shared without specifying the app
        }
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong while trying to share the product.',
      );
    }
  };

  const handleSellerPress = async () => {
    const currentUserId = await getCurrentUserId();
    if (seller?._id === currentUserId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('OtherUser', { userId: seller?._id });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: 'white', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="chevron-back-outline" size={30} color="grey" />
          </Pressable>
          <Pressable style={{ flex: 1, marginLeft: 10 }}>
            <View style={[styles.searchbar, { width: '100%' }]}>
              <Icon name="search" size={24} color="grey" />
              <TextInput
                placeholder="Search here"
                placeholderTextColor={'#555'}
                style={{ fontSize: 17, color: 'black', flex: 1, marginRight: 10 }}
              />
            </View>
          </Pressable>
        </View>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 20,
            marginHorizontal: 20,
          }}>
          {product?.createdAt && (
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{ color: 'black', fontSize: 16, marginTop: 4, marginLeft: 4 }}>
                Uploaded On
              </Text>
              <Text style={{ color: 'black', fontSize: 12, marginLeft: 4 }}>
                {formattedDate}
              </Text>
            </View>
          )}
        </Text>

        <View style={{ alignItems: 'center' }}>
          <ImageBackground
            style={{
              width: screenWidth * 0.85,
              height: screenWidth * 0.85,
              marginTop: 8,
              resizeMode: 'contain',
            }}
            source={productImageSource} // Use the dynamic image source
          >
            <View style={styles.icons}>
              <Pressable onPress={onShare}>
                <MaterialIcons name="share" size={24} color="black" />
              </Pressable>
              <Icon name="heart-outline" size={24} color="black" />
            </View>
          </ImageBackground>
        </View>

        {/* <View
        //   style={{height: 20, backgroundColor: 'whitesmoke', marginTop: 16}}
        /> */}

        <View style={styles.details}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 20,
              marginVertical: 15,
            }}>
            {String(product?.title)}
          </Text>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 20,
              marginBottom: 15,
            }}>
            Price: ₹ {String(product?.price)}
          </Text>
          {product?.Status && (() => {
            const status = product.Status.toLowerCase();
            const statusColor = status === 'available' ? 'green' : status === 'sold' ? 'red' : 'orange';

            return (
              <Text style={{ color: statusColor, fontSize: 17, marginBottom: 15 }}>
                Status: {status.toUpperCase()}
              </Text>
            );
          })()}
          {product?.quantity && (
            <Text style={{ color: 'black', fontSize: 17, marginBottom: 15 }}>
              Quantity: {String(product?.quantity)}
            </Text>
          )}
          <Text
            style={{
              color: 'black',
              fontSize: 17,
              marginBottom: 10,
              fontWeight: 'bold',
            }}>
            Description:
          </Text>
          <View style={[styles.descriptionBox, { width: '100%' }]}>
            <Text style={{ color: 'black', fontSize: 17 }}>
              {product?.description || '- No description provided -'}
            </Text>
          </View>
          {currentUserId &&
            currentUserId.toString() !== product?.seller?._id?.toString() &&
            product?.Status?.toLowerCase() !== 'sold' && (
              <Pressable onPress={() => navigateToPayment(product)}>
                <View style={styles.btn}>
                  <FontAwesome name="handshake-o" size={30} color="white" />
                  <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                    Close Deal
                  </Text>
                </View>
              </Pressable>
            )}
        </View>

        <View
          style={{
            height: 20,
            backgroundColor: 'whitesmoke',
            marginVertical: 15,
          }}
        />

        <View style={styles.details}>
          <Text
            style={{
              color: 'black',
              fontSize: 17,
              marginBottom: 10,
              fontWeight: 'bold',
            }}>
            Posted by:
          </Text>
          <Pressable onPress={handleSellerPress}>
            <View style={styles.postedByContainer}>
              <Image
                style={{ width: 40, height: 40, borderRadius: 20 }}
                source={
                  seller?.ProfilePicture
                    ? { uri: seller.ProfilePicture }
                    : require('../assets/images/user.png')
                }
              />
              <Text style={styles.postedByText}>
                <Text style={{ fontWeight: 'bold' }}>{seller?.fullName}</Text>
                {'\n'}
                {seller?.course} - {seller?.program}
              </Text>
            </View>
          </Pressable>

          {/* Display the formatted creation date */}
        </View>
      </ScrollView>
      {currentUserId && currentUserId.toString() !== product?.seller?._id?.toString() && (
        <View style={styles.footer}>
          <Pressable style={styles.footerButton} onPress={handleChatPress}>
            <Text style={styles.footerButtonText}>CHAT</Text>
          </Pressable>
          <Pressable style={styles.footerButton} onPress={makeCall}>
            <Text style={styles.footerButtonText}>CALL</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ProductInfo;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  searchbar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 1,
    elevation: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  icons: {
    gap: 15,
    alignSelf: 'flex-end',
    marginHorizontal: 15,
    marginTop: 20,
  },
  details: {
    marginHorizontal: 20,
    flexDirection: 'column',
    marginTop: 2,
  },
  descriptionBox: {
    height: 'auto',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'grey',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 2,
    borderColor: '#ccc',
    elevationTop: 300,
    paddingHorizontal: 20,
  },
  footerButton: {
    padding: 10,
    backgroundColor: '#5D4F00',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  btn: {
    paddingVertical: 10,
    backgroundColor: '#5D4F00',
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  postedByContainer: {
    height: 'auto',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20, // Reduced margin to accommodate the date
    backgroundColor: 'white',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  postedByText: {
    color: 'black',
    fontSize: 17,
    flex: 1,
  },
});