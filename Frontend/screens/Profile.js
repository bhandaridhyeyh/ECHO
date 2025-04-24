import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccessToken } from '../utilities/keychainUtils';
// --- Constants and Data --- (Keep previous dummy data, BASE_URL, PROFILE_API_URL, getAccessToken)
const dummyProfileData = {
    name: 'Rohan Sharma',
    bio: 'Tech enthusiast and CSE student passionate about cloud computing and AI. Active in coding, debate, and sustainability initiatives.',
    email: 'aryan.patel@navuni.edu.in',
    degree: 'Bachelor of Technology in Computer Science and Engineering',
    graduationYears: '2021-25',
    profileImageUrl: 'https://via.placeholder.com/150/DDDDDD/808080?text=RS',
};

const BASE_URL = 'YOUR_API_BASE_URL_HERE';
const PROFILE_API_URL = ''; // PUT YOUR ACTUAL ENDPOINT HERE



const Profile = () => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(dummyProfileData);
    const [isLoading, setIsLoading] = useState(true);

    // --- useEffect and fetchProfileData function remain the same ---
    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        // ... (your existing fetchProfileData function)
        setIsLoading(true);

        if (!PROFILE_API_URL) {
            console.warn(
                'PROFILE_API_URL is empty. Skipping API call and using dummy data.',
            );
            setIsLoading(false);
            setProfileData(dummyProfileData);
            return;
        }

        const token = await getAccessToken();
        if (!token) {
            Alert.alert(
                'Authentication Required',
                'Please log in to view your profile.',
            );
            console.warn('No token found, using dummy data.');
            setProfileData(dummyProfileData);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                PROFILE_API_URL,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                },
            );
            // console.log("API Response Status:", response.status);

            if (response.status >= 200 && response.status < 300 && response.data) {
                const fetchedData = response.data.data || response.data;
                if (fetchedData && fetchedData.name && fetchedData.email) {
                    // console.log("Successfully fetched profile data from API.");
                    setProfileData(prevData => ({
                        ...prevData,
                        profileImageUrl:
                            fetchedData.profileImageUrl || prevData.profileImageUrl,
                        ...fetchedData,
                    }));
                } else {
                    console.warn(
                        'Fetched data is missing essential fields. Using dummy data.',
                    );
                    setProfileData(dummyProfileData);
                }
            } else {
                console.warn(
                    `API request failed or returned no data. Status: ${response.status}. Using dummy data.`,
                );
                setProfileData(dummyProfileData);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            Alert.alert('Error', 'Could not fetch profile information.');
            console.log('API call failed. Falling back to dummy data.');
            setProfileData(dummyProfileData);
        } finally {
            setIsLoading(false);
            // console.log("Finished fetch attempt.");
        }
    };
    // --- End of useEffect and fetchProfileData ---

    const handleBackPress = () => navigation.goBack();
    const handleOptionsPress = () => {
        Alert.alert(
            'Manage your profile',
            '',
            [
                { text: 'Complete Profile', onPress: () => navigation.navigate('CompleteProfile') },
                { text: 'Login', onPress: () => navigation.navigate('Login') },
                { text: 'Register', onPress: () => navigation.navigate('Register') },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };
    const handleMessagePress = () =>
        Alert.alert('Message Request', 'Message request pressed!');

    if (isLoading && !profileData.name) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* --- Header --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
                    <Icon name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={handleOptionsPress}
                    style={styles.headerButton}>
                    <Icon name="ellipsis-horizontal" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* --- Profile Image / Message Button Area (Side by Side) --- */}
                <View style={styles.profileHeaderArea}>
                    <Image
                        source={{
                            uri:
                                profileData.profileImageUrl ||
                                dummyProfileData.profileImageUrl,
                        }}
                        style={styles.profileImage}
                        onError={e =>
                            console.warn(
                                'Failed to load profile image:',
                                e.nativeEvent.error,
                            )
                        }
                    />
                    <TouchableOpacity
                        onPress={handleMessagePress}
                        style={styles.messageButton}>
                        <Icon
                            name="send-outline"
                            size={18}
                            color="#FFFFFF"
                            style={styles.messageButtonIcon}
                        />
                        <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Profile Details Below Image/Button Area --- */}
                <View style={styles.profileDetailsContainer}>
                    {/* Name  */}
                    <Text style={styles.profileName}>
                        {profileData.name || 'Name Unavailable'}
                    </Text>


                    {/* --- Divider --- */}
                    <View style={styles.divider} />

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        {/* Email */}
                        <View style={styles.infoRow}>
                            <Icon
                                name="mail-outline"
                                size={21}
                                color="#505050"
                                style={styles.infoIcon}
                            />
                            <Text style={styles.infoText} selectable={true}>
                                {profileData.email || 'Email not provided'}
                            </Text>
                        </View>

                        {/* Degree */}
                        <View style={styles.infoRow}>
                            <Icon
                                name="school-outline"
                                size={21}
                                color="#505050"
                                style={styles.infoIcon}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert('Degree Info', profileData.degree)
                                }>
                                <Text style={[styles.infoText, styles.linkText]}>
                                    {profileData.degree || 'Degree not specified'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Graduation Years */}
                        <View style={styles.infoRow}>
                            <Icon
                                name="calendar-outline"
                                size={21}
                                color="#505050"
                                style={styles.infoIcon}
                            />
                            <Text style={styles.infoText}>
                                {profileData.graduationYears || 'Years not specified'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles --- (Keep your existing styles)
const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = 100;
const PROFILE_IMAGE_BORDER = 3;
const MESSAGE_BUTTON_HEIGHT = 40;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#E53935',
    },
    header: {
        height: Platform.OS === 'android' ? 56 : 60,
        backgroundColor: '#E53935',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        padding: 10,
    },
    scrollContentContainer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    profileHeaderArea: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        width: '90%',
    },
    profileImage: {
        width: PROFILE_IMAGE_SIZE,
        height: PROFILE_IMAGE_SIZE,
        borderRadius: PROFILE_IMAGE_SIZE / 2,
        borderWidth: PROFILE_IMAGE_BORDER,
        borderColor: '#FFFFFF',
        backgroundColor: '#E0E0E0',
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    messageButtonIcon: {
        marginRight: 8,
    },
    messageButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    profileDetailsContainer: {
        width: '90%',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    profileBio: {
        fontSize: 16,
        color: '#555555',
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 24,
    },
    infoSection: {
        width: '100%',
        marginTop: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoIcon: {
        marginRight: 10,
        width: 21,
        textAlign: 'center',
        color: '#505050',
    },
    infoText: {
        fontSize: 16,
        color: '#2C2C2C',
        flexShrink: 1,
        lineHeight: 22,
    },
    linkText: {
        color: '#0066CC',
        fontWeight: '500',
    },
    divider: {
        width: '100%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#DADADA',
        marginVertical: 20,
    },
});

export default Profile;
