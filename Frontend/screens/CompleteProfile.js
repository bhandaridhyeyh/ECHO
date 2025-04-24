import { StyleSheet, Text, View, SafeAreaView, Image, KeyboardAvoidingView, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAccessToken } from '../utilities/keychainUtils'; // Assuming this is the correct path

const CompleteProfile = () => {
    const [enrollmentYear, setEnrollmentYear] = useState("");
    const [university, setUniversity] = useState("");
    const [course, setCourse] = useState("");
    const [program, setProgram] = useState("");
    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const navigation = useNavigation();

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
            const accessToken = await getAccessToken();
            if (!accessToken) {
                Alert.alert("Authentication Error", "No access token found. Please login again.");
                navigation.navigate("Login"); // Or your login screen name
                return;
            }

            const response = await axios.put('http://192.168.19.29:3600/user/complete-profile', { // Replace with your actual endpoint
                enrollmentYear,
                university,
                course,
                program,
                fullName,
                contactNumber,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.status === 200) {
                Alert.alert("Profile Updated!", response.data.message);
                navigation.navigate("Main"); // Or your main app screen
            } else {
                Alert.alert("Failed to Update Profile", response.data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            let errorMessage = "Something went wrong. Please check your internet connection and try again.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.request) {
                errorMessage = "Network error. Please check your internet connection.";
            }
            Alert.alert("Failed to Update Profile", errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <Image style={styles.logo} source={require('../assets/images/logo.png')} />
                </View>

                <KeyboardAvoidingView behavior="padding">
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Profile</Text>
                        <Text style={styles.subtitle}>Tell us more about yourself</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#555"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.label}>Enrollment Year:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={enrollmentYear}
                                onChangeText={setEnrollmentYear}
                                placeholder="Enter your enrollment year (e.g., 2023)"
                                placeholderTextColor="#555"
                                style={styles.input}
                                keyboardType="number-pad"
                            />
                        </View>

                        <Text style={styles.label}>University:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={university}
                                onChangeText={setUniversity}
                                placeholder="Enter your university name"
                                placeholderTextColor="#555"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.label}>Course:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={course}
                                onChangeText={setCourse}
                                placeholder="Enter your course name (e.g., B.Tech)"
                                placeholderTextColor="#555"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.label}>Program:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={program}
                                onChangeText={setProgram}
                                placeholder="Enter your program/branch (e.g., Computer Science)"
                                placeholderTextColor="#555"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.label}>Contact Number:</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={contactNumber}
                                onChangeText={setContactNumber}
                                placeholder="Enter your 10-digit contact number"
                                placeholderTextColor="#555"
                                style={styles.input}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <Pressable onPress={handleCompleteProfile} style={styles.button}>
                        <Text>Done</Text>
                    </Pressable>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CompleteProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        height: 179,
        width: 273.74,
        resizeMode: 'contain',
    },
    header: {
        alignItems: 'center',
        marginTop: 30,
    },
    title: {
        fontSize: 45, // Adjusted font size for profile page
        color: "#59008F",
        fontWeight: 'bold',
        fontFamily: 'Bungee-Regular',
    },
    subtitle: {
        fontSize: 18, // Adjusted font size
        fontWeight: 'bold',
        marginTop: 20, // Adjusted margin
        color: '#AA8F00',
    },
    inputContainer: {
        marginTop: 30, // Adjusted margin
        width: '100%',
        paddingHorizontal: 20,
    },
    label: {
        color: 'black',
        fontSize: 16, // Adjusted font size
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
        marginBottom: 15, // Adjusted margin
        elevation: 3,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#555",
        fontSize: 16, // Adjusted font size
    },
    button: {
        backgroundColor: '#59008F',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        width: 70,
        height: 70, // Make it circular
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 24, // Adjusted margin
        justifyContent: 'center',
    },
    buttonIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    loginText: {
        color: 'black',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 17,
    },
});