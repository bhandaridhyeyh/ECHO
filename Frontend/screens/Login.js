import { StyleSheet, Text, View, SafeAreaView, Image, KeyboardAvoidingView, TextInput, Pressable, Alert, ScrollView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { storeAccessToken } from '../utilities/keychainUtils'; // Import the storeAccessToken function

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Replace this with your backend API URL
  const BASE_URL = '';

  const SignIn = async () => {
    try {
      const response = await axios.post(`http://192.168.29.241:3600/user/login`, { // Adjust the endpoint if necessary
        email: email,
        password: password,
      });

      // Assuming your backend sends back user data and tokens upon successful login
      if (response.status === 200) {
        const { accessToken } = response.data.data; // Adjust based on your actual response structure

        // Store the access token securely using keychainUtils
        const storedSuccessfully = await storeAccessToken(accessToken);

        if (storedSuccessfully) {
          Alert.alert("Login Successful!");
          navigation.navigate("Main");
        } else {
          Alert.alert("Error", "Failed to securely store the access token. Please try again.");
        }
      } else {
        // Handle other successful status codes if needed (though 200 is typical for success)
        Alert.alert("Login Failed", "Invalid credentials.");
      }

    } catch (error) {
      console.error("Login Error:", error);
      let errorMessage = "Something went wrong. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logoImage}
            source={require('../assets/images/logo.png')} />
        </View>

        <KeyboardAvoidingView style={styles.keyboardAvoidingView}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>ECHO</Text>
            <Text style={styles.login}>Login to your Account</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.mail}>
              <Image source={require('../assets/icons/icons8-email-28.png')} style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder='E - Mail' placeholderTextColor={"#555"} style={styles.input} />
            </View>
            <View style={styles.pw}>
              <Image source={require('../assets/icons/icons8-lock-28.png')} style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                placeholder='Password' placeholderTextColor={"#555"} style={styles.input} />
            </View>
            <Text style={styles.forgotPW}>Forgot Password?</Text>
          </View>

          <Pressable onPress={SignIn} style={styles.btn}>
            <Image source={require('../assets/icons/icons8-arrow-50.png')} style={styles.btnIcon} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20, // Add some padding at the bottom if needed
  },
  logoContainer: {
    marginTop: height * 0.04, // Responsive margin top
  },
  logoImage: {
    height: height * 0.25, // Responsive height
    width: width * 0.7, // Responsive width
    alignSelf: 'center',
    resizeMode: 'contain', // Maintain aspect ratio
  },
  keyboardAvoidingView: {
    width: '100%', // Take full width
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.13, // Responsive font size
    color: "#59008F",
    fontWeight: 'bold',
    fontFamily: 'Bungee-Regular',
  },
  login: {
    fontSize: width * 0.055, // Responsive font size
    fontWeight: 'bold',
    marginTop: height * 0.08, // Responsive margin top
    color: '#AA8F00',
  },
  inputContainer: {
    marginTop: height * 0.06, // Responsive margin top
    width: '100%',
    alignItems: 'center',
  },
  mail: {
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
  pw: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    backgroundColor: 'whitesmoke',
    paddingHorizontal: width * 0.03, // Responsive padding
    width: width * 0.8, // Responsive width
    marginTop: height * 0.05, // Responsive margin top
    elevation: 3,
  },
  input: {
    color: "#555",
    fontSize: width * 0.045, // Responsive font size
    flex: 1, // Take remaining space
    paddingVertical: height * 0.015, // Responsive vertical padding
  },
  icon: {
    width: width * 0.07, // Responsive icon size
    height: width * 0.07, // Responsive icon size
    resizeMode: 'contain',
  },
  forgotPW: {
    color: '#59008F',
    marginTop: height * 0.015, // Responsive margin top
    marginBottom: height * 0.06, // Responsive margin bottom
    marginHorizontal: width * 0.01, // Responsive margin
    fontSize: width * 0.045, // Responsive font size
    textAlign: 'right',
    fontWeight: '600',
    width: width * 0.8, // Match input width
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
  signUpText: {
    color: 'black',
    textAlign: 'center',
    marginTop: height * 0.025, // Responsive margin top
    fontSize: width * 0.045, // Responsive font size
  },
});