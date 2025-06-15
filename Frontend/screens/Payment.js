import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  Alert,
  Dimensions
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentUserId } from '../utilities/keychainUtils';
import socket from '../utilities/socket';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product,seller } = route.params;

  const dealId = `${product?._id?.slice(-8) || '84816554'}`;
  const productImageSource = product?.image
    ? { uri: product.image }
    : require('../assets/images/university.png');

  const [dealRequested, setDealRequested] = useState(false);
  const [timer, setTimer] = useState(300);
  const [dealAccepted, setDealAccepted] = useState(false);
  const [dealExpired, setDealExpired] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRequestDeal = () => {
    Alert.alert(
      'Request Deal',
      'Send a deal request to the seller. If accepted within 5 minutes, the deal will be completed.',
      [
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              const bid = await getCurrentUserId();
              if (!bid) {
                Alert.alert('Error', 'User ID not found');
                return;
              }

              const data = { sellerId: seller._id, buyerId: bid, postId: product._id };

              if (!socket || !socket.connected) {
                Alert.alert('Error', 'Seller is not online');
                return;
              }

              console.log('Emitting request-deal with data:', data);

              socket.emit('request-deal', data, (response) => {
                console.log('Response from server:', response);

                if (!response) {
                  Alert.alert('Error', 'No response from server');
                  return;
                }

                if (response.error) {
                  Alert.alert('Error', response.error);
                } else if (response.success) {
                  setDealRequested(true);
                  setDealExpired(false);
                  setDealAccepted(false);
                  setTimer(300)
                } else {
                  Alert.alert('Error', 'Unexpected response from server');
                }
              });
            } catch (err) {
              console.error('Error in handleRequestDeal:', err);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const dealAcceptedRef = useRef(dealAccepted);

  useEffect(() => {
    dealAcceptedRef.current = dealAccepted;
  }, [dealAccepted]);

  useEffect(() => {
    if (!dealRequested || dealAccepted || dealExpired || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setDealExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dealRequested, dealAccepted, dealExpired, timer]);

  useEffect(() => {
    if (!socket) return;

    const handleDealResponse = async (deal) => {
      console.log("Received deal response:", deal);

      if (deal.status === 'accepted') {
        setDealAccepted(true);
        setDealExpired(false);
        setTimer(0);
        Alert.alert('Deal Accepted', 'The seller has accepted your request.');

      } else if (deal.status === 'rejected') {
        setDealAccepted(false);
        setDealExpired(true);
        setTimer(0);
        Alert.alert('Deal Rejected', 'The seller has rejected your request.');
      }
    };

    socket.on('deal-response', handleDealResponse);

    return () => {
      socket.off('deal-response', handleDealResponse);
    };
  }, [socket]);

  const navigateToProductInfo = (product) => {
    navigation.navigate('ProductInfo', { product });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.heading}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-back-outline" size={30} color="black" />
        </Pressable>
        <Text style={styles.headingText}>Deal Summary</Text>
      </View>

      <View style={styles.card}>
        <Text style={{ color: 'black', fontSize: width * 0.045 }}>
          Deal ID: #{dealId}{'\n'}
        </Text>
        <Text style={{ color: 'black', fontSize: width * 0.045, fontWeight: 'bold' }}>
          Seller: {seller?.fullName || 'Unknown Seller'}
        </Text>
        <Text style={{ color: 'black', fontSize: width * 0.045, fontWeight: 'bold' }}>
          Total Amount: ₹ {product?.price || '0'}
        </Text>

        <View style={{ backgroundColor: '#d0d0d0', height: 3, marginVertical: 15 }} />

        <View style={styles.product}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Image
              style={{
                height: width * 0.35,
                width: width * 0.3,
                resizeMode: 'cover',
                borderRadius: 5
              }}
              source={productImageSource}
            />
            <View style={{ flexDirection: 'column', gap: 5, flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: width * 0.045, color: 'black' }}>
                {product?.title || 'No Title'}
              </Text>
              <Text style={{ color: 'black', fontSize: width * 0.04 }}>
                Price: ₹ {product?.price || '0'}
              </Text>
              {product?.quantity && (
                <Text style={{ color: 'black', fontSize: width * 0.04 }}>
                  Quantity: {product.quantity}
                </Text>
              )}
              <Pressable onPress={() => navigateToProductInfo(product)}>
                <Text style={{ color: '#732078', fontSize: width * 0.042, textDecorationLine: 'underline' }}>
                  View Description
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: '#d0d0d0', height: 3, marginVertical: 10 }} />

      {!dealRequested && (
        <Pressable onPress={handleRequestDeal} style={{ alignSelf: 'center' }}>
          <View style={styles.generate}>
            <Text style={{ fontSize: width * 0.05, color: 'white', fontWeight: 'bold' }}>
              Request Deal
            </Text>
          </View>
        </Pressable>
      )}

      {dealRequested && !dealAccepted && !dealExpired && (
        <Text style={styles.statusText}>
          Waiting for seller to accept... {formatTime(timer)}s left
        </Text>
      )}

      {dealAccepted && (
        <Text style={[styles.statusText, { color: 'green' }]}>
          Deal Accepted! 🎉 Deal Completed.
        </Text>
      )}

      {dealExpired && !dealAccepted && (
        <Text style={[styles.statusText, { color: 'red' }]}>
          Seller didn’t respond in time or deal expired.
        </Text>
      )}
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  heading: {
    color: 'black',
    fontWeight: 'bold',
    marginTop: 30,
    flexDirection: 'row',
    marginHorizontal: 15,
  },
  headingText: {
    color: 'black',
    fontSize: width * 0.065,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    width: width * 0.9,
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 5,
    padding: 15,
  },
  product: {
    flexDirection: 'column',
    height: 'auto',
    padding: 15,
  },
  generate: {
    paddingVertical: 10,
    backgroundColor: '#5D4F00',
    width: width * 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  statusText: {
    textAlign: 'center',
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
});