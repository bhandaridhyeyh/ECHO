import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, FlatList, Dimensions, Modal, useWindowDimensions, Share
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccessToken, getCurrentUserId } from '../utilities/keychainUtils';

const OtherUser = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params || {};

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProducts, setUserProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [userEchoes, setUserEchoes] = useState([]);
    const [index, setIndex] = useState(0);
    const layout = useWindowDimensions();
    const [routes] = useState([
        { key: 'products', title: 'Products' },
        { key: 'echoes', title: 'Echoes' },
    ]);

    // Fetch echoes
    useEffect(() => {
        if (userId) {
            fetchOtherUserProfile();
            fetchOtherUserEchoes();
        }
    }, [userId]);

    const fetchOtherUserEchoes = async () => {
        try {
            const token = await getAccessToken();
            const response = await axios.get(`${API_URL}/echoes/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Log to verify structure
            console.log("Echo API response", response.data);

            setUserEchoes(response.data?.data || []); // Only set the array part
        } catch (error) {
            console.error('Error fetching user echoes:', error);
        }
    };

    // Tab rendering logic

    const renderProductItem = ({ item }) => {

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                    console.log("Navigating to ProductInfo with:", item); // 🔍 Log on press
                    navigation.navigate('ProductInfo', { product: item });
                }}
            >
                <Image
                    source={item.image ? { uri: item.image } : require('../assets/images/university.png')}
                    style={styles.productImage}
                />
                <View style={styles.productDetails}>
                    <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <Text
                        style={[
                            styles.productStatus,
                            item.Status?.toLowerCase() === 'sold' ? styles.soldStatus : styles.availableStatus
                        ]}
                    >
                        {(item.Status || 'Available').toUpperCase()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderProductTab = () => (
        userProducts.length > 0 ? (
            <View style={{ flexGrow: 1 }}>
                <FlatList
                    data={[...userProducts].reverse()}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id}
                    numColumns={3}
                    columnWrapperStyle={styles.productList}
                    scrollEnabled={false}
                />
            </View>
        ) : (
            <Text style={styles.emptyStateText}>No products listed yet</Text>
        )
    );

    const handleChat = async (echo) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to post an item.');
                navigation.navigate('Login');
                return;
            }
            const participant_id1 = await getCurrentUserId();
            const participant_id2 = echo.user._id;

            if (participant_id1 === participant_id2) {
                Alert.alert("Notice", "You cannot chat with yourself.");
                return;
            }

            const response = await axios.post(`${API_URL}/Chat/create`, {
                participant_id1,
                participant_id2,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Chat created:', response.data.data);
            navigation.navigate('Conversation', {
                chatId: response.data.data._id,
                receiverId: participant_id2,
                receiverName: echo.user.fullName,
                receiverDetails: `${echo.user.course} - ${echo.user.program}`,
                receiverImage: typeof echo.user?.ProfilePicture === 'string' ? echo.user.ProfilePicture : null,
            });
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };
    const handleShare = (content) => {
        // Use Share API or custom logic
        Share.share({ message: `Checkout this echo: ${content}` });
    };

    const renderEchoItem = ({ item }) => (
        <View style={styles.echoCard}>
            {/* User Info Row */}
            <View style={styles.userInfoContainer}>
                <Image
                    source={
                        item.user.ProfilePicture
                            ? { uri: item.user.ProfilePicture }
                            : require('../assets/images/user.png')
                    }
                    style={styles.userImage}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.echoTitle}>{item.user.fullName || "No Name"}</Text>

                    {/* Show dot and FLAGGED badge if markedasFlag is true */}
                    {item.markedasFlag && (
                        <>
                            <Icon name="ellipse" size={6} color="#000" />
                            <View style={styles.flagBox}>
                                <Text style={styles.flagText}>FLAGGED</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* Echo Content */}
            <Text style={styles.echoDescription}>
                {item.content || item.description || "No content available"}
            </Text>

            {/* Action Icons */}
            <View style={styles.echoActions}>
                <TouchableOpacity onPress={() => handleChat(item)}>
                    <Icon name="chatbubble-ellipses-outline" size={24} color="#350f55" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(item.user._id, item.content)}>
                    <Icon name="share-social-outline" size={24} color="#350f55" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEchoTab = () => {
        // ✅ Correct sorting by markedasFlag
        const sortedEchoes = [...userEchoes].sort((a, b) => {
            if (a.markedasFlag === b.markedasFlag) return 0;
            return a.markedasFlag ? -1 : 1;
        });

        return sortedEchoes.length > 0 ? (
            <FlatList
                data={sortedEchoes}
                renderItem={renderEchoItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
            />
        ) : (
            <Text style={styles.emptyStateText}>No echoes posted yet</Text>
        );
    };

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'products':
                return (
                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {renderProductTab()}
                    </ScrollView>
                );
            case 'echoes':
                return (
                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {renderEchoTab()}
                    </ScrollView>
                );
            default:
                return null;
        }
    };

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
                <View style={{ height: 1320, width: '100%', marginTop: 20 }}>
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: layout.width }}
                        renderTabBar={props => (
                            <TabBar
                                {...props}
                                indicatorStyle={{ backgroundColor: '#350f55' }}
                                style={{ backgroundColor: 'white' }}
                                activeColor="#350f55"
                                inactiveColor="#888"
                                labelStyle={{ fontWeight: '600' }}
                            />
                        )}
                    />
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
        marginTop: 15,
        width: '100%',
        gap: width * 0.02
    },
    productCard: {
        width: '30%',  // Changed from '48%' to '30%' to fit 3 columns
        margin: '1%', // Added margin to maintain spacing
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
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
    },
    emptyStateText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#888',
    },
    emptyStateText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginVertical: 20,
    },
    echoCard: {
        backgroundColor: '#fff',
        padding: 12,
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
    echoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#1a1a1a',
    },
    echoDescription: {
        fontSize: 15,
        color: '#333',
        marginTop: 5,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    echoActions: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 12,
    },
    flagBox: {
        backgroundColor: 'red',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },

    flagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default OtherUser;