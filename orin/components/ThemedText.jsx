import { StyleSheet, Text } from 'react-native'
import React from 'react'
import { Colors } from '../constants/color'
const ThemedText = ({style, title = false, ...props}) => {
  const textcolor = title ? Colors.title : Colors.text

  return (
    <Text style={[style, { color: textcolor }]} {...props} />
  )
}

export default ThemedText