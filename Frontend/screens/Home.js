import { StyleSheet, Text, View, Image, FlatList, ScrollView, Pressable, TextInput, Alert, RefreshControl, LogBox } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FloatingAction } from 'react-native-floating-action';
import axios from 'axios';
import { getAccessToken } from '../utilities/keychainUtils'; // Import the storeAccessToken function
import { API_URL } from '@env'
import Icon from 'react-native-vector-icons/Ionicons';

const Home = ({ route }) => {

    useEffect(() => {
        LogBox.ignoreLogs([
            'VirtualizedLists should never be nested',
        ]);
    }, []);

    const actions = [{
        text: 'Sell',
        icon: <Icon name="wallet" size={22} color="white" />,
        name: 'sell_item',
        position: 1,
        color: '#555'
    },
    {
        text: 'Ask',
        icon: <Icon name="help-circle" size={22} color="white" />,
        name: 'ask',
        position: 2,
        color: '#555',
    }];

    const [recentlyAddedItems, setRecentlyAddedItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false); // State for manual refresh
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigation = useNavigation();

    // Consider fetching posts again if a new item is added instead of directly adding to the state
    // This ensures data consistency with the backend
    useEffect(() => {
        if (route.params?.newItem) {
            fetchPosts(); // Re-fetch posts to include the new item
            // Alternatively, if you are certain the backend returns the new item in the next fetch,
            // you could keep the current approach but be mindful of potential duplication.
            // setRecentlyAddedItems((prevItems) => [route.params.newItem, ...prevItems]);
        }
    }, [route.params?.newItem]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const token = await getAccessToken();
        if (token) {
            try {
                const response = await axios.get(`${API_URL}/post/sell-posts`, {
                    headers: { Authorization: `Bearer ${token}` }, // ✅ Corrected string interpolation
                });
                if (response.status >= 200 && response.status < 300) {
                    const unsoldItems = response.data.data.filter(item => item.status !== 'sold');
                    setRecentlyAddedItems(unsoldItems);
                } else {
                    Alert.alert('Error', 'Failed to fetch posts.');
                    console.error('Failed to fetch posts:', response);
                }

            } catch (error) {
                console.log('Error fetching posts:', JSON.stringify(error, null, 2));
                Alert.alert('Error', 'Could not connect to the server to fetch posts.');
            } finally {
                setRefreshing(false); // ✅ Ensures refresh state ends in all cases
            }
        } else {
            Alert.alert('Authentication Required', 'Please log in to view posts.');
            navigation.navigate('Login');
            setRefreshing(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        const filtered = recentlyAddedItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(filtered);
        setIsSearching(true);
    };

    // Function to handle manual refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts();
    }, []);

    const categories = ['books', 'notes', 'tools', 'gadgets'];

    const categoryImages = {
        books: require('../assets/images/icons8-books-100.png'),
        notes: require('../assets/images/icons8-notes-100.png'),
        tools: require('../assets/images/icons8-tools-100.png'),
        gadgets: require('../assets/images/icons8-gadgets-100.png'),
    };
    const categoryRefs = {
        books: useRef(null),
        notes: useRef(null),
        tools: useRef(null),
        gadgets: useRef(null),
    };

    const scrollViewRef = useRef();

    const scrollToCategory = (category) => {
        categoryRefs[category]?.current?.measureLayout(
            scrollViewRef.current,
            (x, y) => {
                scrollViewRef.current.scrollTo({ y, animated: true });
            }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card2}>
            <Pressable onPress={() => navigateToProductInfo(item)}>
                <Image
                    style={{ height: 120, width: 120, alignSelf: 'center' }}
                    source={{ uri: item.image }} // Use item.image
                />
                <Text style={{ color: 'black', fontSize: 17 }}>{item.title}</Text>
                <Text style={{ color: 'black', fontSize: 17 }}>₹ {item.price}</Text>
                {/* <Text style={{ color: 'black', fontSize: 15 }}>₹{item.price.toString}</Text> */}
            </Pressable>
        </View>
    );

    const navigateToProductInfo = (product) => {
        navigation.navigate('ProductInfo', { product });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.heading}>
                            Navrachana{"\n"}University
                        </Text>
                        <Text style={styles.motto}>
                            Ask <Text style={{ fontWeight: 'bold' }}>Someone..</Text>{"\n"}Help <Text style={{ fontWeight: 'bold' }}>Everyone..</Text>
                        </Text>
                    </View>
                    <Image
                        style={styles.university}
                        source={require('../assets/images/university.png')} />
                </View>

                {/* Search Bar */}
                <Pressable>
                    <View style={styles.searchbar}>
                        <Icon name="search" size={24} color="grey" />
                        <TextInput
                            placeholder="What are you looking for?"
                            placeholderTextColor={'#555'}
                            style={{ fontSize: 14, color: 'black', width: 220 }}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => handleSearch('')} />
                        )}
                    </View>
                </Pressable>

                {/* Show search results if searching */}
                {isSearching ? (
                    <View style={{ paddingHorizontal: 20, marginTop: 60 }}>
                        <Text style={{ color: 'black', fontSize: 18, marginBottom: 10 }}>
                            Search Results for "{searchQuery}"
                        </Text>
                        {searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
                                renderItem={renderItem}
                                numColumns={2}               // Show 2 items per row
                                columnWrapperStyle={{        // Space between the two items horizontally
                                    justifyContent: 'space-between',
                                    marginBottom: 15,
                                }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        ) : (
                            <Text style={{ color: 'gray' }}>No results found.</Text>
                        )}
                    </View>

                ) : (
                    <>
                        {/* Categories and Items */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ color: 'black', marginTop: 48, fontSize: 18, paddingLeft: 20 }}>Browse Categories</Text>
                            <Pressable onPress={() => { }}>
                                <Text style={{ color: 'black', marginTop: 52, paddingRight: 20, fontWeight: 'bold', textDecorationLine: 'underline' }}>See all</Text>
                            </Pressable>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {categories.map((cat) => (
                                    <Pressable key={cat} style={styles.card} onPress={() => scrollToCategory(cat)}>
                                        <Image source={categoryImages[cat]} style={{ height: 80, width: 80 }} />
                                        <Text style={{ color: 'black', fontSize: 13 }}>{cat.toUpperCase()}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={{ height: 4, backgroundColor: 'whitesmoke', marginTop: 15 }} />

                        {/* Recently Added and Categories */}
                        <View>
                            <Text style={{ color: 'black', marginTop: 8, fontSize: 18, paddingLeft: 20 }}>Recently Added</Text>
                            <FlatList
                                data={
                                    [...recentlyAddedItems]
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .slice(0, 5)
                                }
                                keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
                                renderItem={renderItem}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            />
                            <View style={{ height: 4, backgroundColor: 'whitesmoke', marginTop: 15 }} />
                        </View>

                        {/* Filtered category lists */}
                        {categories.map((category) => (
                            <View key={category} ref={categoryRefs[category]}>
                                <Text style={{ color: 'black', marginTop: 25, fontSize: 18, paddingLeft: 20 }}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Text>
                                <FlatList
                                    data={recentlyAddedItems.filter(item => item.category === category)}
                                    keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
                                    renderItem={renderItem}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                />
                                <View style={{ height: 4, backgroundColor: 'whitesmoke', marginTop: 15 }} />
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Floating Button */}
            <FloatingAction
                actions={actions}
                onPressItem={name => {
                    if (name === 'sell_item') {
                        navigation.navigate("Sell");
                    } else if (name === 'ask') {
                        navigation.navigate("Ask");
                    }
                }}
                floatingIcon={
                    <View>
                        <Icon name="add-circle-outline" size={30} color="white" />
                    </View>
                }
                floatingIconWidth={50}
                floatingIconHeight={50}
                showBackground={false}
                color='#5D4F00'
            />

        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#350f55',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    heading: {
        fontSize: 35,
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'left',
        paddingTop: 20,
        paddingLeft: 20
    },
    motto: {
        color: '#fff',
        paddingTop: 10,
        paddingLeft: 20,
        fontSize: 18,
    },
    university: {
        width: 191,
        height: 191,
    },
    searchbar: {
        backgroundColor: '#ffffff',
        width: 330,
        alignSelf: 'center',
        borderRadius: 10,
        elevation: 10,
        position: 'absolute',
        bottom: -33,
        zIndex: 1,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    card: {
        flexDirection: 'column',
        paddingVertical: 0,
        paddingHorizontal: 9,
        alignItems: 'center',
    },
    card1: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'flex-start',
        borderWidth: 1.5,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 10,
        borderColor: '#CCCCCC',
        width: 300,
        gap: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.45)' // Changed to white with opacity
    },
    cardbg: {
        paddingVertical: 0,
        marginVertical: 0
    },
    glassEffect: {
        // backgroundColor: 'rgba(255, 255, 255, 0.45)', // Already applied in card1
        borderRadius: 10,
        overflow: 'hidden',
    },
    card2: {
        flexDirection: 'column',
        paddingVertical: 10,
        marginVertical: 10,
        marginHorizontal: 10, // Reduced horizontal margin for more items to fit
        paddingHorizontal: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        elevation: 5,
        width: 140,
        flexWrap: 'wrap'
    },
});