import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { API_URL } from '@env';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const handleSignUp = async () => {
    setLoading(true);
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/user/sendotp`,
        {
          email,
          password,
        },
      );

      if (response.status === 200) {
        Alert.alert(
          'OTP Sent',
          'Please check your email for the verification code.',
        );
        navigation.navigate('Otp', { email }); // Navigate to Otp.js, passing the email
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Failed to send OTP. Please try again.',
        );
      }
    } catch (error) {
      let errorMessage =
        'Something went wrong. Please check your internet connection and try again.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
        </View>

        <KeyboardAvoidingView>
          <View style={styles.header}>
            <Text style={styles.title}>ECHO</Text>
            <Text style={styles.subtitle}>Register to your Account</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail:</Text>
            <View style={styles.inputWrapper}>
              <Icon name="mail-outline" size={24} color="#555" style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                placeholder="Enter University mail ID"
                placeholderTextColor="#555"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-closed-outline" size={24} color="#555" style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                secureTextEntry={!showPassword}
                placeholder='Choose a Password'
                placeholderTextColor={"#555"}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color="#555"
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirm Password:</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-closed-outline" size={24} color="#555" style={styles.icon} />
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
                onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                secureTextEntry={!showPassword1}
                placeholder='Rewrite Password'
                placeholderTextColor={"#555"}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword1(!showPassword1)} hitSlop={10}>
                <Icon
                  name={showPassword1 ? 'eye' : 'eye-off'}
                  size={24}
                  color="#555"
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleSignUp} style={styles.btn} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="arrow-forward" size={31} color="white" style={styles.btnIcon} />
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}>
              Already have an account? Login
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    height: 179,
    width: 273.74,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 55,
    color: '#59008F',
    fontWeight: 'bold',
    fontFamily: 'Bungee-Regular',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#AA8F00',
  },
  inputContainer: {
    marginTop: height * 0.001,
    marginBottom: height * 0.03,
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    color: 'black',
    fontSize: 17,
    marginTop: height * 0.025, // Responsive margin top
    marginBottom: height * 0.01,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    backgroundColor: 'whitesmoke',
    paddingHorizontal: width * 0.03, // Responsive padding
    width: width * 0.8, // Responsive width
    elevation: 3,
    marginHorizontal: width * 0.01, // Responsive margin
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    color: "#555",
    fontSize: width * 0.045, // Responsive font size
    flex: 1, // Take remaining space
    paddingVertical: height * 0.015, // Responsive vertical padding
  },
  btn: {
    backgroundColor: '#59008F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.025, // Responsive padding
    borderRadius: width * 0.5, // Make it circular
    width: width * 0.18, // Responsive width
    height: width * 0.18, // Responsive height
    alignSelf: 'center',
  },
  btnIcon: {
    width: width * 0.08, // Responsive icon size
    height: width * 0.08, // Responsive icon size
    resizeMode: 'contain',
  },
  loginText: {
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 17,
  },
});

export default Register;
