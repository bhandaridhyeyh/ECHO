import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '@env'   
import { RefreshControl } from 'react-native';
import { getAccessToken } from '../utilities/keychainUtils'; 
 
const Echoes = ({ navigation, route }) => {
    const [echoes, setEchoes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
   

    // Dummy data for fallback
    const dummyEchoes = [
        {
            id: '1',
            userName: 'Ishika Patel',
            userId: 'user1',
            timestamp: '2h', 
            markedasFlag: "false",
            content: 'Looking for notes on quantum mechanics. Anyone have a good resource?',
            userImage: 'https://via.placeholder.com/40',
        },
        {
            id: '2',
            userName: 'Aryan Shah',
            userId: 'user2',
            timestamp: '1d',
            content: 'Project group forming for the bi course. DM me if interested!',
            userImage: 'https://via.placeholder.com/40',
        },
        {
            id: '3',
            userName: 'Diya Sharma',
            userId: 'user3',
            timestamp: '5h',
            content: 'Anyone selling a second-hand textbook for linear algebra?',
            userImage: 'https://via.placeholder.com/40',
        },
    ];
     useEffect(() => {
            if (route.params?.newItem) {
                fetchEchoes(); // Re-fetch posts to include the new item
                // Alternatively, if you are certain the backend returns the new item in the next fetch,
                // you could keep the current approach but be mindful of potential duplication.
                // setRecentlyAddedItems((prevItems) => [route.params.newItem, ...prevItems]);
            }
     }, [route.params?.newItem]); 
    
    useEffect(() => {
        fetchEchoes();
    }, []); 
    
const fetchEchoes = async () => {
    setLoading(true);
    setError(null);
    try {
        const token = await getAccessToken();
        if (!token) {
            Alert.alert('Authentication Required', 'Please log in to post an item.');
            navigation.navigate('Login');
            return;
        }
        const response = await axios.get(`${API_URL}/echoes/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const echoes = response.data?.data;
        if (response.status >= 200 && response.status < 300 && Array.isArray(echoes)) {
            setEchoes(echoes);
        } else {
            setEchoes(dummyEchoes);
            Alert.alert("Warning", "Empty or invalid data from server. Using dummy data.");
        }
    } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        setEchoes(dummyEchoes);
        Alert.alert("Error", "Failed to load echoes. Using dummy data.");
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};

    const onRefresh = useCallback(() => {
                    setRefreshing(true);
                    fetchEchoes();
    }, []);

    const handleShare = async (userId, content) => {
        try {
            const result = await Share.share({
                message: `Check out this echo: ${content}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Shared with activity type of result.activityType
                    console.log("Shared with activity type", result.activityType)
                } else {
                    // Shared
                    console.log("Shared successfully")
                }
            } else if (result.action === Share.dismissedAction) {
                // Dismissed
                console.log("Share dismissed")
            }
        } catch (error) {
            alert(error.message);
        }
        console.log('Sharing echo with user ID:', userId);
        // navigation.navigate('Conversation', { userId }); // Removed navigation.  The message icon will handle this.
    };

    const renderEchoes = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading Echoes...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Error: {error}
                    </Text>
                    <Text style={styles.errorText}>Using dummy data.</Text>
                </View>
            );
        }

        if (!Array.isArray(echoes) || echoes.length === 0) {
            return <Text style={styles.noEchoesText}>No echoes to display.</Text>;
        }

        return (
            echoes.map((echo) => (
                <View key={echo.id} style={styles.echoCard}>
                    <View style={styles.userInfoContainer}>
                        <Image source={
                            echo?.user?.ProfilePicture ? { uri: echo.user.ProfilePicture } : require('../assets/images/user.png')
                        }
                        style={styles.userImage} />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{echo.user?.fullName}</Text>
                        </View>
                    </View>
                    <Text style={styles.echoContent}>{echo.content}</Text>
                    <View style={styles.actionsContainer}>
                        <View style={styles.actionItem}>
                            <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Conversation', { userId: echo.user?._id})}>
                                <Ionicons name="chatbubble-outline" size={18} color="#777" />
                            </Pressable>
                        </View>
                        <View style={styles.actionItem}>
                            <Pressable style={styles.actionButton} onPress={() => handleShare(echo.user._id, echo.content)}>
                                <MaterialIcons name="share" size={18} color="#777" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            ))
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.titleBar}>
                <Text style={styles.titleText}>Echoes</Text>
            </View><ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {renderEchoes()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
        marginTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#555',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#d9534f',
        marginVertical: 5,
    },
    echoCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    userImage: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    echoContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        marginBottom: 15,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        gap: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#777',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    noEchoesText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 20,
    },
    titleBar: {
        backgroundColor: '#f0f4f8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ced4da',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#002f34',
    }
});

export default Echoes;
