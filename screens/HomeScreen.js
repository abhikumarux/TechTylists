import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableHighlight } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';
import axios from 'axios';
import ModalDropdown from 'react-native-modal-dropdown';


const API_URL = 'http://18.225.195.136:5000'; 

const HomeScreen = ({ userEmail }) => {
  const [userImage, setUserImage] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const [shirts, setShirts] = useState([]);
  const [jackets, setJackets] = useState([]);
  const [pants, setPants] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [skirts, setSkirts] = useState([]);
  const [hats, setHats] = useState([]);
  const [, set] = useState([]);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserImage();
    }
  }, [user]);

  const fetchUserImage = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().imageUrl) {
      setUserImage(userDoc.data().imageUrl);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
        uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (image) => {
    if (!image) {
      alert('No photo selected');
      return;
    }
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
  
      const response = await axios.post(`${API_URL}/uploadImage`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Photo uploaded:', response.data);
      setUploadedPhotoPath(response.data.image_uploaded_to);
      alert('Uploaded photo with category of ' + response.data.category);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    }
    loadImages();
  };

  const loadImages = async () => {
    try {
      const userData = await fetchUserData(userEmail);
      if (!userData) {
        throw new Error('User data not found');
      }
  
      const awsPhotoKey = userData.awsPhotoKey || "";
      const response = await axios.get(`${API_URL}/get_user_photos`, {
        params: { user_id: awsPhotoKey },
      });
  
      console.log('API Response:', response.data);
  
      const categorizedPhotos = response.data.photos;
      const shirtPhotos = categorizedPhotos.shirts || [];
      const pantPhotos = categorizedPhotos.pants || [];
      const hatPhotos = categorizedPhotos.hats || [];
  
      console.log('Shirt Photos:', shirtPhotos);
      console.log('Pant Photos:', pantPhotos);
      console.log('Hat Photos:', hatPhotos);
  
      setShirts(shirtPhotos);
      setPants(pantPhotos);
      setHats(hatPhotos);
  
    } catch (error) {
      console.error("Error loading images:", error);
      alert("Failed to load images");
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

  const handleImageClick = (imageUri) => {
    console.log("SET IMAGEEEEE")
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const deleteImage = async (image_name) => {
    const userData = await fetchUserData(userEmail);
    if (!userData) {
      throw new Error('User data not found');
    }

    const awsPhotoKey = userData.awsPhotoKey || "";

    try {
      const response = await axios.get(`${API_URL}/deleteImage`, {
        params: {
          user_id: awsPhotoKey,
          image_name: image_name,
        },
      });
  
      if (response.status === 200) {
        alert("Image deleted successfully!");
        loadImages();
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete the image.");
    }
    setModalVisible(false);
  };

  const handleCategoryChange = async (category) => {
    const userData = await fetchUserData(userEmail);
    if (!userData) {
      throw new Error('User data not found');
    }
    console.log("Selected category:", category);

    const awsPhotoKey = userData.awsPhotoKey || "";
    console.log("SELECTED IMAGE: ", selectedImage)
    imageUri = selectedImage
    console.log("SELECTED IMAGE: ", selectedImage)

    console.log("You are going to change image: ", imageUri, "\n to category: ", category);

    try {
      const response = await axios.get(`${API_URL}/changeCategory`, {
        params: {
          user_id: awsPhotoKey,
          image_name: imageUri,
          new_category: category
        },
      });
  
      if (response.status === 200) {
        alert("Category changed successfully!");
        loadImages();
      }
    } catch (error) {
      console.error("Error changing category:", error);
      alert("Failed to change category.");
    }
    setModalVisible(false);
  };

  const [selectedCategoryy, setSelectedCategoryy] = useState("shirts");

  // Mapping category to its corresponding state
  const categoryData = {
    shirts,
    jackets,
    pants,
    shorts,
    skirts,
    hats,
  };

  const categories = Object.keys(categoryData);


  return (
    <ScrollView vertical>
      <View style={styles.container}>
        {userImage ? (
          <Image source={{ uri: userImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>Take a photo to get started!</Text>
            <Button title="Take Photo" onPress={pickImage} />
          </View>
        )}

        <Button title="Load images" onPress={() => loadImages()} />
        <Button title="Add item" onPress={() => pickImage()} />

        <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategoryy(category)}
            style={{
              padding: 10,
              marginHorizontal: 5,
              backgroundColor: selectedCategoryy === category ? "blue" : "gray",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white" }}>{category.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20 }}>
        {categoryData[selectedCategoryy].length > 0 ? (
          categoryData[selectedCategoryy].map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleImageClick(item)}>
              <Image key={ selectedCategoryy.uri || index} source={{ uri: item }} style={styles.itemImage} />
            </TouchableOpacity>
          ))
        ) : (
          <Text>No items in {selectedCategoryy}</Text>
        )}
      </ScrollView>
    </View>


        {/* <View style={styles.clothingCategory}>
          <Text style={styles.categoryTitle}>Shirts</Text>
          <ScrollView horizontal>
            {shirts.map((shirt, index) => (
              <TouchableOpacity key={index} onPress={() => handleImageClick(shirt)}>
                <Image key={shirt.uri || index} source={{ uri: shirt }} style={styles.itemImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="Add Shirt" onPress={() => pickImage("shirt")} />
        </View>

        <View style={styles.clothingCategory}>
          <Text style={styles.categoryTitle}>Pants</Text>
          <ScrollView horizontal>
            {pants.map((pant, index) => (
              <TouchableOpacity key={index} onPress={() => handleImageClick(pant)}>
                 <Image key={pant.uri || index} source={{ uri: pant }} style={styles.itemImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="Add Pant" onPress={() => pickImage("pant")} />
        </View>

        <View style={styles.clothingCategory}>
          <Text style={styles.categoryTitle}>Hats</Text>
          <ScrollView horizontal>
            {hats.map((hat, index) => (
              <TouchableOpacity key={index} onPress={() => handleImageClick(hat)}>
                <Image key={hat.uri || index} source={{ uri: hat }} style={styles.itemImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
        </View> */}

        <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Image Options</Text>
      
      <Button 
        title="Delete Image" 
        onPress={() => deleteImage(selectedImage)} 
        color="#ff4444"
      />
      
      <Text style={styles.label}>Change Category:</Text>
      
      <ModalDropdown
        options={['shirts', 'pants', 'hats']}
        onSelect={(index, value) => {
          
            handleCategoryChange(value);
          }}
        defaultIndex={0}
        defaultValue={selectedCategory || 'Select Category'}
        style={styles.dropdownButton}
        textStyle={styles.dropdownButtonText}
        dropdownStyle={styles.dropdownMenu}
        dropdownTextStyle={styles.dropdownOptionText}
        dropdownTextHighlightStyle={styles.dropdownOptionTextHighlight}
      />
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</View>
</ScrollView>
);
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 20 
  },
  profileImage: { 
    width: 150, 
    height: 150, 
    marginBottom: 20 
  },
  promptContainer: { 
    alignItems: "center", 
    marginBottom: 20 
  },
  promptText: { 
    fontSize: 16, 
    marginBottom: 30 
  },
  clothingCategory: { 
    marginRight: 20, 
    alignItems: "center", 
    maxHeight: 300
  },
  categoryTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  itemImage: { 
    width: 100, 
    height: 100, 
    marginRight: 10, 
    borderRadius: 10, 
    borderWidth: 2, 
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: '80%',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  dropdownButton: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    width: '80%',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  dropdownOptionText: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#333',
  },
  dropdownOptionTextHighlight: {
    color: 'red',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "red",
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 50,
    width: 150,
    marginBottom: 80,
    color: "black",
    backgroundColor: "blue"
  },
  pickerItem: {
    color: "black"
  },
});

export default HomeScreen;


