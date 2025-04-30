// components/InstructionsPanel.js
import React from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InstructionsPanel({ visible, setVisible, title, text, overlay = false }) {
  if (!visible) {
    return (
      <TouchableOpacity 
        style={styles.showButton} 
        onPress={() => setVisible(true)}
      >
        <Ionicons name="information-circle-outline" size={24} color="#007bff" />
        <Text style={styles.showButtonText}>Show Instructions</Text>
      </TouchableOpacity>
    );
  }

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <Text style={styles.instructionsTitle}>{title}</Text>
          <Text style={styles.instructionsText}>{text}</Text>
          <Button title="Entendido!" onPress={() => setVisible(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsTitle}>{title}</Text>
      <Text style={styles.instructionsText}>{text}</Text>
      <Button title="Esconder" onPress={() => setVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  instructionsContainer: {
    backgroundColor: '#e0f2ff',
    borderRadius: 8,
    padding: 16,
    margin: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    lineHeight: 22,
    marginBottom: 16,
  },
  showButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
  },
  showButtonText: {
    color: '#007bff',
    marginLeft: 6,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
});