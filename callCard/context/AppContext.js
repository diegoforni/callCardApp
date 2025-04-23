// context/AppContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Audio } from 'expo-av';
const STORAGE_KEY = 'myAppSettings'; // or any unique string

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [platform, setPlatform] = useState('ios');
  const [callerName, setCallerName] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [cardValue, setCardValue] = useState(null);
  const [cardSuit, setCardSuit] = useState(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(true);
  const [showGameInstructions, setShowGameInstructions] = useState(false);
  const [isSelectionPhase, setIsSelectionPhase] = useState(false);
  const [selectionStage, setSelectionStage] = useState('value'); // value, suit, complete
  const [currentOption, setCurrentOption] = useState('A');
  const [lastTapTime, setLastTapTime] = useState(0);
  const [contactImage, setContactImage] = useState(null);
  const [callImage, setCallImage] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [pendingSelectionAudio, setPendingSelectionAudio] = useState(null);
  
  const [audioMap, setAudioMap] = useState({
    'introduccion': null,
    'A': null, '2': null, '3': null, '4': null, '5': null,
    '6': null, '7': null, '8': null, '9': null, '10': null,
    'J': null, 'Q': null, 'K': null,
    'treboles': null, 'corazones': null, 'picas': null, 'diamantes': null,
    'despedida': null
  });
  
  const sound = useRef(null);
  const callInterval = useRef(null);
  const optionInterval = useRef(null);
  
  const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cardSuits = ['treboles', 'corazones', 'picas', 'diamantes'];
  const suitSymbols = { 'treboles': 'T', 'corazones': 'C', 'picas': 'P', 'diamantes': 'D' };


  // ── Load everything once on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const {
            platform: p,
            callerName: cn,
            audioMap: am,
            contactImage: ci,
            callImage: cli
          } = JSON.parse(json);

          if (p)  setPlatform(p);
          if (cn) setCallerName(cn);
          if (am) setAudioMap(prev => ({ ...prev, ...am }));
          if (ci) setContactImage(ci);
          if (cli) setCallImage(cli);
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }
    })();
  }, []);

  // ── Persist on any change to the five core pieces ──────────────────
  useEffect(() => {
    (async () => {
      const toSave = {
        platform,
        callerName,
        audioMap,
        contactImage,
        callImage
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (err) {
        console.warn('Failed to save settings:', err);
      }
    })();
  }, [platform, callerName, audioMap, contactImage, callImage]);

  // Track intro audio completion and play pending selection audio if needed
  useEffect(() => {
    if (!isIntroPlaying && pendingSelectionAudio) {
      const { value, suit } = pendingSelectionAudio;
      (async () => {
        await playSound(value);
        await playSound(suit);
        setPendingSelectionAudio(null);
      })();
    }
  }, [isIntroPlaying, pendingSelectionAudio]);
  
  useEffect(() => {
    return () => {
      if (callInterval.current) clearInterval(callInterval.current);
      if (optionInterval.current) clearInterval(optionInterval.current);
      if (sound.current) sound.current.unloadAsync();
    };
  }, []);
  
  const playSound = async (key) => {
    const uri = audioMap[key];
    if (!uri) return;

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }); // Set audio mode

      if (sound.current) await sound.current.unloadAsync();
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { volume: 1.0 } // Ensure volume is set to max (1.0)
      );
      sound.current = newSound;
      await sound.current.playAsync();

      // Return a promise that resolves when sound finishes playing
      return new Promise((resolve) => {
        sound.current.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            resolve();
          }
        });
      });
    } catch (err) {
      console.error('Error playing sound:', err);
      return Promise.resolve(); // Return resolved promise on error
    }
  };
  
  const startCall = async (navigation) => {
    // Only start a call if one isn't already active
    if (isCallActive) return;
    
    setIsCallActive(true);
    navigation.navigate('Call');
    setCallDuration(0);
    
    // Start call timer
    callInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Start selection phase immediately
    setIsSelectionPhase(true);
    setSelectionStage('value');
    resetOptionCycle(cardValues, 'A');
    
    // Play introduction audio and set flag
    setIsIntroPlaying(true);
    playSound('introduccion').then(() => {
      setIsIntroPlaying(false);
    }).catch(err => {
      console.error('Error playing intro:', err);
      setIsIntroPlaying(false);
    });
  };
  
  const resetOptionCycle = (options, initialOption) => {
    setCurrentOption(initialOption);
    
    // Clear previous interval if exists
    if (optionInterval.current) {
      clearInterval(optionInterval.current);
    }
    
    // Cycle through options every 2.5 seconds
    let index = options.indexOf(initialOption);
    optionInterval.current = setInterval(() => {
      index = (index + 1) % options.length;
      setCurrentOption(options[index]);
    }, 2500);
  };
  
  const endCall = async (navigation) => {
    // Only end the call if a call is active
    if (!isCallActive) return;
    
    // Stop timers
    if (callInterval.current) clearInterval(callInterval.current);
    if (optionInterval.current) clearInterval(optionInterval.current);
    
    // Play goodbye audio
    await playSound('despedida');
    
    // Navigate to end screen
    navigation.navigate('Contact')

    resetGame();
    
    // Reset for next call
    setIsCallActive(false);
    setIsSelectionPhase(false);
    setSelectionStage('value');
    setCallDuration(0);
    setPendingSelectionAudio(null);
  };
  
  const resetGame = () => {
    setCardValue(null);
    setCardSuit(null);
    setCallDuration(0);
    setIsCallActive(false);
    setIsSelectionPhase(false);
    setSelectionStage('value');
    setIsIntroPlaying(false);
    setPendingSelectionAudio(null);
    
    // Clear any ongoing intervals
    if (callInterval.current) clearInterval(callInterval.current);
    if (optionInterval.current) clearInterval(optionInterval.current);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = seconds % 60;
    const secsStr = secs.toString().padStart(2, '0');
    
    // During selection phase, show the current option in place of last digit
    if (isSelectionPhase) {
      if (selectionStage === 'value') {
        return `${mins}:${secsStr.charAt(0)}${currentOption}`;
      } else if (selectionStage === 'suit') {
        return `${mins}:${secsStr.charAt(0)}${suitSymbols[currentOption] || currentOption.charAt(0)}`;
      }
    }
    
    // Always show standard time format after selection is made
    return `${mins}:${secsStr}`;
  };
  
  const handleScreenTap = async (navigation) => {
    const now = Date.now();

    // Detect double-tap (500ms threshold)
    if (now - lastTapTime < 500) {
      // If we're not in a call yet, start one
      if (!isCallActive) {
        await startCall(navigation);
      }
      // If we're in a call and selection is complete, end it
      else if (isCallActive && selectionStage === 'complete') {
        await endCall(navigation);
      }
    }
    // Single taps during an active call drive the selection phase
    else if (isCallActive && isSelectionPhase) {
      if (selectionStage === 'value') {
        setCardValue(currentOption);
        setSelectionStage('suit');
        resetOptionCycle(cardSuits, 'treboles');
      } else if (selectionStage === 'suit') {
        const selectedSuit = currentOption;
        setCardSuit(selectedSuit);
        setSelectionStage('complete');
        setIsSelectionPhase(false);
        clearInterval(optionInterval.current);

        // Queue up the audio to play after intro finishes
        if (cardValue) {
          if (isIntroPlaying) {
            // Store the selection to play after intro finishes
            setPendingSelectionAudio({
              value: cardValue,
              suit: selectedSuit
            });
          } else {
            // Play immediately if intro is done
            await playSound(cardValue);
            await playSound(selectedSuit);
          }
        }
      }
    }

    setLastTapTime(now);
  };
  
  const value = {
    platform,
    setPlatform,
    callerName,
    setCallerName,
    callDuration,
    cardValue,
    setCardValue,
    cardSuit,
    setCardSuit,
    audioMap,
    setAudioMap,
    showSetupInstructions,
    setShowSetupInstructions,
    showGameInstructions,
    setShowGameInstructions,
    isSelectionPhase,
    selectionStage,
    currentOption,
    handleScreenTap,
    formatTime,
    resetGame,
    cardValues,
    cardSuits,
    suitSymbols,
    playSound,
    contactImage,
    setContactImage,
    callImage,
    setCallImage,
    isCallActive,
    isIntroPlaying
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};