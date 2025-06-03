import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccessToken, deleteAccessToken } from '../utilities/keychainUtils';
import socket from '../utilities/socket.js';
const dummyProfileData = {
    name: 'Rohan Sharma',
    email: 'aryan.patel@navuni.edu.in',
    degree: 'Bachelor of Technology in Computer Science and Engineering',
    graduationYears: '2021-25',
    profileImageUrl: 'https://via.placeholder.com/150/DDDDDD/808080?text=RS',
};

const Profile = () => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(dummyProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [profileImage, setProfileImage] = useState('');
    const [userProducts, setUserProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    useEffect(() => {
        fetchProfileData();
        fetchUserProducts();
    }, []);

    const fetchProfileData = async () => {
        setIsLoading(true);
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
            const response = await axios.get(`${API_URL}/user/profile`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                },
            );

            if (response.status >= 200 && response.status < 300 && response.data) {
                const fetchedData = response.data.data || response.data;
                if (fetchedData && fetchedData.fullName && fetchedData.email) {
                    setProfileData(prevData => ({
                        ...prevData,
                        profileImageUrl:
                            fetchedData.ProfilePicture || prevData.ProfilePicture,
                        ...fetchedData,
                    }));
                } else {
                    console.warn('Fetched data is missing essential fields. Using dummy data.');
                    setProfileData(dummyProfileData);
                }
            } else {
                console.warn(`API request failed or returned no data. Status: ${response.status}. Using dummy data.`);
                setProfileData(dummyProfileData);
            }
        } catch (error) {
            console.log('Error fetching profile data:', error);
            Alert.alert('Error', 'Could not fetch profile information.');
            console.log('API call failed. Falling back to dummy data.');
            setProfileData(dummyProfileData);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserProducts = async () => {
        setProductsLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) {
                console.warn('No token found, cannot fetch products');
                return;
            }

            console.log('Fetching user profile...');
            const response = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // console.log('Profile response:', response.data);

            const userData = response.data?.data || response.data;
            // console.log('User data:', userData);

            // Check for products in both possible fields
            const products = userData?.sellPosts || userData?.userSellpost || [];
            // console.log('Found products:', products);

            setUserProducts(products);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                Alert.alert('Session Expired', 'Please login again');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', 'Could not load profile data');
            }
            setUserProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    // Update the useEffect to include refresh on focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfileData();
            fetchUserProducts();
        });

        // Initial fetch
        fetchProfileData();
        fetchUserProducts();

        return unsubscribe;
    }, [navigation]);

    const handleBackPress = () => navigation.goBack();
    const handleOptionsPress = () => {
        Alert.alert(
            'Manage your profile',
            '',
            [
                { text: 'Complete Profile', onPress: () => navigation.navigate('CompleteProfile') },
                { text: 'Register', onPress: () => navigation.navigate('Register') },
                { text: 'Logout', onPress: handleLogout }, // Logout added here
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const handleLogout = async () => {
        try {  
            socket.disconnect();
            await deleteAccessToken();
            await AsyncStorage.removeItem('tradeMateUserId');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert("Logout Failed", "Something went wrong while logging out.");
        }
    };

    const handleImagePick = async () => {
        const options = {
            mediaType: 'photo',
            quality: 0.7,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('Image selection cancelled');
                return;
            }

            const asset = response.assets?.[0];
            if (!asset) {
                Alert.alert('Error', 'No image selected');
                return;
            }

            const formData = new FormData();
            formData.append('ProfilePicture', {
                uri: asset.uri,
                name: asset.fileName || 'profile.jpg',
                type: asset.type,
            });

            try {
                const token = await getAccessToken();
                const res = await axios.put(`${API_URL}/user/update-profile-picture`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (res.status === 200) {
                    Alert.alert('Success', 'Profile picture updated');
                    setProfileImage(res.data.profilePictureUrl);
                    fetchProfileData(); // Refresh profile data
                } else {
                    Alert.alert('Error', 'Update failed');
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Upload Error', 'Failed to upload image');
            }
        });
    };

    const renderProductItem = ({ item }) => {
        // Handle case where Status might be capitalized and ensure output is capitalized
        const status = (item.Status || item.status || 'Available').toUpperCase();

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductInfo', { product: item })}
            >
                <Image
                    source={item.image ? { uri: item.image } : require('../assets/images/university.png')}
                    style={styles.productImage}
                />
                <View style={styles.productDetails}>
                    <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <Text style={[
                        styles.productStatus,
                        status === 'SOLD' ? styles.soldStatus : styles.availableStatus
                    ]}>
                        {status}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
                    <Icon name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={handleOptionsPress} style={styles.headerButton}>
                    <Icon name="ellipsis-horizontal" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">

                {/* Profile Image */}
                <View style={styles.profileHeaderArea}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={profileData.ProfilePicture ?
                                { uri: profileData.ProfilePicture } :
                                require('../assets/images/user.png')}
                            style={styles.profileImage}
                        />
                        <Pressable style={styles.updateButton} onPress={handleImagePick}>
                            <Icon name="add-circle-outline" size={28} color="#fff" />
                        </Pressable>
                    </View>
                </View>

                {/* Profile Details */}
                <View style={styles.profileDetailsContainer}>
                    <Text style={styles.profileName}>
                        {profileData.fullName || 'Name Unavailable'}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.infoSection}>
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

                        <View style={styles.infoRow}>
                            <Icon
                                name="school-outline"
                                size={21}
                                color="#505050"
                                style={styles.infoIcon}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        'Program & Course Info',
                                        `Program: ${profileData.program || 'Not specified'}\nCourse: ${profileData.course || 'Not specified'}`
                                    )
                                }>
                                <Text style={[styles.infoText, styles.linkText]}>
                                    {profileData.program || 'Program not specified'} / {profileData.course || 'Course not specified'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon
                                name="calendar-outline"
                                size={21}
                                color="#505050"
                                style={styles.infoIcon}
                            />
                            <Text style={styles.infoText}>
                                {profileData.enrollmentYear || 'Year not specified'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* User's Products Section */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Listed Products</Text>

                    {productsLoading ? (
                        <ActivityIndicator size="small" color="#E53935" />
                    ) : userProducts.length > 0 ? (
                        <FlatList
                            data={userProducts}
                            renderItem={renderProductItem}
                            keyExtractor={(item) => item._id}
                            numColumns={3}  // Changed from 2 to 3
                            columnWrapperStyle={styles.productList}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Icon name="cube-outline" size={50} color="#cccccc" alignSelf="center" />
                            <Text style={styles.emptyStateText}>No products listed yet</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => navigation.navigate('AddProduct')}
                            >
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = 125;
const PROFILE_IMAGE_BORDER = 0;

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
    profileImageContainer: {
        position: 'relative',
        width: PROFILE_IMAGE_SIZE,
        height: PROFILE_IMAGE_SIZE,
        borderRadius: PROFILE_IMAGE_SIZE / 2,
        overflow: 'visible',
        borderWidth: PROFILE_IMAGE_BORDER,
        borderColor: '#FFFFFF',
        backgroundColor: '#E0E0E0',
        marginBottom: 8,
        zIndex: 0,
    },
    profileImage: {
        width: PROFILE_IMAGE_SIZE,
        height: PROFILE_IMAGE_SIZE,
        borderRadius: PROFILE_IMAGE_SIZE / 2,
        borderWidth: PROFILE_IMAGE_BORDER,
        borderColor: '#FFFFFF',
        backgroundColor: '#E0E0E0',
    },
    updateButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(229, 57, 53, 0.85)',
        borderRadius: 16,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
        zIndex: 1,
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
    productsSection: {
        width: '100%',
        marginTop: 30,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    productList: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    productCard: {
        width: '30%',  // Changed from '48%' to '30%' to fit 3 columns
        margin: '1%', // Added margin to maintain spacing
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 100,  // Slightly reduced height to fit more content
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
    },
    productDetails: {
        paddingHorizontal: 5,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    productStatus: {
        fontSize: 10,
        color: '#666',
    },
    noProductsText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 20,
        fontSize: 16,
    },
    soldStatus: {
        color: '#FF3B30',
    },
    availableStatus: {
        color: '#34C759',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#cccccc',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default Profile;