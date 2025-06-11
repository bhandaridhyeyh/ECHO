import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const dummyImage = require('../assets/images/university.png');

const AllPosts = ({ route }) => {
  const { selectedProduct, allProducts } = route.params || {};
  const navigation = useNavigation();
  const listRef = useRef(null);

  // Track which product menu is open (_id or null)
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  useEffect(() => {
    if (selectedProduct && listRef.current && allProducts?.length > 0) {
      const index = allProducts.findIndex(p => p._id === selectedProduct._id);
      if (index >= 0) {
        listRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedProduct, allProducts]);

  const onEdit = (item) => {
    setMenuOpenFor(null);
    // Your edit logic here
    console.log('Edit clicked for', item._id);
  };

  const onDelete = (item) => {
    setMenuOpenFor(null);
    // Your delete logic here
    console.log('Delete clicked for', item._id);
  };

  const renderItem = ({ item }) => {
    const status = (item.status || item.Status || 'Available').toUpperCase();
    const isSold = status === 'SOLD';
    console.log('Seller:', item.seller);

    return (
      <View style={styles.cardContainer}>
        {/* Top section: profile + options */}
        <View style={styles.cardHeader}>
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
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => onEdit(item)}
                >
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
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
        <Text style={styles.productTitle}>{item.title}</Text>
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
        data={allProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onLayout={() => {
          setTimeout(() => {
            if (selectedProduct && listRef.current) {
              const index = allProducts.findIndex(p => p._id === selectedProduct._id);
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
      />
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
});