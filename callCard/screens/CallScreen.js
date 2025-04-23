// screens/CallScreen.js
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

export default function CallScreen() {
  const navigation = useNavigation();
  const {
    platform,
    callerName,
    callDuration,
    handleScreenTap,
    formatTime,
    selectionStage,
    cardValue,
    cardSuit,
    callImage,
  } = useAppContext();

  const defaultCallImages = {
    ios: require('../assets/ios_call_default.png'),
    android: require('../assets/android_call_default.png'),
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity
        style={styles.callContainer}
        onPress={() => handleScreenTap(navigation)}
        activeOpacity={0.9}
      >
        <Image
          source={{uri: callImage || defaultCallImages[platform]}}
          style={styles.callImage}
          resizeMode="cover"
          onError={(error) => console.error("Image loading error in CallScreen:", error)}

        />



        <View style={[
          styles.timerOverlay,
          platform === 'ios' ? styles.iosTimerOverlay : styles.androidTimerOverlay
        ]}>
          <Text style={[
            styles.timer,
            platform === 'ios' ? styles.iosTimer : styles.androidTimer
          ]}>
            {formatTime(callDuration)}
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
  callContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  callImage: {
    width: '100%',
    height: '100%',
  },
  callNameOverlay: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  iosCallNameOverlay: {
    top: '15%',
  },
  androidCallNameOverlay: {
    top: '10%',
  },
  callName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iosCallName: {
    color: '#fff',
  },
  androidCallName: {
    color: '#000',
  },
  timerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  iosTimerOverlay: {
    top: '22%',
  },
  androidTimerOverlay: {
    top: '18%',
  },
  timer: {
    fontSize: 20,
  },
  iosTimer: {
    color: '#fff',
  },
  androidTimer: {
    color: '#666',
  },
  selectionOverlay: {
    position: 'absolute',
    bottom: '25%',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  selectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  selectionHint: {
    fontSize: 16,
    color: '#fff',
  },
});
