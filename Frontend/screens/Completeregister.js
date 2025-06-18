import {
  StyleSheet, Text, View, SafeAreaView, Image,
  KeyboardAvoidingView, TextInput, Pressable, ScrollView, Alert, Platform
} from 'react-native';
import React, { useState,useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeAccessToken } from '../utilities/keychainUtils';
import socket from '../utilities/socket';
import { API_URL } from '@env';

const Completeregister = () => {
  const [enrollmentYear, setEnrollmentYear] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [program, setProgram] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const navigation = useNavigation();
  const route = useRoute();
  const { email, password } = route.params;

  const handleCompleteProfile = async () => {
    if (!enrollmentYear || !university || !course || !program || !fullName || !contactNumber) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    if (contactNumber.length !== 10 || isNaN(contactNumber)) {
      Alert.alert("Error", "Contact number must be exactly 10 digits.");
      return;
    }

    try {
      const loginRes = await axios.post(`${API_URL}/user/login`, { email, password });
      const { accessToken, userObject } = loginRes.data.data;

      const stored = await storeAccessToken(accessToken);
      if (!stored) {
        Alert.alert("Storage Error", "Failed to store token securely.");
        return;
      }

      await AsyncStorage.setItem("tradeMateUserId", userObject._id);
      socket.connect();
      socket.emit("register", userObject._id);

      const completeRes = await axios.put(`${API_URL}/user/complete-profile`, {
        enrollmentYear,
        university,
        course,
        program,
        fullName,
        contactNumber,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (completeRes.status === 200) {
        Alert.alert("Welcome!", "Profile completed successfully!");
        navigation.navigate("Main");
      } else {
        Alert.alert("Error", "Failed to complete profile.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Complete Profile Error:", error);
      const message = error?.response?.data?.message || "Something went wrong. Try again.";
      Alert.alert("Error", message);
    }
  };

  return (
<SafeAreaView style={styles.container}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../assets/images/logo.png')} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Complete Profile</Text>
        <Text style={styles.subtitle}>Tell us more about yourself</Text>
      </View>

      <View style={styles.inputContainer}>
        {[
          { label: "Full Name", value: fullName, setter: setFullName, placeholder: "Your full name" },
          { label: "Enrollment Year", value: enrollmentYear, setter: setEnrollmentYear, placeholder: "2023", keyboardType: "number-pad" },
          { label: "University", value: university, setter: setUniversity, placeholder: "University name" },
          { label: "Course", value: course, setter: setCourse, placeholder: "e.g., B.Tech" },
          { label: "Program", value: program, setter: setProgram, placeholder: "e.g., Computer Science" },
          { label: "Contact Number", value: contactNumber, setter: setContactNumber, placeholder: "10-digit number", keyboardType: "phone-pad", maxLength: 10 }
        ].map((field, idx) => (
          <View key={idx} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType={field.keyboardType || "default"}
                maxLength={field.maxLength}
              />
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={handleCompleteProfile} style={styles.button}>
        <Text style={styles.buttonText}>Done</Text>
      </Pressable>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
  );
};

export default Completeregister;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    height: 150,
    width: 260,
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    color: "#59008F",
    fontWeight: 'bold',
    fontFamily: 'Bungee-Regular',
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AA8F00',
    marginTop: 10,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWrapper: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
  },
  input: {
    fontSize: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#59008F',
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    marginTop: 30,
    marginBottom: 40,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
