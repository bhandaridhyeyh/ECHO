import React, {useState} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { API_URL } from '@env';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSignUp = async () => {
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
        navigation.navigate('Otp', {email}); // Navigate to Otp.js, passing the email
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter University mail ID"
                placeholderTextColor="#555"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('../assets/icons/icons8-lock-28.png')}
                style={styles.icon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Choose a password"
                placeholderTextColor="#555"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Confirm Password:</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('../assets/icons/icons8-lock-28.png')}
                style={styles.icon}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Rewrite password"
                placeholderTextColor="#555"
                style={styles.input}
              />
            </View>
          </View>

          <Pressable onPress={handleSignUp} style={styles.button}>
            <Image
              source={require('../assets/icons/icons8-arrow-50.png')}
              style={styles.buttonIcon}
            />
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
    marginTop: 40,
    color: '#AA8F00',
  },
  inputContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    color: 'black',
    fontSize: 17,
    marginBottom: 5,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'whitesmoke',
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 20,
    elevation: 3,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#555',
    fontSize: 17,
  },
  button: {
    backgroundColor: '#59008F',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    width: 70,
    alignSelf: 'center',
    marginTop: 50,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  loginText: {
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 17,
  },
});

export default Register;
