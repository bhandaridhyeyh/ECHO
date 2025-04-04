import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, Alert, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'

const { width } = Dimensions.get('window');

const Payment = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params;

    const [otp, setOtp] = useState(null);
    const [timer, setTimer] = useState(0); // To track the countdown
    const [isDisabled, setIsDisabled] = useState(false); // To disable/enable the button

    const navigateToProductInfo = (product) => {
        navigation.navigate('ProductInfo', { product });
    };

    const imageMap = {
        book1: require('../assets/images/book1.jpg'),
        book2: require('../assets/images/book2.jpg'),
        book3: require('../assets/images/book3.jpg'),
        book4: require('../assets/images/book4.jpg'),
        notes1: require('../assets/images/notes1.jpg'),
        notes2: require('../assets/images/notes4.png'),
        notes3: require('../assets/images/notes2.jpg'),
        notes4: require('../assets/images/notes3.png'),
        tools1: require('../assets/images/tools5.jpg'),
        tools2: require('../assets/images/tools2.png'),
        tools3: require('../assets/images/tools3.jpg'),
        tools4: require('../assets/images/tools4.jpg'),
        gadget1: require('../assets/images/gadget1.png'),
        gadget2: require('../assets/images/gadget2.jpg'),
        gadget3: require('../assets/images/gadget3.png'),
        gadget4: require('../assets/images/gadget4.jpg'),
    };

    // Function to generate random OTP
    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
    };

    // Function to handle OTP generation
    const handleGenerateOtp = () => {
        Alert.alert(
            'Generate OTP',
            'Once the seller enters the OTP on their device, the deal will be considered as completed!',
            [
                {
                    text: 'Proceed', onPress: () => {
                        setOtp(generateOtp());
                        setIsDisabled(true); // Disable the button
                        setTimer(30); // Start 30-second countdown
                    }
                }
            ]
        );
    };

    // useEffect to handle countdown timer
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsDisabled(false); // Enable the button after 30 seconds
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
                <Text style={{ color: 'black', fontSize: width * 0.045 }}>Deal ID: #84816554{'\n'}</Text>
                <Text style={{ color: 'black', fontSize: width * 0.045, fontWeight: 'bold' }}>Seller: Namrata Kaur</Text>
                <Text style={{ color: 'black', fontSize: width * 0.045, fontWeight: 'bold' }}>Total Amount: ₹ {product.price}.0</Text>

                <View style={{ backgroundColor: '#d0d0d0', height: 3, marginVertical: 15 }} />

                <View style={styles.product}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Image
                            style={{
                                height: width * 0.35,
                                width: width * 0.3,
                                resizeMode: 'cover'
                            }}
                            source={imageMap[product.image]}
                        />
                        <View style={{ flexDirection: 'column', gap: 5, flex: 1 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: width * 0.045, color: 'black' }}>{product.name}</Text>
                            <Text style={{ color: 'black', fontSize: width * 0.04 }}>Price: ₹ {product.price}</Text>
                            <Text style={{ color: 'black', fontSize: width * 0.04 }}>Quantity: 1</Text>
                            <Pressable onPress={() => navigateToProductInfo(product)}>
                                <Text style={{ color: '#732078', fontSize: width * 0.042, textDecorationLine: 'underline' }}>View Description</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

            </View>

            <View style={{ backgroundColor: '#d0d0d0', height: 3, marginVertical: 10 }} />

            <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold', fontSize: width * 0.04 }}>Generate OTP & share it with the seller.</Text>

            <Pressable onPress={handleGenerateOtp} disabled={isDisabled} style={{ alignSelf: 'center' }}>
                <View style={[styles.generate, isDisabled ? { backgroundColor: '#b0a040' } : {}]}>
                    <Text style={{ fontSize: width * 0.05, color: 'white', fontWeight: 'bold' }}>
                        {isDisabled ? `Regenerate OTP in ${timer}s` : 'Generate OTP'}
                    </Text>
                </View>
            </Pressable>

            {otp && (
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ color: 'black', fontSize: width * 0.05 }}>Your OTP: <Text style={{ fontWeight: 'bold' }}>{otp}</Text></Text>
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
    paymentOptions: {
        flexDirection: 'column',
        margin: 20,
        alignSelf: 'center'
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioLabel: {
        marginLeft: 5,
        fontSize: 15,
        color: 'black'
    },
    option: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginVertical: 10,
        paddingVertical: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 10,
        elevation: 3,
        width: width * 0.9
    },
    button: {
        backgroundColor: '#350f55',
        height: 50,
        width: width * 0.9,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        elevation: 3
    },
    btn: {
        backgroundColor: '#350f55',
        alignItems: 'center',
        padding: 20,
        borderRadius: 100,
        width: width * 0.16, // Adjusted to be relative to width
        height: width * 0.16, // Ensuring it's a circle
        alignSelf: 'center',
        justifyContent: 'center'
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