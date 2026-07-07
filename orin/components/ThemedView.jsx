import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/color'

const ThemedView = ({style, ...props}) => {
  return (
    <View style={[style, {backgroundColor: Colors.background}]} {...props} />
  )
}

export default ThemedView
