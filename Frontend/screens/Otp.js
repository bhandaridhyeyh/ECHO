import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL} from '@env'
import Icon from 'react-native-vector-icons/Ionicons'; // For back arrow
import { ActivityIndicator } from 'react-native';

const Otp = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const email = route.params?.email; // Get email from route parameters
    const password = route.params?.password 
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleVerifyOtp = async () => {
        setLoading(true);
        setError(null);

        if (!otp) {
            setError('Please enter the OTP.');
            setLoading(false);
            return;
        }

        if (otp.length !== 6) { // Basic OTP validation
            setError('OTP must be 6 digits.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/user/register`, {
                email,
                otp,
            });

            if (response.status === 200) {
                // OTP verification successful
                Alert.alert(
                    'Success',
                    'Email verified successfully!  Please login to continue.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('Completeregister', { email, password }); // Navigate to login
                            }
                        }
                    ],
                    { cancelable: false }
                );

            } else {
                // Handle other status codes (optional, for more specific errors)
                setError('Invalid OTP. Please try again.');
                console.error('OTP verification failed:', response.data);
            }
        } catch (err) {
            // Handle network errors, server errors, etc.
            if (err.response) {
                setError(err.response.data.message || 'Failed to verify OTP. Server error.');
            } else {
                setError('Failed to connect to the server. Please check your network.');
            }
            console.error('Error verifying OTP:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Enter Verification Code</Text>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Removed Image Component */}
                    <Text style={styles.description}>
                        A verification code has been sent to your email address.  Please enter it below to verify your email.
                    </Text>

                    {/* OTP Input */}
                    <TextInput
                        ref={inputRef}
                        style={styles.otpInput}
                        placeholder="Enter OTP"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        maxLength={6} // OTP is typically 6 digits
                        value={otp}
                        onChangeText={setOtp}
                        textAlign="center"
                    />

                    {/* Error Message */}
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" /> // Show loader while verifying
                        ) : (
                            <Text style={styles.verifyButtonText}>Verify</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    /* Removed otpImage style */
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    otpInput: {
        width: '80%',
        padding: 15,
        borderRadius: 25,
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
        fontSize: 18,
        color: '#000',
    },
    verifyButton: {
        backgroundColor: '#59008F', // Match the button color
        padding: 15,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF0000',
        marginBottom: 10,
        fontSize: 14,
    },
});

export default Otp;
