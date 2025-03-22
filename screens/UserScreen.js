import React, { useState, useEffect } from 'react'; 
import { View, Text, Button, Image, ScrollView, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { app } from './FireBaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, runTransaction, getDoc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);
const user = auth.currentUser;


const API_URL = 'http://18.227.89.214:5000'; 

const UserScreen = ({ userEmail }) => {
  const [userId, setUserId] = useState('');
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState('');
  const [userPhotos, setUserPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserData(userEmail);
        setUserData(data); 
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userEmail) {
      fetchData(); 
    }
  }, [userEmail]); 

  const createUser = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, { username: userId });
      console.log('User created:', response.data);
      alert('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

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

  const uploadPhoto = async () => {
    if (!image) {
      alert('No photo selected');
      return;
    }
  
    setLoading(true);
    try {
      
      const userData = await fetchUserData(userEmail);
      if (!userData) {
        throw new Error('User data not found');
      }
  
      const awsPhotoKey = userData.awsPhotoKey || "";
  

      const formData = new FormData();
      formData.append('file', {
        uri: image,
        type: 'image/jpg',
        name: `photo_${Date.now()}.jpg`,
      });
      formData.append('user_id', String(awsPhotoKey));
  

      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Photo uploaded:', response.data);
      setUploadedPhotoPath(response.data.image_uploaded_to);
      alert('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserPhotos = async () => {
    setLoading(true);
    try {

      const userData = await fetchUserData(userEmail);
      if (!userData) {
        throw new Error('User data not found');
      }
  
      const awsPhotoKey = userData.awsPhotoKey || "";
  

      const response = await axios.get(`${API_URL}/get_user_photos?user_id=${awsPhotoKey}`);
      console.log('User photos:', response.data);
  
      if (response.data && Array.isArray(response.data.photos)) {
        setUserPhotos(response.data.photos);
      } else {
        console.log('No photos found or incorrect format:', response.data);
        alert('No photos found for this user.');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      alert('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (email) => {
    try {
      console.log('Fetching user data for email:', email);
  
      
      if (!email) {
        throw new Error('Email is null or undefined');
      }
  
  
      const userRef = doc(db, 'users', email); 
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', userData);
        return userData;
      } else {
        console.log('No user data found for email:', email);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create User and Manage Photos</Text>

      <Button title="Pick an Image from Gallery" onPress={pickImage} />
      <Button title="Take a Photo" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300, marginTop: 20 }} />}

      <Button title="Upload Photo" onPress={uploadPhoto} disabled={!image} />

      {uploadedPhotoPath ? (
        <Text style={styles.uploadedText}>Uploaded Photo Path: {uploadedPhotoPath}</Text>
      ) : null}

      <Button title="Fetch User Photos" onPress={fetchUserPhotos} />

      <View style={styles.photoGallery}>
        {userPhotos.length > 0 ? (
          userPhotos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.galleryImage} />
          ))
        ) : (
          <Text>No photos available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  uploadedText: {
    fontSize: 16,
    color: 'green',
    marginVertical: 10,
  },
  photoGallery: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  galleryImage: {
    width: 400,
    height: 400,
    margin: 5,
    borderRadius: 8,
  },
});

export default UserScreen;