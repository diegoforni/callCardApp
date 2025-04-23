// screens/ContactScreen.js
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import InstructionsPanel from '../components/InstructionsPanel';

export default function ContactScreen() {
  const navigation = useNavigation();
  const {
    platform,
    callerName,
    handleScreenTap,
    showGameInstructions,
    setShowGameInstructions,
    contactImage,
  } = useAppContext();

  const defaultContactImages = {
    ios: require('../assets/ios_contact_default.png'),
    android: require('../assets/android_contact_default.png'),
    
  };
  console.log("Contact Image URI:", contactImage);
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity
        style={styles.contactContainer}
        onPress={() => handleScreenTap(navigation)}
        activeOpacity={0.9}
      >
        {showGameInstructions && (
          <InstructionsPanel
            visible={showGameInstructions}
            setVisible={setShowGameInstructions}
            title="Game Instructions:"
            text={
              `1. Double-tap anywhere to start the call\n` +
              `2. When card values appear, tap once to select (A-K)\n` +
              `3. When card suits appear, tap once to select\n` +
              `4. Double-tap after selection to end the call`
            }
            overlay={true}
          />
        )}

        <Image
            source={{ uri: contactImage || undefined }}
            style={styles.contactImage}
            resizeMode="cover"
            onError={(error) => console.error("Image loading error in ContactScreen:", error)}
        />

        <View style={[
          styles.contactNameOverlay,
          platform === 'ios' ? styles.iosNameOverlay : styles.androidNameOverlay
        ]}>
          <Text style={[
            styles.contactName,
            platform === 'ios' ? styles.iosContactName : styles.androidContactName
          ]}>
            {callerName}
          </Text>
        </View>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contactContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contactImage: {
    width: '100%',
    height: '100%',
  },
  contactNameOverlay: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  iosNameOverlay: {
    top: '25%',
  },
  androidNameOverlay: {
    top: '20%',
  },
  contactName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  iosContactName: {
    color: '#000',
  },
  androidContactName: {
    color: '#000',
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
