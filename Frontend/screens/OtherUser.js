import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, FlatList, Dimensions, Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const OtherUser = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params || {};

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProducts, setUserProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchOtherUserProfile();
        }
    }, [userId]);

    const fetchOtherUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/user/profile/${userId}`, {
                timeout: 10000,
            });
            const user = response.data?.data || response.data;  
            const products = user?.sellPosts || user?.userSellpost || []; 
            console.log(products)
            setUserProducts(products);
            setProfileData(user);
        } catch (error) {
            console.error('Error fetching other user profile:', error);
            Alert.alert('Error', 'Could not fetch user profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackPress = () => navigation.goBack();

    const renderProductItem = ({ item }) => (
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
                    item.Status?.toLowerCase() === 'sold' ? styles.soldStatus : styles.availableStatus
                ]}>
                    {item.Status.toUpperCase() || 'Available'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading || !profileData) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="black" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </SafeAreaView>
        );
    }

    // Image source for profile pic or fallback
    const imageSource = profileData.ProfilePicture
        ? { uri: profileData.ProfilePicture }
        : require('../assets/images/user.png');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">

                {/* Profile Header */}
                <View style={styles.profileHeaderArea}>
                    <Icon name="chevron-back" size={30} color="black" onPress={handleBackPress} />

                    {/* Touchable profile image to open modal */}
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileImageContainer}>
                        <Image source={imageSource} style={styles.profileImage} />
                    </TouchableOpacity>

                    <Text style={styles.profileName}>
                        {profileData.fullName || 'Name Unavailable'}
                    </Text>
                </View>

                {/* Modal for enlarged profile image */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalBackground}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={1}
                    >
                        <Image
                            source={imageSource}
                            style={styles.enlargedImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </Modal>

                {/* Profile Details */}
                <View style={styles.profileDetailsContainer}>
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

                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() =>
                        navigation.navigate('Conversation', {
                            receiverId: profileData._id,
                            receiverName: profileData.fullName,
                            receiverDetails: `${profileData.course} - ${profileData.program}`,
                            receiverContact: profileData.contactNumber,
                            receiverImage: typeof profileData?.ProfilePicture === 'string' ? profileData.ProfilePicture : null,
                        })
                    }
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Icon name="chatbubble-outline" size={20} color="#fff" />
                        <Text style={styles.messageButtonText}>Message</Text>
                    </View>
                </TouchableOpacity>

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
                                onPress={() => navigation.navigate('Sell')}
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
const PROFILE_IMAGE_SIZE = 50;
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
        color: 'black',
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
        gap: 10,
        alignItems: 'center',
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
    messageButton: {
        backgroundColor: '#350f55',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20,
        width: '90%',
    },
    messageButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
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
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedImage: {
        width: '90%',
        height: '70%',
        borderRadius: 15,
    }
});

export default OtherUser;