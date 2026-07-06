import { StyleSheet, Text , useColorScheme} from 'react-native'
import React from 'react'
import { Colors } from '../constants/color'
const ThemedText = ({style, title = false, ...props}) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light']

    const textcolor = title ? theme.title : theme.text

  return (
    <Text style={[style, { color: textcolor }]} {...props} />
  )
}

export default ThemedText