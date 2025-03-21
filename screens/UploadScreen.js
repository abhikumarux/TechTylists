import React, { useState } from 'react';
import { View, Text, Button, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

const UploadScreen = () => {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const handleImageSelection = async (uri) => {
    setImage(uri);

    if (Platform.OS === 'ios' && uri.endsWith('.heic')) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        setImage(manipResult.uri);
      } catch (error) {
        console.error('Error converting HEIF to JPEG:', error);
      }
    }
  };

  const uploadImage = async () => {
    if (!image) {
      alert('Please select or take a photo first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const res = await axios.post('http://18.226.187.20/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponse(res.data); 
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Upload or Take a Photo</Text>
      <Button title="Pick an Image from Gallery" onPress={pickImage} />
      <Button title="Take a Photo" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300, marginTop: 20 }} />}
      <Button title="Upload Image" onPress={uploadImage} />
      {response && response.predicted_class && (
        <Text>Predicted Class: {response.predicted_class}</Text>
      )}
    </View>
  );
};

export default UploadScreen;
