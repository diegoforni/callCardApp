// components/AudioItem.js
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AudioItem({ label, onSelect, onRecord, hasAudio }) {
  return (
    <View style={styles.audioItem}>
      <Text style={styles.audioLabel}>{label}</Text>
      <View style={styles.audioButtonRow}>
        <TouchableOpacity
          style={styles.audioButton}
          onPress={onSelect}
        >
          <Ionicons name="document-outline" size={16} color="#333" />
          <Text style={styles.buttonLabel}>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.audioButton}
          onPress={onRecord}
        >
          <Ionicons name="mic-outline" size={16} color="#333" />
          <Text style={styles.buttonLabel}>Record</Text>
        </TouchableOpacity>
      </View>
      {hasAudio && (
        <View style={styles.audioStatus}>
          <Ionicons name="checkmark-circle" size={20} color="green" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  audioItem: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    position: 'relative',
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  audioButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  audioButton: {
    backgroundColor: '#e0e0e0',
    padding: 6,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  audioStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});