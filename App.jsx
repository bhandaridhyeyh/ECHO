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
