import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();
    function BottomTabs() {
        return (
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: '#f0f4f8', // Light background for the tab bar
                        borderTopWidth: 1,
                        borderTopColor: '#ced4da', // Light border
                        height: 60, // Increased height for better spacing
                    },
                    tabBarItemStyle: {
                        paddingVertical: 6, // Add vertical padding to the tab items
                    },
                    tabBarLabelStyle: {
                        color: '#002f34',
                        fontWeight: 'bold',
                        fontSize: 13,
                        marginBottom: 2, // Reduced marginBottom
                    },
                    tabBarIconStyle: {
                        marginTop: 2, // Reduced marginTop
                    },
                    activeTintColor: '#002f34', // Active tab icon and label color
                    inactiveTintColor: '#495057', // Inactive tab icon and label color
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
                                name={focused ? "home" : "home-outline"}
                                size={26} // Increased size
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
                                name={focused ? "mic" : "mic-outline"}
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
                                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
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
                                name={focused ? "person" : "person-outline"}
                                size={26}
                                style={{ color: focused ? '#002f34' : '#495057' }}
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
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={Register}
                    options={{ headerShown: false }}
                />
                <Stack.Screen // Add the Otp screen to the stack
                    name="Otp"
                    component={Otp}
                    options={{ headerShown: false }} //  no header for OTP screen
                />
                <Stack.Screen
                    name="Main"
                    component={BottomTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProductInfo"
                    component={ProductInfo}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Ask"
                    component={Ask}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Chat"
                    component={Chat}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Conversation"
                    component={Conversation}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Sell"
                    component={Sell}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Payment"
                    component={Payment}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="OtherUser"
                    component={OtherUser}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CompleteProfile"
                    component={CompleteProfile}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Echoes"
                    component={Echoes}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigator;

const styles = StyleSheet.create({});