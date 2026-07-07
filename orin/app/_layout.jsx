import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { Colors } from '../constants/color'
import { client } from '../lib/appwrite'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'

const RootLayout = () => {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
        'Poppins-Bold': require('@expo-google-fonts/poppins/Poppins_700Bold.ttf'),
        'Poppins-Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
    })

    useEffect(() => {
        client.ping().then(() => {
            console.log('Appwrite is ready');
        }).catch((error) => {
            console.error('Appwrite is not ready', error);
        });
    }, []);

    if (!fontsLoaded) {
        return null
    }

  return (
    <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{
        headerStyle : {backgroundColor : Colors.background},
        headerTintColor : Colors.title,
        headerTitleStyle : {
            fontFamily: 'Poppins-Bold',
            fontSize : 15
        },
        headerTitleAlign: 'center'
        }}>

            <Stack.Screen name="(tabs)" options = {{headerShown: false}}/>
            <Stack.Screen name="(auth)" options = {{headerShown: false}}/>

        </Stack>
    </View>
  )
}

export default RootLayout

const styles = StyleSheet.create({})