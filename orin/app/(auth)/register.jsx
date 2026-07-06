import { StyleSheet, Pressable, Text, View } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import { Link } from 'expo-router'


const register = () => {

    const handleRegister = () => {

        console.log('Register button pressed')
    }
  return (
    <ThemedView style={styles.container}>
      <ThemedText title = {true} style={styles.title} >Register a new account</ThemedText>

    <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
    </Pressable>
    <View style={styles.card}>
        <Link href="/login">
            <ThemedText style = {{fontWeight: 'bold'}} title = {true}>Go to Login</ThemedText>
        </Link>
    </View>

    </ThemedView>
  )
}

export default register

const styles = StyleSheet.create({

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

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    title: {
        fontSize: 24,
        fontWeight: 700
    }
})