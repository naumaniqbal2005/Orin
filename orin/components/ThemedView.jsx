import { StyleSheet, Text, View , useColorScheme} from 'react-native'
import React from 'react'
import { Colors } from '../constants/color'

const ThemedView = ({style, ...props}) => {
    
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;



  return (
    <View style={[style, {backgroundColor: theme.background}]} {...props} />
  )
}

export default ThemedView
