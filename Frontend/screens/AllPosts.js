import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { getAccessToken } from '../utilities/keychainUtils';
import axios from 'axios';
import { API_URL } from '@env';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const dummyImage = require('../assets/images/university.png');

const AllPosts = ({ route }) => {
  const { selectedProduct, allProducts } = route.params || {};
  const navigation = useNavigation();
  const listRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [product, setProduct] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchUserProducts();
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUserProducts = async () => {
    try {
      const token = await getAccessToken();
      const response = await axios.get(`${API_URL}/post/sell-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Set the state where you hold products, e.g.
      setProduct(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch user products", error);
    }
  };

  // Track which product menu is open (_id or null)
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const [editableProduct, setEditableProduct] = useState(null);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    image: '',
  });

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        console.log('Picked image URI:', response.assets[0].uri);
        const uri = response.assets[0].uri;
        setEditFields({ ...editFields, image: uri });
      }
    });
  };

  const handleTakePhoto = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        console.log('Picked image URI:', response.assets[0].uri);
        const uri = response.assets[0].uri;
        setEditFields({ ...editFields, image: uri });
      }
    });
  };

  useEffect(() => {
    if (selectedProduct && listRef.current && allProducts?.length > 0) {
      const index = [...allProducts].reverse().findIndex(p => p._id === selectedProduct._id);
      if (index >= 0) {
        listRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedProduct, allProducts]);

  const onEdit = (item) => {
    setMenuOpenFor(null);
    setEditableProduct(item);
    setEditFields({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      category: item.category,
      image: item.image,
    });
  };
  const categoryData = [
    { label: 'Books', value: 'books' },
    { label: 'Notes', value: 'notes' },
    { label: 'Tools', value: 'tools' },
    { label: 'Gadgets', value: 'gadgets' },
  ];

  const onShare = async (item) => {
    try {
      const result = await Share.share({
        message: `Check out this product: ${item.title}\n\nDescription: ${item.description || ''}\n\nPrice: ₹${item.price}\n\nSeller: ${item.seller?.fullName || 'Unknown'}`,
        // You can customize message, title, url, etc.
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type of:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share the product. Please try again.');
      console.error('Share error:', error);
    }
  };

  const onDelete = async (item) => {
    setMenuOpenFor(null);
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAccessToken();
              await axios.delete(`${API_URL}/post/sell-post/${item._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Refresh the product list or filter locally
              setProduct(prev => prev.filter(p => p._id !== item._id));
              Alert.alert("Deleted", "Product deleted successfully");
            } catch (error) {
              console.error("Failed to delete product", error.response?.data || error);
              Alert.alert("Error", "Failed to delete the product.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const renderItem = ({ item }) => {
    const status = (item.status || item.Status || 'Available').toUpperCase();
    const isSold = status === 'SOLD';

    return (
      <View style={styles.cardContainer}>
        {/* Top section: profile + options */}
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.seller?._id })}>
            <View style={styles.profileRow}>
              <Image
                source={
                  item.seller?.ProfilePicture && typeof item.seller.ProfilePicture === 'string'
                    ? { uri: item.seller.ProfilePicture }
                    : dummyImage
                }
                style={styles.profilePic}
              />
              <Text style={styles.fullName}>{item.seller?.fullName || 'User Name'}</Text>
            </View>
          </TouchableOpacity>

          <View>
            <TouchableOpacity
              onPress={() =>
                setMenuOpenFor(menuOpenFor === item._id ? null : item._id)
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="ellipsis-vertical" size={22} color="black" />
            </TouchableOpacity>

            {/* Dropdown menu below ellipsis */}
            {menuOpenFor === item._id && (
              <View style={styles.menu}>
                {item.Status?.toLowerCase() !== 'sold' && (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => onEdit(item)}
                    >
                      <Text style={styles.menuText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => onShare(item)}
                    >
                      <Text style={styles.menuText}>Share</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => onDelete(item)}
                >
                  <Text style={[styles.menuText, { color: 'red' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Product image */}
        <Image
          source={
            item.image && typeof item.image === 'string'
              ? { uri: item.image }
              : dummyImage
          }
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* Product details */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <Text style={[styles.productTitle, { marginRight: 8 }]}>
            {item.title}
          </Text>

          <View
            style={{
              backgroundColor:
                item.Status?.toLowerCase() === 'sold' ? 'red' : 'green',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {(item.Status || 'Available').toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Products</Text>
      </View>

      <FlatList
        ref={listRef}
        data={[...allProducts].reverse()}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLayout={() => {
          setTimeout(() => {
            if (selectedProduct && listRef.current) {
              const index = [...allProducts].reverse().findIndex(p => p._id === selectedProduct._id);
              if (index >= 0) {
                listRef.current.scrollToIndex({ index, animated: true });
              }
            }
          }, 300);
        }}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, animated: true });
          }, 300);
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: 'gray', fontSize: 16 }}>No products available</Text>
          </View>
        }
      />

      {editableProduct && (
        <View style={styles.editContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ color: 'black', fontWeight: '600', marginTop: 20, fontSize: 17 }}>
              Product Image:
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
              <Pressable onPress={handleSelectImage} style={styles.btn}>
                <Icon name="images-outline" size={24} color="#fff" />
                <Text style={styles.btnText}>Select from Gallery</Text>
              </Pressable>
              <Pressable onPress={handleTakePhoto} style={styles.btn}>
                <Icon name="camera-outline" size={24} color="#fff" />
                <Text style={styles.btnText}>Take Photo</Text>
              </Pressable>
            </View>

            {/* Move this ABOVE Title */}
            {editFields.image && (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: editFields.image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.cross}
                    onPress={() => setEditFields({ ...editFields, image: null })}
                  >
                    <Text style={styles.crossText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={{ color: 'black', fontWeight: '600', paddingBottom: 0, marginBottom: 0, fontSize: 17 }}>
              Title:
            </Text>
            <TextInput
              style={styles.input}
              value={editFields.title}
              placeholder="Title"
              onChangeText={(text) => setEditFields({ ...editFields, title: text })}
            />

            <Text style={{ color: 'black', fontWeight: '600', paddingBottom: 0, marginBottom: 0, marginTop: 20, fontSize: 17 }}>
              Description:
            </Text>
            <TextInput
              style={styles.input}
              value={editFields.description}
              placeholder="Description"
              multiline
              onChangeText={(text) => setEditFields({ ...editFields, description: text })}
            />

            <Text style={{ color: 'black', fontWeight: '600', paddingBottom: 0, marginBottom: 0, marginTop: 20, fontSize: 17 }}>
              Price:
            </Text>
            <TextInput
              style={styles.input}
              value={editFields.price}
              placeholder="Price"
              keyboardType="numeric"
              onChangeText={(text) => setEditFields({ ...editFields, price: text })}
            />

            <Text style={{ color: 'black', fontWeight: '600', paddingBottom: 0, marginBottom: 0, marginTop: 20, fontSize: 17 }}>
              Quantity:
            </Text>
            <TextInput
              style={styles.input}
              value={editFields.quantity}
              placeholder="Quantity"
              keyboardType="numeric"
              onChangeText={(text) => setEditFields({ ...editFields, quantity: text })}
            />

            <Text style={{ color: 'black', fontWeight: '600', paddingBottom: 0, marginBottom: 0, marginTop: 20, fontSize: 17 }}>
              Category:
            </Text>
            <Dropdown
              style={styles.dropdown}
              data={categoryData}
              labelField="label"
              valueField="value"
              placeholder="Select Category"
              value={editFields.category}
              onChange={(item) => setEditFields({ ...editFields, category: item.value })}
              placeholderStyle={{ color: '#888', fontSize: 14 }}
              selectedTextStyle={{ color: 'black', fontSize: 14 }}
              itemTextStyle={{ color: 'black' }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                style={[styles.updateBtn, isUpdating && { opacity: 0.7, flex: 1, marginRight: 8 }]}
                disabled={isUpdating}
                onPress={async () => {
                  try {
                    setIsUpdating(true); // Start loader

                    const token = await getAccessToken();

                    const formData = new FormData();
                    formData.append("title", editFields.title);
                    formData.append("description", editFields.description);
                    formData.append("price", editFields.price);
                    formData.append("quantity", editFields.quantity);
                    formData.append("category", editFields.category);

                    // Only append image if it's a new local file
                    if (editFields.image && editFields.image.startsWith("file://")) {
                      formData.append("Productpicture", {
                        uri: editFields.image,
                        name: "photo.jpg",
                        type: "image/jpeg",
                      });
                    }

                    await axios.put(`${API_URL}/post/sell-post/${editableProduct._id}`, formData, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    });

                    Alert.alert("Updated", "Product updated successfully");
                    setEditableProduct(null);
                    await fetchUserProducts(); // Refresh product list
                  } catch (error) {
                    console.error(error.response?.data || error);
                    Alert.alert("Error", "Failed to update product");
                  } finally {
                    setIsUpdating(false); // Stop loader
                  }
                }}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>Update</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.updateBtn, { backgroundColor: '#aaa' }]}
                disabled={isUpdating}
                onPress={() => {
                  setEditableProduct(null);
                  // optionally reset editFields here if needed
                }}
              >
                <Text style={[styles.btnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

    </SafeAreaView>
  );
};

export default AllPosts;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  cardContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  productPrice: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sold: {
    backgroundColor: 'red',
    color: 'white',
  },
  available: {
    backgroundColor: 'green',
    color: 'white',
  },

  menu: {
    position: 'absolute',
    top: 28, // slightly below the icon
    right: 0,
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 120,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  editContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8,
    padding: 8,
    color: '#000',
  },
  btn: {
    backgroundColor: '#5D4F00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '48%',
  },
  updateBtn: {
    backgroundColor: '#5D4F00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  dropdown: {
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
  }
});