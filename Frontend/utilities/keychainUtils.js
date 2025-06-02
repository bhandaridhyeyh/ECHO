// keychainUtils.js

import * as Keychain from 'react-native-keychain'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
const ACCESS_TOKEN_KEY = 'tradeMateAccessToken'; // Use a consistent key for your access token

const storeAccessToken = async (accessToken) => {
  try {
    const tokenStr = typeof accessToken === 'string' ? accessToken : JSON.stringify(accessToken); // force string
    await Keychain.setGenericPassword('token', tokenStr);
    console.log('Access token stored securely.');
    return true;
  } catch (error) {
    console.error('Failed to store access token:', error);
    return false;
  }
};

const getAccessToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const token = credentials.password;
      try {
        return JSON.parse(token); // If it's a stringified object
      } catch {
        return token; // Already a string
      }
    } else {
      console.log('No access token found in keychain.');
      return null;
    }
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

const deleteAccessToken = async () => {
  try {
    await Keychain.resetGenericPassword();
    console.log('Access token removed from keychain.');
    return true;
  } catch (error) {
    console.error('Failed to delete access token:', error);
    return false;
  }
};

const getCurrentUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('tradeMateUserId');
    return userId;
  } catch (err) {
    console.error("Failed to get user ID:", err);
    return null;
  }
};
export { storeAccessToken, getAccessToken, deleteAccessToken, getCurrentUserId };