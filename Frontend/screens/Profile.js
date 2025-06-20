import React, { useState, useEffect, useCallback } from 'react';
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
    Modal,
    Platform,
    FlatList,
    Share,
    TextInput,
    KeyboardAvoidingView,
    RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccessToken, deleteAccessToken } from '../utilities/keychainUtils';
import socket from '../utilities/socket.js';

const dummyProfileData = {
    name: 'Full Name',
    email: 'name.surname@nuv.ac.in',
    degree: 'B.Tech - CSE',
    graduationYears: '2022-26',
    profileImageUrl: 'https://via.placeholder.com/150/DDDDDD/808080?text=RS',
};

const Profile = () => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(dummyProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [profileImage, setProfileImage] = useState('');
    const [userProducts, setUserProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [echoes, setEchoes] = useState([]);
    const [selectedEchoId, setSelectedEchoId] = useState(null);
    const [editingEchoId, setEditingEchoId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            await fetchProfileData();     // your existing function
            await fetchUserProducts();    // your existing function
            await fetchUserEchoes();      // your existing function
        } catch (error) {
            console.error('Refresh error:', error.message);
        } finally {
            setRefreshing(false);
        }
    };

    const openOptionsModal = useCallback((id) => {
        setSelectedEchoId((prev) => (prev === id ? null : id));
    }, []);

    const handleEdit = useCallback((echo) => {
        setSelectedEchoId(null);
        setEditingEchoId(echo._id);
        setEditedContent(echo.content);
    }, []);

    const handleUpdate = useCallback(async (id, content) => {
        try {
            const token = await getAccessToken();

            await axios.put(
                `${API_URL}/echoes/${id}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEchoes((prev) =>
                prev.map((echo) => (echo._id === id ? { ...echo, content } : echo))
            );

            setEditingEchoId(null);
            setEditedContent('');
        } catch (err) {
            console.error('Failed to update echo:', err.message);
            Alert.alert('Error', 'Could not update echo.');
        }
    }, []);

    const handleDelete = (id) => {
        setSelectedEchoId(null);

        Alert.alert('Confirm Delete', 'Are you sure you want to delete this echo?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await getAccessToken();
                        await axios.delete(`${API_URL}/echoes/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setEchoes((prev) => prev.filter((e) => e._id !== id));
                        if (editingEchoId === id) {
                            setEditingEchoId(null);
                            setEditedContent('');
                        }
                    } catch (err) {
                        console.error('Failed to delete echo:', err.message);
                        Alert.alert('Error', 'Could not delete echo.');
                    }
                },
            },
        ]);
    };

    const handleShare = async (userId, content) => {
        setSelectedEchoId(null);
        try {
            const result = await Share.share({
                message: `Check out this Echo by me:\n\n"${content}"`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing the echo:', error.message);
        }
    };

    const fetchUserEchoes = async () => {
        try {
            const token = await getAccessToken();
            const userId = await AsyncStorage.getItem('tradeMateUserId');

            if (!userId) {
                console.warn('User ID is null. Please ensure it is saved after login.');
                return;
            }

            const res = await axios.get(`${API_URL}/echoes/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setEchoes(res.data.data);
        } catch (err) {
            console.log('Failed to fetch user echoes:', err.response?.data?.message || err.message);
        }
    };

    useEffect(() => {
        fetchUserEchoes();
    }, []);

    useEffect(() => {
        fetchProfileData();
        fetchUserProducts();
    }, []);

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'products', title: 'Products' },
        { key: 'echoes', title: 'Echoes' },
    ]);

    const ProductsTab = () => (
        <View style={styles.tabContent}>
            {productsLoading ? (
                <ActivityIndicator size="small" color="#E53935" />
            ) : userProducts.length > 0 ? (
                <FlatList
                    data={[...userProducts].reverse()}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id}
                    numColumns={3}
                    columnWrapperStyle={styles.productList}
                    scrollEnabled={false}
                />
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Icon name="cube-outline" size={50} color="#cccccc" alignSelf="center" />
                    <Text style={styles.emptyStateText}>No products listed yet</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('Sell')}
                    >
                        <Text style={styles.addButtonText}>Add Product</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    // Echoes Tab Component
    const EchoesTab = () => {
        // Sort echoes: flagged first
        const sortedEchoes = [...echoes].sort((a, b) => {
            if (a.markedasFlag === b.markedasFlag) return 0;
            return a.markedasFlag ? -1 : 1;
        });

        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={80}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
                    {sortedEchoes.length > 0 ? (
                        sortedEchoes.map((echo) => (
                            <View key={echo._id} style={styles.echoCard}>
                                {/* User Info */}
                                <View style={styles.userInfoContainer}>
                                    <TouchableOpacity onPress={() => { /* your handleUserPress */ }} style={styles.userInfoLeft}>
                                        <Image
                                            source={
                                                echo?.user?.ProfilePicture
                                                    ? { uri: echo.user.ProfilePicture }
                                                    : require('../assets/images/user.png')
                                            }
                                            style={styles.userImage}
                                        />
                                        <View style={styles.userInfo}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.userName}>{echo.user?.fullName}</Text>

                                                {echo.markedasFlag && (
                                                    <>
                                                        <Icon name="ellipse" size={6} color="#000" />
                                                        <View style={styles.flagBox}>
                                                            <Text style={styles.flagText}>FLAGGED</Text>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => openOptionsModal(echo._id)} style={styles.ellipsisButton}>
                                        <Icon name="ellipsis-vertical" size={20} color="#555" />
                                    </TouchableOpacity>
                                </View>

                                {/* Content or Editing Input */}
                                {editingEchoId === echo._id ? (
                                    <View>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editedContent}
                                            onChangeText={setEditedContent}
                                            placeholder="Edit your echo"
                                            multiline
                                            placeholderTextColor="#888"
                                            autoFocus
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 15 }}>
                                            <TouchableOpacity
                                                onPress={() => handleUpdate(echo._id, editedContent)}
                                                style={styles.updateEcho}
                                            >
                                                <Text style={styles.updateButtonText}>Update</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditingEchoId(null);
                                                    setEditedContent('');
                                                }}
                                                style={[styles.updateEcho, { backgroundColor: '#aaa' }]}
                                            >
                                                <Text style={[styles.updateButtonText, { color: '#333' }]}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.echoContent}>{echo.content}</Text>
                                )}

                                {/* Options Modal */}
                                {selectedEchoId === echo._id && editingEchoId !== echo._id && (
                                    <View style={styles.optionsModal}>
                                        <TouchableOpacity onPress={() => handleEdit(echo)} style={styles.optionItem}>
                                            <Text style={styles.optionText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleShare(echo.user._id, echo.content)} style={styles.optionItem}>
                                            <Text style={styles.optionText}>Share</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(echo._id)} style={styles.optionItem}>
                                            <Text style={[styles.optionText, { color: 'red' }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No Echoes to display</Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        );
    };

    const renderScene = SceneMap({
        products: ProductsTab,
        echoes: EchoesTab,
    });

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            activeColor="#350f55"
            inactiveColor="#888"
            pressColor="#f0f0f0"
        />
    );

    const handleProfileImagePress = () => {
        if (profileData.ProfilePicture) {
            setImageModalVisible(true);
        }
    };

    // Function to close modal
    const closeModal = () => {
        setImageModalVisible(false);
    };

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

            const response = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data?.data || response.data;
            const products = userData?.sellPosts || userData?.userSellpost || [];

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
            <Pressable
                style={styles.productCard}
                onPress={() => navigateToProductInfo(item)}
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
            </Pressable>
        );
    };

    const navigateToProductInfo = (item) => {
        navigation.navigate('AllPosts', {
            selectedProduct: item,
            allProducts: userProducts,
        });
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
                    <Icon name="ellipsis-vertical" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>

                {/* Profile Image */}
                <View style={styles.profileHeaderArea}>
                    <View style={styles.profileImageContainer}>
                        <TouchableOpacity onPress={handleProfileImagePress} activeOpacity={0.8}>
                            <Image
                                source={profileData.ProfilePicture ?
                                    { uri: profileData.ProfilePicture } :
                                    require('../assets/images/user.png')}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
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
                <View style={styles.tabContainer}>
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: Dimensions.get('window').width }}
                        renderTabBar={renderTabBar}
                        swipeEnabled={true}
                    />
                </View>
            </ScrollView>
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} activeOpacity={1}>
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: profileData.ProfilePicture }}
                            style={styles.enlargedImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                            <Icon name="close-circle" size={36} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
        backgroundColor: '#350f55',
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
        backgroundColor: '#350f5599',
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
        marginBottom: 15,
        gap: width * 0.01,
        width: '100%',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        position: 'relative',
        width: '90%',
        height: '70%',
    },
    enlargedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        // zIndex to ensure above image
        zIndex: 10,
    },
    tabContainer: {
        flex: 1,
        maxHeight: 1360, // Adjust as needed
        marginTop: 20,
    },
    tabContent: {
        flex: 1,
        padding: 10,
    },
    tabBar: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabLabel: {
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    tabIndicator: {
        backgroundColor: '#350f55',
        height: 3,
    },
    echoMeta: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },
    userInfo: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    ellipsisButton: {
        padding: 5,
    },
    echoCard: {
        backgroundColor: '#fff',
        padding: 12,
        paddingBottom: 30,
        borderRadius: 10,
        marginTop: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 3 },
        zIndex: 0,
        borderWidth: 0.5,
        borderColor: '#DADADA',
        position: 'relative',
    },
    echoContent: {
        fontSize: 15,
        color: '#444',
        marginTop: 5,
    },
    optionsModal: {
        backgroundColor: '#fff',
        position: 'absolute',
        top: 5, // below userInfoContainer
        right: 40,
        width: 120,
        paddingVertical: 4,
        borderRadius: 6,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 999,
    },
    optionItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    editInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        marginVertical: 8,
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    updateEcho: {
        backgroundColor: '#5D4F00',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    flagBox: {
        backgroundColor: 'red',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },

    flagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Profile;