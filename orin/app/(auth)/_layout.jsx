import { StyleSheet } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const AuthLayout = () => {
  return (
    <Stack 
    screenOptions={{
      headerShown: false, animation: 'fade'
    }}
    />
  )
}

export default AuthLayout

const styles = StyleSheet.create({}) 