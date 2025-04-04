import { StyleSheet, Text, View, Image, FlatList, ScrollView, Pressable, TextInput, PermissionsAndroid, Share } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import products from '../products.json'
import { launchCamera } from 'react-native-image-picker';
import { FloatingAction } from 'react-native-floating-action';

const Home = ({ route }) => {

    const actions = [{
        text: 'Sell',
        icon: require('../assets/icons/icons8-sell-24.png'),
        name: 'sell_item',
        position: 1,
        color: '#555'
    },
    {
        text: 'Ask',
        icon: require('../assets/icons/icons8-ask-question-24(1).png'),
        name: 'ask',
        position: 2,
        color: '#555',
    }];

    const [recentlyAddedItems, setRecentlyAddedItems] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        if (route.params?.newItem) {
            setRecentlyAddedItems((prevItems) => [route.params.newItem, ...prevItems]);
        }
    }, [route.params?.newItem]);

    const renderItem = ({ item }) => (
        <>
            <View style={styles.card2}>
                <Pressable onPress={() => navigateToProductInfo(item)}>
                    <Image
                        style={{ height: 120, width: 120, alignSelf: 'center' }}
                        source={{ uri: item.imageUri }}
                    />
                    <Text style={{ color: 'black', fontSize: 17 }}>{item.title}</Text>
                    <Text style={{ color: 'black', fontSize: 15, alignSelf: 'flex-start' }}>₹ {item.price}</Text>
                </Pressable>
            </View>
        </>
    );

    const category = "Books";
    const category1 = "Notes";
    const category2 = "Tools";
    const category3 = "Gadgets";
    const Books = products.filter(product => product.category === category);
    const Notes = products.filter(product => product.category === category1);
    const Tools = products.filter(product => product.category === category2);
    const Gadgets = products.filter(product => product.category === category3);

    const imageMap = {
        book1: require('../assets/images/book1.jpg'),
        book2: require('../assets/images/book2.jpg'),
        book3: require('../assets/images/book3.jpg'),
        book4: require('../assets/images/book4.jpg'),
        notes1: require('../assets/images/notes1.jpg'),
        notes2: require('../assets/images/notes4.png'),
        notes3: require('../assets/images/notes2.jpg'),
        notes4: require('../assets/images/notes3.png'),
        tools1: require('../assets/images/tools5.jpg'),
        tools2: require('../assets/images/tools2.png'),
        tools3: require('../assets/images/tools3.jpg'),
        tools4: require('../assets/images/tools4.jpg'),
        gadget1: require('../assets/images/gadget1.png'),
        gadget2: require('../assets/images/gadget2.jpg'),
        gadget3: require('../assets/images/gadget3.png'),
        gadget4: require('../assets/images/gadget4.jpg'),
    };

    const navigateToProductInfo = (product) => {
        navigation.navigate('ProductInfo', { product });
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: "This person is in need! Kindly HELP!",
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Shared with an activity (e.g., shared via a specific app)
                } else {
                    // Shared without specifying the app
                }
            } else if (result.action === Share.dismissedAction) {
                // User dismissed the share dialog
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while trying to share the product.');
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the camera');
                } else {
                    console.log('Camera permission denied');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };
    const handleTakePhoto = async () => {
        await requestCameraPermission();
        launchCamera({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setimageUri(response.assets[0].uri);
            }
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                <Pressable>
                    <View style={styles.searchbar}>
                        <Image source={require('../assets/icons/icons8-search-24.png')} />
                        <TextInput placeholder='Search here' placeholderTextColor={"#555"} style={{ fontSize: 17, color: 'black', width: 250 }} />
                        <Pressable onPress={handleTakePhoto}>
                            <Image source={require('../assets/icons/icons8-camera-24.png')} />
                        </Pressable>
                    </View>
                </Pressable>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', marginTop: 50, fontSize: 20, paddingLeft: 20, fontWeight: 'bold' }}>Attention !</Text>
                    <Text style={{ color: 'black', marginTop: 57, paddingRight: 20, fontWeight: 'bold', textDecorationLine: 'underline' }}>See all</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={styles.cardbg}>
                            <View style={[styles.card1, styles.glassEffect]}>
                                <Image source={require('../assets/icons/icons8-male-user-48.png')} />
                                <View style={{ gap: 5 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: 'black', fontSize: 17, fontWeight: 'bold', width: 205 }}>Namrata Kaur <Text style={{ fontWeight: 'normal', color: 'grey', fontSize: 15 }}>· 8h</Text></Text>
                                        <Image source={require('../assets/icons/icons8-three-dots-17.png')} style={{ marginTop: 2 }} />
                                    </View>
                                    <Text style={{ color: 'black', width: 200, fontSize: 15 }}>I am in urgent need of a scientific calculator. If available, DM me asap!</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Conversation')}>
                                            <Image source={require('../assets/icons/icons8-chat-25.png')} style={{ marginBottom: 5 }} />
                                        </Pressable>
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onShare}>
                                            <Image source={require('../assets/icons/icons8-share-25.png')} style={{ marginLeft: 10, marginBottom: 5 }} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>


                <View style={{ height: 15, backgroundColor: 'whitesmoke', marginTop: 15 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', marginTop: 25, fontSize: 20, paddingLeft: 20 }}>Browse Categories</Text>
                    <Text style={{ color: 'black', marginTop: 32, paddingRight: 20, fontWeight: 'bold', textDecorationLine: 'underline' }}>See all</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={styles.card}>
                            <Image source={require('../assets/images/icons8-books-100.png')} />
                            <Text style={{ color: 'black', fontSize: 15 }}>BOOKS</Text>
                        </View>
                        <View style={styles.card}>
                            <Image source={require('../assets/images/icons8-notes-100.png')} />
                            <Text style={{ color: 'black', fontSize: 15 }}>NOTES</Text>
                        </View>
                        <View style={styles.card}>
                            <Image source={require('../assets/images/icons8-tools-100.png')} />
                            <Text style={{ color: 'black', fontSize: 15 }}>TOOLS</Text>
                        </View>
                        <View style={styles.card}>
                            <Image source={require('../assets/images/icons8-smartphone-tablet-100.png')} />
                            <Text style={{ color: 'black', fontSize: 15 }}>GADGETS</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={{ height: 15, backgroundColor: 'whitesmoke', marginTop: 15 }} />
                <View>
                    <Text style={{ color: 'black', marginTop: 25, fontSize: 20, paddingLeft: 20 }}>Recently Added</Text>
                    <FlatList
                        data={recentlyAddedItems}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        horizontal={true}
                    />
                    <View style={{ height: 15, backgroundColor: 'whitesmoke', marginTop: 15 }} />
                </View>

                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', marginTop: 25, fontSize: 20, paddingLeft: 20 }}>Top Featured</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Text style={{ color: 'black', paddingLeft: 20, fontSize: 17, marginVertical: 10, fontWeight: 'bold' }}>Books</Text>
                        <Image source={require('../assets/icons/icons8-arrow-24.png')} />
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {Books.map((product, index) => (
                            <View key={index} style={styles.card2}>
                                <Pressable onPress={() => navigateToProductInfo(product)}>
                                    <Image style={{ height: 120, width: 120, alignSelf: 'center' }} source={imageMap[product.imageKey]} />
                                    <Text style={{ color: 'black', fontSize: 17 }}>{product.name}</Text>
                                    <Text style={{ color: 'black', fontSize: 15, alignSelf: 'flex-start' }}>₹ {product.price}</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Text style={{ color: 'black', paddingLeft: 20, fontSize: 17, marginVertical: 10, fontWeight: 'bold' }}>Notes</Text>
                        <Image source={require('../assets/icons/icons8-arrow-24.png')} />
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {Notes.map((product, index) => (
                            <View key={index} style={styles.card2}>
                                <Pressable onPress={() => navigateToProductInfo(product)}>
                                    <Image style={{ height: 120, width: 120, alignSelf: 'center' }} source={imageMap[product.imageKey]} />
                                    <Text style={{ color: 'black', fontSize: 17 }}>{product.name}</Text>
                                    <Text style={{ color: 'black', fontSize: 15, alignSelf: 'flex-start' }}>₹ {product.price}</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={{ height: 15, backgroundColor: 'whitesmoke', marginTop: 15 }} />

                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'black', marginTop: 25, fontSize: 20, paddingLeft: 20 }}>Useful Stuff</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Text style={{ color: 'black', paddingLeft: 20, fontSize: 17, marginVertical: 10, fontWeight: 'bold' }}>Tools</Text>
                        <Image source={require('../assets/icons/icons8-arrow-24.png')} />
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {Tools.map((product, index) => (
                            <View key={index} style={styles.card2}>
                                <Pressable onPress={() => navigateToProductInfo(product)}>
                                    <Image style={{ height: 120, width: 120, alignSelf: 'center' }} source={imageMap[product.imageKey]} />
                                    <Text style={{ color: 'black', fontSize: 17 }}>{product.name}</Text>
                                    <Text style={{ color: 'black', fontSize: 15, alignSelf: 'flex-start' }}>₹ {product.price}</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                        <Text style={{ color: 'black', paddingLeft: 20, fontSize: 17, marginVertical: 10, fontWeight: 'bold' }}>Gadgets</Text>
                        <Image source={require('../assets/icons/icons8-arrow-24.png')} />
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        {Gadgets.map((product, index) => (
                            <View key={index} style={styles.card2}>
                                <Pressable onPress={() => navigateToProductInfo(product)}>
                                    <Image style={{ height: 120, width: 120, alignSelf: 'center' }} source={imageMap[product.imageKey]} />
                                    <Text style={{ color: 'black', fontSize: 17 }}>{product.name}</Text>
                                    <Text style={{ color: 'black', fontSize: 15, alignSelf: 'flex-start' }}>₹ {product.price}</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>

            </ScrollView>

            <FloatingAction
                actions={actions}
                onPressItem={name => {
                    if (name === 'sell_item') {
                        navigation.navigate("Sell")
                    }
                    else if (name === 'ask') {
                        navigation.navigate("Ask")
                    }
                }}
                floatingIcon={
                    <View>
                        <Image
                            source={require('../assets/icons/icons8-add-100.png')}
                            style={{ width: 30, height: 30 }}
                        />
                    </View>
                }
                floatingIconWidth={50}
                floatingIconHeight={50}
                showBackground={false}
                color='#5D4F00'
            />

        </SafeAreaView>
    )
}

export default Home

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
        paddingVertical: 10,
        paddingHorizontal: 10,
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
        borderColor: 'grey',
        width: 300,
        gap: 5,
        backgroundColor: 'rgba(255, 0, 0, 0.5)'
    },
    cardbg: {
        paddingVertical: 0,
        marginVertical: 0
    },
    glassEffect: {
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    card2: {
        flexDirection: 'column',
        paddingVertical: 10,
        marginVertical: 10,
        marginHorizontal: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        elevation: 5,
        width: 140,
        flexWrap: 'wrap'
    },
})