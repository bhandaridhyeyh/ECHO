import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProductInfo from '../screens/ProductInfo';
import Payment from '../screens/Payment';
import Chat from '../screens/Chat';
import Profile from '../screens/Profile';
import Conversation from '../screens/Conversation';
import Ask from '../screens/Ask';
import CompleteProfile from '../screens/CompleteProfile';
import Icon from 'react-native-vector-icons/Ionicons';
import Echoes from '../screens/Echoes';
import Sell from '../screens/Sell';
import Otp from '../screens/Otp';
import OtherUser from '../screens/OtherUser';
import AllPosts from '../screens/AllPosts'; 
import socket from '../utilities/socket.js';

// Import your getAccessToken function if you have one, else use AsyncStorage directly
import { getAccessToken } from '../utilities/keychainUtils'; 

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  const [initialRoute, setInitialRoute] = useState(null); // null means still loading

  useEffect(() => {
    async function checkLogin() {
      try {
        const token = await getAccessToken(); // or use AsyncStorage.getItem('accessToken');
        const userId = await AsyncStorage.getItem('tradeMateUserId');

        if (token && userId) {
          setInitialRoute('Main');
        } else {
          setInitialRoute('Login');
        } 
        if ( !socket || !socket.connected){
        socket.connect()  
        socket.emit("register", userId);
    }; 
      } catch (err) {
        console.error('Error checking login:', err);
        setInitialRoute('Login'); // fallback to Login on error
      }
    }

    checkLogin();
  }, []);

  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#f0f4f8',
            borderTopWidth: 1,
            borderTopColor: '#ced4da',
            height: 60,
          },
          tabBarItemStyle: { paddingVertical: 6 },
          tabBarLabelStyle: {
            color: '#002f34',
            fontWeight: 'bold',
            fontSize: 13,
            marginBottom: 2,
          },
          tabBarIconStyle: { marginTop: 2 },
          tabBarActiveTintColor: '#002f34',
          tabBarInactiveTintColor: '#495057',
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: 'Home',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'home' : 'home-outline'}
                size={26}
                style={{ color: focused ? '#002f34' : '#495057' }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Echoes"
          component={Echoes}
          options={{
            tabBarLabel: 'Echoes',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'mic' : 'mic-outline'}
                size={26}
                style={{ color: focused ? '#002f34' : '#495057' }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            tabBarLabel: 'Chat',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={26}
                style={{ color: focused ? '#002f34' : '#495057' }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: 'Profile',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={26}
                style={{ color: focused ? '#002f34' : '#495057' }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Show loader while deciding initial route
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20 }}>Opening ECHO...</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={Otp} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductInfo" component={ProductInfo} options={{ headerShown: false }} />
        <Stack.Screen name="AllPosts" component={AllPosts} options={{ headerShown: false }} />
        <Stack.Screen name="Ask" component={Ask} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        <Stack.Screen name="Conversation" component={Conversation} options={{ headerShown: false }} />
        <Stack.Screen name="Sell" component={Sell} options={{ headerShown: false }} />
        <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="OtherUser" component={OtherUser} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Echoes" component={Echoes} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});