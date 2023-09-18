import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import styles from './styles';  // Import styles from external file


export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(true);  // Start with the camera view
  const [message, setMessage] = useState('');  // Current message being typed
  const [messages, setMessages] = useState([]);  // List of previous messages
  const [userMessage, setUserMessage] = useState('');  // The message user inputs
  const [apiMessage, setApiMessage] = useState('');    // The message received from the API

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = () => {
    console.log("Scanning...");
    //scanning logic
    setShowCamera(false);
    console.log("found");
  };

  const updateMessages = (userMsg, apiMsg) => {
    const newMessages = [
      ...messages,
      { id: String(messages.length + 1), text: `User: ${userMsg}` },
      { id: String(messages.length + 2), text: `API: ${apiMsg}` }
    ];
    setMessages(newMessages);
  };

  const sendMessageToApi = async () => {
    try {
      // Make a POST request to the Flask API
      const response = await fetch('http://127.0.0.1:5000/ask_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_string: userMessage })  // Send user message in JSON format
      });

      console.log("HTTP Response Status:", response.status);  // Log HTTP status
      if (response.status === 200) {
        // Define responseData here
        const responseData = await response.json();
        console.log("Parsed JSON:", responseData);

        // Set the API message to state
        setApiMessage(responseData.output_string);

        // Update messages
        updateMessages(userMessage, responseData.output_string);
      } else {
        console.error("API request failed with status:", response.status);
      }
    } catch (error) {
      console.error(`Failed to send message: ${error}`);
    }
  };



  // Fetch the number of free spots
  const fetchFreeSpots = async () => {
    try {
      const response = await fetch('//replace wiht serveraddress/');
      const text = await response.text();
      const fetchedFreeSpots = text.split(': ')[1];
      setFreeSpots(fetchedFreeSpots);
    } catch (error) {
      console.error('Failed to fetch free spots:', error);
    }
  };

  if (showCamera) {
    if (hasPermission === null) {
      return <View />;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }
    if (showCamera) {
      if (hasPermission === null) {
        return <View />;
      }
      if (hasPermission === false) {
        return <Text>No access to camera</Text>;
      }
      return (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} />
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Text style={styles.scanButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
    <FlatList
      data={messages}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
      <View style={item.text.startsWith('User:') ? styles.userMessageContainer : styles.apiMessageContainer}>
        {item.text.startsWith('API:') && <Image source={{uri: 'https://link-to-api-profile-picture.com'}} style={styles.apiProfilePicture} />}
        <View style={item.text.startsWith('User:') ? styles.userMessageCard : styles.apiMessageCard}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    )}
  style={styles.messageList}
/>

      <View style={styles.inputContainer}>
        <TextInput
          value={userMessage}
          onChangeText={text => setUserMessage(text)}
          style={styles.textInput}
          placeholder="Type your message"
        />
        <Button title="Send" onPress={sendMessageToApi} />
      </View>
    </KeyboardAvoidingView>
  );
}
