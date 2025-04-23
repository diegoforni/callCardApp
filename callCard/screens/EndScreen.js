// screens/EndScreen.js
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

export default function EndScreen() {
  const navigation = useNavigation();
  const {
    cardValue,
    cardSuit,
    resetGame,
  } = useAppContext();

  const handleNewCall = () => {
    resetGame();
    navigation.navigate('Contact');
  };

  const handleBackToSettings = () => {
    resetGame();
    navigation.navigate('Setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.endContainer}>
        <Text style={styles.endTitle}>Call Ended</Text>
        <Text style={styles.endSubtitle}>Selected Card:</Text>
        <Text style={styles.cardResult}>
          {cardValue} of {cardSuit}
        </Text>
        
        <TouchableOpacity
          style={styles.newCallButton}
          onPress={handleNewCall}
        >
          <Text style={styles.newCallButtonText}>New Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToSettings}
        >
          <Text style={styles.backButtonText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  endSubtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  cardResult: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 40,
  },
  newCallButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  newCallButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#555',
    padding: 16,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});