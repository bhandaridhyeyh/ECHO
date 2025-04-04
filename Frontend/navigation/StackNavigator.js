import {Image, StyleSheet} from 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProductInfo from '../screens/ProductInfo';
import Payment from '../screens/Payment';
import Sell from '../screens/Sell';
import Chat from '../screens/Chat';
import Profile from '../screens/Profile';
import Conversation from '../screens/Conversation';
import Ask from '../screens/Ask';
import CompleteProfile from '../screens/CompleteProfile'; // Import the CompleteProfile screen

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: 'Home',
            tabBarLabelStyle: {
              color: '#002f34',
              fontWeight: 'bold',
              fontSize: 13,
              marginBottom: 5,
            },
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <Image
                style={{marginTop: 5}}
                source={
                  focused
                    ? require('../assets/icons/icons8-home-24.png')
                    : require('../assets/icons/icons8-home-24(1).png')
                }
              />
            ),
          }}
        />

        <Tab.Screen
          name="Ask"
          component={Ask}
          options={{
            tabBarLabel: 'Ask',
            tabBarLabelStyle: {
              color: '#002f34',
              fontWeight: 'bold',
              fontSize: 13,
              marginBottom: 5,
            },
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <Image
                style={{marginTop: 5}}
                source={
                  focused
                    ? require('../assets/icons/icons8-ask-question-24(1).png')
                    : require('../assets/icons/icons8-ask-question-24.png')
                }
              />
            ),
          }}
        />

        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            tabBarLabel: 'Chat',
            tabBarLabelStyle: {
              color: '#002f34',
              fontWeight: 'bold',
              fontSize: 13,
              marginBottom: 5,
            },
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <Image
                style={{marginTop: 5}}
                source={
                  focused
                    ? require('../assets/icons/icons8-chat-24.png')
                    : require('../assets/icons/icons8-chat-24(1).png')
                }
              />
            ),
          }}
        />

        <Tab.Screen
          name="Sell"
          component={Sell}
          options={{
            tabBarLabel: 'Sell',
            tabBarLabelStyle: {
              color: '#002f34',
              fontWeight: 'bold',
              fontSize: 13,
              marginBottom: 5,
            },
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <Image
                style={{marginTop: 5}}
                source={
                  focused
                    ? require('../assets/icons/icons8-sell-24.png')
                    : require('../assets/icons/icons8-sell-24(1).png')
                }
              />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: 'Profile',
            tabBarLabelStyle: {
              color: '#002f34',
              fontWeight: 'bold',
              fontSize: 13,
              marginBottom: 5,
            },
            headerShown: false,
            tabBarIcon: ({focused}) => (
              <Image
                style={{marginTop: 5}}
                source={
                  focused
                    ? require('../assets/icons/icons8-user-24.png')
                    : require('../assets/icons/icons8-user-24(1).png')
                }
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProductInfo"
          component={ProductInfo}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Ask"
          component={Ask}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Conversation"
          component={Conversation}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Sell"
          component={Sell}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{headerShown: false}}
        />
        <Stack.Screen // Add the CompleteProfile screen to the stack navigator
          name="CompleteProfile"
          component={CompleteProfile}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});