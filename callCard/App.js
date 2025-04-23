// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import SetupScreen from './screens/SetupScreen';
import ContactScreen from './screens/ContactScreen';
import CallScreen from './screens/CallScreen';
import EndScreen from './screens/EndScreen';

// Import context provider
import { AppContextProvider } from './context/AppContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppContextProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Setup" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Call" component={CallScreen} />
          <Stack.Screen name="End" component={EndScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContextProvider>
  );
}