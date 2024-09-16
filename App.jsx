import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
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