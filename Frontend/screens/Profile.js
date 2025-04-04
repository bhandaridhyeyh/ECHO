import { StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <View>
                <Text style={{ color: 'black', fontSize: 30, textAlign: 'center', marginBottom: 20 }}>This is the user profile</Text>

                <Pressable onPress={() => navigation.navigate('CompleteProfile')}>
                    <Text style={{ color: '#59008F', fontSize: 20, textAlign: 'center', marginVertical: 10, textDecorationLine: 'underline' }}>Complete Your Profile</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: '#59008F', fontSize: 20, textAlign: 'center', marginVertical: 10, textDecorationLine: 'underline' }}>Login</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: '#59008F', fontSize: 20, textAlign: 'center', marginVertical: 10, textDecorationLine: 'underline' }}>Register</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({})