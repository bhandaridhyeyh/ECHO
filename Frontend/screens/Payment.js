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
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;

  const dealId = `${product?._id?.slice(-8) || '84816554'}`;
  const productImageSource = product?.image
    ? { uri: product.image }
    : require('../assets/images/university.png');

  const [dealRequested, setDealRequested] = useState(false);
  const [timer, setTimer] = useState(0);
  const [dealAccepted, setDealAccepted] = useState(false);
  const [dealExpired, setDealExpired] = useState(false);

  const handleRequestDeal = () => {
    Alert.alert(
      'Request Deal',
      'Send a deal request to the seller. If accepted within 5 minutes, the deal will be completed.',
      [
        {
          text: 'Send Request',
          onPress: () => {
            setDealRequested(true);
            setTimer(300); // 5 minutes = 300 seconds
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  useEffect(() => {
    let interval = null;

    if (dealRequested && timer > 0 && !dealAccepted) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    if (timer === 0 && dealRequested && !dealAccepted) {
      setDealExpired(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [dealRequested, timer, dealAccepted]);

  // Simulated seller acceptance (replace with actual logic)
  useEffect(() => {
    if (dealRequested && timer > 0) {
      const simulatedAcceptance = setTimeout(() => {
        setDealAccepted(true);
        setTimer(0);
      }, 10000); // seller accepts after 10 seconds

      return () => clearTimeout(simulatedAcceptance);
    }
  }, [dealRequested]);

  const navigateToProductInfo = (product) => {
    navigation.navigate('ProductInfo', { product });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text style={styles.heading}>Deal Summary</Text>
      </View>

      <View style={styles.card}>
        <Text style={{ color: 'black', fontSize: width * 0.045 }}>
          Deal ID: #{dealId}{'\n'}
        </Text>
        <Text style={{ color: 'black', fontSize: width * 0.045, fontWeight: 'bold' }}>
          Seller: {product?.seller?.fullName || 'Unknown Seller'}
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
          Waiting for seller to accept... {timer}s left
        </Text>
      )}

      {dealAccepted && (
        <Text style={[styles.statusText, { color: 'green' }]}>
          Deal Accepted! 🎉 Deal Completed.
        </Text>
      )}

      {dealExpired && !dealAccepted && (
        <Text style={[styles.statusText, { color: 'red' }]}>
          Seller didn’t respond in time. Deal Expired.
        </Text>
      )}
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  heading: {
    color: 'black',
    fontSize: width * 0.065,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
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