import {
    StyleSheet,
    Text,
    View,
    TextInput,
    SafeAreaView,
    ScrollView,
    Image,
    PermissionsAndroid,
    Platform,
    TouchableOpacity,
    Pressable,
    Alert,
    Dimensions,
    ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import React, { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAccessToken } from '../utilities/keychainUtils'; // Import getAccessToken
import { API_URL } from '@env'
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Sell = () => {
    const [value, setValue] = useState(null);
    const [usage, setUsage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setimageUri] = useState(null);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // State for loader

    const data = [
        { label: 'Books', value: 'books' },
        { label: 'Notes', value: 'notes' },
        { label: 'Tools', value: 'tools' },
        { label: 'Gadgets', value: 'gadgets' },
    ];

    const course = [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
    ];

    const handlePost = async () => {
        if (
            !value ||
            !title.trim() ||
            !description.trim() ||
            !price.trim() ||
            !imageUri ||
            !usage
        ) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        const token = await getAccessToken();
        if (!token) {
            Alert.alert('Authentication Required', 'Please log in to post an item.');
            navigation.navigate('Login'); // Redirect to login if no token
            return;
        }

        setLoading(true); // Start loading

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('quantity', usage);
            formData.append('price', price);
            formData.append('status', 'available'); // Add status, default to 'available'
            formData.append('category', value);

            // Prepare the image file for upload
            const imageName = imageUri.split('/').pop();
            const imageType = 'image/jpeg'; // Adjust type if necessary
            formData.append('Productpicture', { // Use 'Productpicture' with capital 'P'
                uri: imageUri,
                name: imageName,
                type: imageType,
            });

            const response = await axios.post(`${API_URL}/post/sell-posts`, formData, { // Assuming your backend route is /api/posts
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                Alert.alert('Success', 'Your item has been posted successfully!');
                navigation.navigate('Main', { screen: 'Home' }); // Navigate back to home after successful post
            } else {
                Alert.alert('Error', 'Failed to post item.');
                console.error('Failed to post item:', response);
            }
        } catch (error) {
            console.error('Error posting item:', error);
            Alert.alert('Error', 'Could not connect to the server or an error occurred during posting.');
        } finally {
            setLoading(false); // End loading
        }
    };

    const handleSelectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, response => {
            if (response.assets && response.assets.length > 0) {
                setimageUri(response.assets[0].uri);
            }
        });
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
        launchCamera({ mediaType: 'photo' }, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setimageUri(response.assets[0].uri);
            }
        });
    };

    const handleRemoveImage = () => {
        setimageUri(null);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: screenHeight * 0.05 }}>
                <View style={{ flexDirection: 'row', marginLeft: screenWidth * 0.02, marginTop: screenHeight * 0.02, alignItems: 'center', gap: screenWidth * 0.02 }}>
                    <Icon name="chevron-back" size={30} color="#000" onPress={() => navigation.goBack()} />
                    <Text style={styles.heading}>What are you offering?</Text>
                </View>
                <View style={styles.container}>
                    <Text style={styles.labels}>
                        Upload an image of your product
                        <Text style={{ verticalAlign: 'top' }}>*</Text> :
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Pressable onPress={handleSelectImage} style={styles.btn}>
                            <Icon name="images-outline" size={24} color="#fff" />
                            <Text style={styles.btnText}>Select from Gallery</Text>
                        </Pressable>
                        <Pressable onPress={handleTakePhoto} style={styles.btn}>
                            <Icon name="camera-outline" size={24} color="#fff" />
                            <Text style={styles.btnText}>Take Photo</Text>
                        </Pressable>
                    </View>
                    {imageUri && (
                        <View style={styles.imagePreviewContainer}>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                                <TouchableOpacity
                                    style={styles.cross}
                                    onPress={handleRemoveImage}>
                                    <Text style={styles.crossText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
                <View style={styles.details}>
                    <Text style={styles.labels}>
                        Category<Text style={{ verticalAlign: 'top' }}>*</Text> :{' '}
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={data}
                        labelField="label"
                        valueField="value"
                        placeholder="Select category"
                        placeholderStyle={{ color: '#555', fontSize: screenWidth * 0.04 }}
                        itemTextStyle={{ color: 'black' }}
                        selectedTextStyle={{ color: 'black' }}
                        value={value}
                        onChange={item => setValue(item.value)}
                    />
                </View>

                <View style={styles.details}>
                    <Text style={styles.labels}>
                        Quantity<Text style={{ verticalAlign: 'top' }}>*</Text> :{' '}
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={course}
                        labelField="label"
                        valueField="value"
                        placeholder="1"
                        placeholderStyle={{ color: 'black', fontSize: screenWidth * 0.04 }}
                        itemTextStyle={{ color: 'black' }}
                        selectedTextStyle={{ color: 'black' }}
                        value={usage}
                        onChange={item => setUsage(item.value)}
                    />
                </View>

                <View style={styles.details}>
                    <Text style={styles.labels}>
                        Add title<Text style={{ verticalAlign: 'top' }}>*</Text> :{' '}
                    </Text>
                    <TextInput
                        placeholder="Name of your product"
                        placeholderTextColor={'#555'}
                        style={styles.input}
                        value={title}
                        onChangeText={text => setTitle(text)}
                    />
                </View>
                <View style={styles.details}>
                    <Text style={styles.labels}>
                        Add description<Text style={{ verticalAlign: 'top' }}>*</Text> :{' '}
                    </Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={4}
                        placeholder="Describe what you are selling"
                        placeholderTextColor={'#555'}
                        style={styles.input1}
                        value={description}
                        onChangeText={text => setDescription(text)}
                    />
                    <Text style={{ color: 'black', fontSize: screenWidth * 0.03 }}>
                        Include condition, features and reason for selling
                    </Text>
                </View>

                <View style={styles.details}>
                    <Text style={styles.labels}>
                        Set Price<Text style={{ verticalAlign: 'top' }}>*</Text> :{' '}
                    </Text>
                    <View style={styles.input2}>
                        <Text
                            style={{
                                color: 'black',
                                fontSize: screenWidth * 0.05,
                                fontWeight: 'bold',
                            }}>
                            ₹
                        </Text>
                        <TextInput
                            keyboardType="numeric"
                            style={{
                                color: 'black',
                                fontSize: screenWidth * 0.05,
                                width: screenWidth * 0.8,
                                fontWeight: 'bold',
                            }}
                            value={price}
                            onChangeText={text => setPrice(text)}
                        />
                    </View>
                </View>

                <Pressable style={styles.post} onPress={handlePost} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : (
                        <Text
                            style={{
                                fontSize: screenWidth * 0.05,
                                color: 'white',
                                textAlign: 'center',
                            }}>
                            Post Now
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Sell;

const styles = StyleSheet.create({
    heading: {
        color: 'black',
        fontSize: screenWidth * 0.065,
        fontWeight: 'bold',
    },
    details: {
        flexDirection: 'column',
        marginLeft: screenWidth * 0.04,
        marginVertical: screenHeight * 0.02,
    },
    labels: {
        color: '#5D4F00',
        fontSize: screenWidth * 0.045,
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 10,
        backgroundColor: 'white',
        paddingHorizontal: screenWidth * 0.025,
        width: screenWidth * 0.92,
        elevation: 2,
        color: '#000000',
        fontSize: screenWidth * 0.04,
        marginVertical: screenHeight * 0.01,
    },
    input1: {
        textAlignVertical: 'top',
        borderRadius: 10,
        backgroundColor: 'white',
        paddingHorizontal: screenWidth * 0.025,
        width: screenWidth * 0.92,
        height: screenHeight * 0.2,
        elevation: 2,
        color: '#000000',
        fontSize: screenWidth * 0.04,
        marginVertical: screenHeight * 0.01,
    },
    input2: {
        flexDirection: 'row',
        alignItems: 'center',
        textAlignVertical: 'top',
        borderRadius: 10,
        backgroundColor: 'white',
        paddingHorizontal: screenWidth * 0.025,
        width: screenWidth * 0.92,
        elevation: 2,
        color: '#000000',
        fontSize: screenWidth * 0.04,
        marginVertical: screenHeight * 0.01,
        gap: screenWidth * 0.01,
    },
    dropdown: {
        height: screenHeight * 0.06,
        width: screenWidth * 0.92,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.025,
        backgroundColor: 'white',
        marginVertical: screenHeight * 0.01,
        elevation: 3,
    },
    container: {
        marginTop: screenHeight * 0.05,
        marginLeft: screenWidth * 0.04,
        gap: screenHeight * 0.01,
        width: screenWidth * 0.92,
        marginBottom: screenHeight * 0.02,
    },
    btn: {
        borderRadius: 5,
        backgroundColor: '#350f55',
        paddingVertical: screenHeight * 0.015,
        width: screenWidth * 0.44,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: screenWidth * 0.025,
    },
    btnIcon: {
        width: screenWidth * 0.06,
        height: screenWidth * 0.06,
        resizeMode: 'contain',
    },
    btnText: {
        textAlign: 'center',
        fontSize: screenWidth * 0.035,
        fontWeight: 'bold',
        color: 'white',
    },
    imagePreviewContainer: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#555',
        padding: screenWidth * 0.025,
        borderRadius: 10,
        width: screenWidth * 0.75,
        alignSelf: 'center',
        marginTop: screenHeight * 0.01,
    },
    imageWrapper: {
        position: 'relative',
        alignItems: 'center',
        width: screenWidth * 0.65,
        alignSelf: 'center',
    },
    image: {
        width: screenWidth * 0.55,
        height: screenWidth * 0.55,
        marginVertical: screenHeight * 0.03,
    },
    cross: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#5D4F00',
        width: screenWidth * 0.065,
        height: screenWidth * 0.065,
        borderRadius: screenWidth * 0.0325,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crossText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: screenWidth * 0.04,
    },
    post: {
        alignSelf: 'center',
        backgroundColor: '#5D4F00',
        width: screenWidth * 0.9,
        marginBottom: screenHeight * 0.04,
        height: 'auto',
        elevation: 3,
        padding: screenHeight * 0.015,
        borderRadius: 10,
        justifyContent: 'center', // Center content horizontally
        alignItems: 'center',     // Center content vertically
    },
});