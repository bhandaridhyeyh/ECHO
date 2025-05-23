import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Image, 
  Pressable, 
  Alert, 
  Dimensions 
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'

const { width } = Dimensions.get('window');

const Payment = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params;

    const dealId = `${product?._id?.slice(-8) || '84816554'}`;

    const [otp, setOtp] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);

    const navigateToProductInfo = (product) => {
        navigation.navigate('ProductInfo', { product });
    };

    // Use the product's image URI directly or fallback image
    const productImageSource = product?.image
        ? { uri: product.image }
        : require('../assets/images/university.png');

    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };

    const handleGenerateOtp = () => {
        Alert.alert(
            'Generate OTP',
            'Once the seller enters the OTP on their device, the deal will be considered as completed!',
            [
                {
                    text: 'Proceed', 
                    onPress: () => {
                        setOtp(generateOtp());
                        setIsDisabled(true);
                        setTimer(30);
                    }
                }
            ]
        );
    };

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsDisabled(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                <Text style={styles.heading}>Deal Summary</Text>
            </View>
            <View style={styles.card}>
                <Text style={{ color: 'black', fontSize: width * 0.045 }}>Deal ID: #{dealId}{'\n'}</Text>
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

            <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold', fontSize: width * 0.04 }}>
                Generate OTP & share it with the seller.
            </Text>

            <Pressable onPress={handleGenerateOtp} disabled={isDisabled} style={{ alignSelf: 'center' }}>
                <View style={[styles.generate, isDisabled ? { backgroundColor: '#b0a040' } : {}]}>
                    <Text style={{ fontSize: width * 0.05, color: 'white', fontWeight: 'bold' }}>
                        {isDisabled ? `Regenerate OTP in ${timer}s` : 'Generate OTP'}
                    </Text>
                </View>
            </Pressable>

            {otp && (
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ color: 'black', fontSize: width * 0.05 }}>
                        Your OTP: <Text style={{ fontWeight: 'bold' }}>{otp}</Text>
                    </Text>
                </View>
            )}
        </SafeAreaView>
    )
}

export default Payment

const styles = StyleSheet.create({
    heading: {
        color: 'black',
        fontSize: width * 0.065,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30
    },
    card: {
        width: width * 0.9,
        alignSelf: 'center',
        marginVertical: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 5,
        padding: 15
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
    }
})