import { StyleSheet, Text, TextInput, Pressable, View } from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import { Link } from 'expo-router'
import Spacer from '../../components/Spacer'

const login = () => {

  const handleLogin = () => {
    console.log('Login button pressed')
  }
  return (
    <ThemedView style = {styles.container}>
      <ThemedText title={true} style = {styles.title}>Login to your account</ThemedText>
      <Spacer />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <View style={styles.card}>
        <Link href="/register">
          <ThemedText style = {{fontWeight: 'bold'}} title = {true}>Go to Register</ThemedText>
        </Link>
      </View>

    </ThemedView>
  )
}

export default login

const styles = StyleSheet.create({

    container: {
        flex : 1,
        alignItems : 'center',
        justifyContent : 'center'
    },

    title : {
        fontWeight : '700',
        fontSize : 24,
    },

    input: {
        width: '80%',
        padding: 15,
        backgroundColor: '#d6d5e1',
        borderRadius: 8,
        marginVertical: 10,
    },

    button: {
        backgroundColor: '#8447FF',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    card: {
        backgroundColor: '#d6d5e1',
        padding: 15,
        borderRadius: 15,
        marginVertical: 10,
    },

})