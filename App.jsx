import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import StackNavigator from './navigation/StackNavigator'


const App = () => {
  return (
    <>
      <StackNavigator />
    </>
    
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
}) 
/* 
const firebaseConfig = {
  // Replace with your Firebase project configuration
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "trademate-881d0",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:691241778318:android:420e77377beb1995e11ddf",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  return (
    <View>
      <Text>Firebase is connected!</Text>
    </View>
  );
};

export default App;
*/