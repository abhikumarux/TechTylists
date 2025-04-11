import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableHighlight, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';
import axios from 'axios';
import ModalDropdown from 'react-native-modal-dropdown';
import { ActivityIndicator } from 'react-native';



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
  const[hoodies, setHoodies] = useState([]);
  const [, set] = useState([]);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imagesToUse, setImagesToUse] = useState([]);
  const [generatedPhoto, setGeneratedPhoto] = useState([]);
  const [loadingVar, setLoadingVar] = useState(false);
  const [uploadImageModalSpinner, setUploadImageModalSpinner] = useState(false);
  const [uploadImageModalVisibleActualModal, setUploadImageModalVisibleActualModal] = useState(false);
  const [textToDisplayIfItemsGetsUploaded, setTextToDisplayIfItemGetsUploaded] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserImage();
    }
  }, [user]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


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
      setUploadImageModalVisibleActualModal(true);
        uploadPhoto(result.assets[0].uri);
    }
  };

  const pickImageForBody = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      const updated = [...imagesToUse, result.assets[0].uri];
      setImagesToUse(updated);
      console.log("Uploaded Image Added:", updated);
    }
  };

  const uploadImageForBody = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({

      quality: 1,
    });
  
    if (!result.canceled) {
      const updated = [...imagesToUse, result.assets[0].uri];
      setImagesToUse(updated);
      console.log("Uploaded Image Added:", updated);
    }
  };

  const uploadPhoto = async (image) => {
    if (!image) {
      alert('No photo selected');
      return;
    }
    try {
      setUploadImageModalSpinner(true);
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
      setUploadImageModalSpinner(false);
      setTextToDisplayIfItemGetsUploaded('Uploaded photo with category of ' + response.data.category);
      setUploadedPhotoPath(response.data.image_uploaded_to);
      await sleep(3000);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
      setUploadImageModalSpinner(false);
      setTextToDisplayIfItemGetsUploaded("Failed to upload the photo, please try again")
      await sleep(3000);
      uploadImageModalVisibleActualModal(false);
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
      const hoodiePhotos = categorizedPhotos.hoodies || [];
  
      console.log('Shirt Photos:', shirtPhotos);
      console.log('Pant Photos:', pantPhotos);
      console.log('Hat Photos:', hatPhotos);
  
      setShirts(shirtPhotos);
      setPants(pantPhotos);
      setHats(hatPhotos);
      setHoodies(hoodiePhotos);
  
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

  const addToOutfit = async (selectedImage) => {
    imagesToUse.push(selectedImage);
    console.log(imagesToUse);
    setModalVisible(false);
  }
  
  const generateOutfit = async () => {
    try {
  
      const formData = new FormData();
      formData.append('baseFile', {
        uri: imagesToUse[0],
        type: 'image/jpg',
        name: `base.jpg`,
      });
      formData.append('topFile', {
        uri: imagesToUse[1],
        type: 'image/jpg',
        name: `top.jpg`,
      });
      formData.append('bottomFile', {
        uri: imagesToUse[2],
        type: 'image/jpg',
        name: `bottom.jpg`,
      });

      setLoadingVar(true);
      const response = await axios.post(`${API_URL}/generateOutfit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        const newImage = response.data.image;
        const updatedImages = [...imagesToUse];
        updatedImages[0] = newImage;
        setGeneratedPhoto(updatedImages);
        setLoadingVar(false);
  
        console.log("Updated imagesToUse[0] with outfit:");
      } else {
        if(response.message == "Model was too human like so could not generate")
          setLoadingVar(false);
     {
      alert("Model was too human like so could not generate");
     }
     if(response.message == 5) {
      alert("Too much traffic on google ai server, please try again a few times");
      setLoadingVar(false);
     }
        }
    } catch (error) {
      // console.error("Error generating outfit:", error);
      alert("Too much traffic on google ai server, please try again a few times");
      setLoadingVar(false);
    }
  };
  

  
  const deletePhoto = async () => {

    setImagesToUse([]);
    setUploadedPhotoPath('');
    setGeneratedPhoto([]);



  }

  const [selectedCategoryy, setSelectedCategoryy] = useState("shirts");

  const categoryData = {
    shirts,
    jackets,
    pants,
    shorts,
    skirts,
    hats,
    hoodies,
  };

  const categories = Object.keys(categoryData);


  return (
    <ScrollView vertical>
      <View style={styles.container}>
        <Button title='Delete Photo' onPress={() => deletePhoto()} />
        {imagesToUse[0] ? (
          <Image source={{ uri: imagesToUse[0] }} style={styles.profileImage} />
        ) : (
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>Take a photo to get started!</Text>
            <Button title="Take Photo" onPress={pickImageForBody} />
            <Button title="Upload from Gallery" onPress={uploadImageForBody} />
          </View>
        )}
       {loadingVar ? (
        <ActivityIndicator size="large" color="#0000ff" />
        ) : generatedPhoto[0] ? (
  <Image source={{ uri: 'data:image/jpeg;base64,' + generatedPhoto[0] }} style={styles.profileImage1} />
        ) : null}


        <Button title="Generate outfit" onPress={() => generateOutfit()} />
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
    
        <Modal animationType='slide' transparent={true} visible={uploadImageModalVisibleActualModal} onRequestClose={() => setUploadImageModalVisibleActualModal(false)}>
        <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
        {uploadImageModalSpinner ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Uploading Image </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>       ) : (
          <View>
           <Text>{textToDisplayIfItemsGetsUploaded}</Text> 
           <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => setUploadImageModalVisibleActualModal(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
           </View>
        )}
        </View>
        </View>

        </Modal> 
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
        title="Use for outfit"
        onPress={() => addToOutfit(selectedImage)}
        />

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
  profileImage1: {
    width: '100%', // Adjust the width as per your design, 100% to take up the full width of the container
    height: 300, // Set the height to control the aspect ratio of the image, or use flex
    resizeMode: 'contain', // Ensures the image scales to fit while maintaining its aspect ratio
    borderRadius: 10, // Optional: for rounded corners
  },
});

export default HomeScreen;


