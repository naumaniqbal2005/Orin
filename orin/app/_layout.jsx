import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { Colors } from '../constants/color'
import { client } from '../lib/appwrite'

const RootLayout = () => {


    useEffect(() => {
        client.ping().then(() => {
            console.log('Appwrite is ready');
        }).catch((error) => {
            console.error('Appwrite is not ready', error);
        });
    }, []);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    
    
  return (
    <>
        {/* <StatusBar value = 'auto' /> */}
        <Stack screenOptions={{
        headerStyle : {backgroundColor : theme.navBackground},
        headerTintColor : theme.title,
        headerTitleStyle : {
            fontWeight : 'bold',
            fontSize : 15
        },
        headerTitleAlign: 'center'
        }}>

            <Stack.Screen name="(tabs)" options = {{headerShown: false}}/>
            <Stack.Screen name="(auth)" options = {{headerShown: false}}/>
            
        </Stack>
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})