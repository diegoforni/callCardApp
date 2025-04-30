// screens/SetupScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Button,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAppContext } from '../context/AppContext';
import AudioItem from '../components/AudioItem.js';
import InstructionsPanel from '../components/InstructionsPanel';
import * as DocumentPicker from 'expo-document-picker';

export default function SetupScreen({ navigation }) {
  const {
    platform,
    setPlatform,
    callerName,
    setCallerName,
    audioMap,
    setAudioMap,
    showSetupInstructions,
    setShowSetupInstructions,
    setShowGameInstructions,
    cardValues,
    cardSuits,
    contactImage,
    setContactImage,
    callImage,
    setCallImage
  } = useAppContext();

  const [recording, setRecording] = useState(null);
  const [recordingItem, setRecordingItem] = useState(null);
  const [recordModal, setRecordModal] = useState(false);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (recordingItem && uri) {
      setAudioMap(prev => ({
        ...prev,
        [recordingItem]: uri
      }));
    }

    setRecordModal(false);
  };

  const pickAudioFile = async (item) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const selectedUri = result.uri;
        const ext = selectedUri.split('.').pop();
        const localUri = FileSystem.documentDirectory + item + '.' + ext;

        await FileSystem.copyAsync({ from: selectedUri, to: localUri });
        setAudioMap(prev => ({ ...prev, [item]: localUri }));
      }
    } catch (err) {
      console.error('Error picking audio file:', err);
    }
  };

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedUri = result.assets[0].uri;

        if (type === 'contact') {
          setContactImage(selectedUri);
        } else if (type === 'call') {
          setCallImage(selectedUri);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const startGame = () => {
    if ( audioMap.introduccion && audioMap.despedida ) {
      setShowGameInstructions(true);
      navigation.navigate('Contact');
    } else {
      alert('Por favor, completa todos los campos requeridos (nombre del llamante, audio de introducción y audio de despedida)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Configuración CallCard</Text>

        <InstructionsPanel
          visible={showSetupInstructions}
          setVisible={setShowSetupInstructions}
          title="Instrucciones de Configuración:"
          text={
            `1. Elige tu plataforma: iOS o Android\n` +
            `2. Sube las imágenes de llamada para tu plataforma\n` +
            `3. Agrega archivos de audio para cada valor y pinta de carta\n` +
            `4. Agrega audios de introducción y conclusión`
          }
        />

        <View style={styles.platformSelector}>
          <Text style={styles.label}>Selecciona la Plataforma:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.platformButton, platform === 'ios' && styles.selectedButton]}
              onPress={() => setPlatform('ios')}
            >
              <Text style={[styles.buttonText, platform === 'ios' && styles.selectedButtonText]}>iOS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.platformButton, platform === 'android' && styles.selectedButton]}
              onPress={() => setPlatform('android')}
            >
              <Text style={[styles.buttonText, platform === 'android' && styles.selectedButtonText]}>Android</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Imágenes de Llamada</Text>
          <View style={styles.imageButtonRow}>
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => pickImage('contact')}
              >
                <Text style={styles.imageButtonText}>Subir Imagen de Contacto</Text>
              </TouchableOpacity>
              {contactImage && (
                <Image source={{ uri: contactImage }} style={styles.previewImage} />
              )}
            </View>
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => pickImage('call')}
              >
                <Text style={styles.imageButtonText}>Subir Imagen de Llamada</Text>
              </TouchableOpacity>
              {callImage && (
                <Image source={{ uri: callImage }} style={styles.previewImage} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.audioSection}>
          <Text style={styles.sectionTitle}>Archivos de Audio</Text>

          <View style={styles.audioCategory}>
            <Text style={styles.categoryTitle}>Requeridos</Text>
            <View style={styles.audioGrid}>
              <AudioItem
                label="Introducción"
                onSelect={() => pickAudioFile('introduccion')}
                onRecord={() => {
                  setRecordingItem('introduccion');
                  setRecordModal(true);
                }}
                hasAudio={!!audioMap.introduccion}
              />

              <AudioItem
                label="Despedida"
                onSelect={() => pickAudioFile('despedida')}
                onRecord={() => {
                  setRecordingItem('despedida');
                  setRecordModal(true);
                }}
                hasAudio={!!audioMap.despedida}
              />
            </View>
          </View>

          <View style={styles.audioCategory}>
            <Text style={styles.categoryTitle}>Valores de Carta</Text>
            <View style={styles.audioGrid}>
              {cardValues.map(value => (
                <AudioItem
                  key={value}
                  label={value}
                  onSelect={() => pickAudioFile(value)}
                  onRecord={() => {
                    setRecordingItem(value);
                    setRecordModal(true);
                  }}
                  hasAudio={!!audioMap[value]}
                />
              ))}
            </View>
          </View>

          <View style={styles.audioCategory}>
            <Text style={styles.categoryTitle}>Pintas de Carta</Text>
            <View style={styles.audioGrid}>
              {cardSuits.map(suit => (
                <AudioItem
                  key={suit}
                  label={suit}
                  onSelect={() => pickAudioFile(suit)}
                  onRecord={() => {
                    setRecordingItem(suit);
                    setRecordModal(true);
                  }}
                  hasAudio={!!audioMap[suit]}
                />
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            (!callerName || !audioMap.introduccion || !audioMap.despedida) && styles.disabledButton
          ]}
          onPress={startGame}
          disabled={!callerName || !audioMap.introduccion || !audioMap.despedida}
        >
          <Text style={styles.startButtonText}>Iniciar Juego</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={recordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grabar Audio para {recordingItem}</Text>

            <TouchableOpacity
              style={[styles.recordButton, recording && styles.stopRecordingButton]}
              onPress={recording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {recording ? 'Detener Grabación' : 'Iniciar Grabación'}
              </Text>
            </TouchableOpacity>

            {recording && (
              <View style={styles.recordingIndicator}>
                <Ionicons name="radio-outline" size={20} color="#ff0000" />
                <Text style={styles.recordingText}>Grabando...</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                if (recording) recording.stopAndUnloadAsync();
                setRecording(null);
                setRecordModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  platformSelector: {
    margin: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
  inputContainer: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imageSection: {
    margin: 20,
  },
  imageButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageUploadContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  imageButton: {
    backgroundColor: '#34c759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8, // Add some space between button and preview
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  audioSection: {
    margin: 20,
  },
  audioCategory: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  audioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopRecordingButton: {
    backgroundColor: '#34c759',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingText: {
    color: '#ff3b30',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
});