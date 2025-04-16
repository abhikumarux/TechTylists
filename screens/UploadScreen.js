import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, Image, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableHighlight, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';
import axios from 'axios';
import ModalDropdown from 'react-native-modal-dropdown';
import { ActivityIndicator } from 'react-native';
const API_URL = 'http://18.225.195.136:5000'; 



const UploadScreen = ({ userEmail }) => {
  const [outfits, setOutfits] = useState([]);
    const auth = getAuth();
    const db = getFirestore();
  useEffect(() => {
  
  }, []);

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

  const fetchOutfits = async () => {
    const userData = await fetchUserData(userEmail);
  
    if (!userData) {
      console.error('User data not found after fetchUserData');
      throw new Error('User data not found');
    }

    const awsPhotoKey = userData.awsPhotoKey;
    console.log("AWS key: ", awsPhotoKey);
    try {
      const response = await axios.get(`${API_URL}/getOutfits`, {
        params: { user_id: awsPhotoKey },
      });
      setOutfits(response.data.outfits);
      console.log("set outfits to: ", outfits);
    } catch (err) {
      console.error("Failed to fetch outfits:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button title="Load Outfits" onPress={fetchOutfits} />

      {outfits.map((outfit, idx) => (
        <View key={idx} style={styles.outfitCard}>
          <Text style={styles.title}>Outfit #{outfit.outfit_id}</Text>
          <Image source={{ uri: outfit.full }} style={styles.fullImage} />

          <FlatList
            horizontal
            data={outfit.items}
            keyExtractor={(item, i) => `${idx}-${i}`}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.itemImage} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  outfitCard: {
    marginBottom: 32,
    padding: 16,           
    backgroundColor: '#fff', 
    borderRadius: 12,
    shadowColor: '#000',    
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,           
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  fullImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1, 
    borderRadius: 12,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  
  
  itemImage: { width: 100, height: 100, marginRight: 10, borderRadius: 8, marginTop: 10 },
});

export default UploadScreen;
