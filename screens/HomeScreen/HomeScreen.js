import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  Alert,
  useColorScheme,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import createStyles from "./styles";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import axios from "axios";
import ModalDropdown from "react-native-modal-dropdown";
import { ActivityIndicator } from "react-native";

//nohup python server4.py &

const API_URL = "http://18.225.195.136:5000";

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
  const [hoodies, setHoodies] = useState([]);
  const [, set] = useState([]);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [imagesToUse, setImagesToUse] = useState([]);
  const [generatedPhoto, setGeneratedPhoto] = useState([]);
  const [loadingVar, setLoadingVar] = useState(false);
  const [uploadImageModalSpinner, setUploadImageModalSpinner] = useState(false);
  const [
    uploadImageModalVisibleActualModal,
    setUploadImageModalVisibleActualModal,
  ] = useState(false);
  const [textToDisplayIfItemsGetsUploaded, setTextToDisplayIfItemGetsUploaded] =
    useState("");
  const [saveOut, setSaveOut] = useState(false);
  const [outfitsSaved, setOutfitsSaved] = useState([]);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  useEffect(() => {
    if (user) {
      fetchUserImage();
    }
  }, [user]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      alert("No photo selected");
      return;
    }
    try {
      setUploadImageModalSpinner(true);
      const userData = await fetchUserData(userEmail);
      if (!userData) {
        throw new Error("User data not found");
      }

      const awsPhotoKey = userData.awsPhotoKey || "";
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        type: "image/jpg",
        name: `photo_${Date.now()}.jpg`,
      });
      formData.append("user_id", String(awsPhotoKey));
      console.log("sendinggggg");
      const response = await axios.post(`${API_URL}/uploadImage`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Photo uploaded:", response.data);
      setUploadImageModalSpinner(false);
      setTextToDisplayIfItemGetsUploaded(
        "Uploaded photo with category of " + response.data.category
      );
      setUploadedPhotoPath(response.data.image_uploaded_to);
      await sleep(3000);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
      setUploadImageModalSpinner(false);
      setTextToDisplayIfItemGetsUploaded(
        "Failed to upload the photo, please try again"
      );
      await sleep(3000);
      uploadImageModalVisibleActualModal(false);
    }
    loadImages();
  };

  const loadImages = async () => {
    try {
      const userData = await fetchUserData(userEmail);
      if (!userData) {
        throw new Error("User data not found");
      }

      const awsPhotoKey = userData.awsPhotoKey || "";
      const response = await axios.get(`${API_URL}/get_user_photos`, {
        params: { user_id: awsPhotoKey },
      });

      console.log("API Response:", response.data);

      const categorizedPhotos = response.data.photos;
      const shirtPhotos = categorizedPhotos.shirts || [];
      const pantPhotos = categorizedPhotos.pants || [];
      const hatPhotos = categorizedPhotos.hats || [];
      const hoodiePhotos = categorizedPhotos.hoodies || [];

      console.log("Shirt Photos:", shirtPhotos);
      console.log("Pant Photos:", pantPhotos);
      console.log("Hat Photos:", hatPhotos);

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
      console.log("Fetching user data for email:", email);

      if (!email) {
        throw new Error("Email is null or undefined");
      }

      const userRef = doc(db, "users", email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data found:", userData);
        return userData;
      } else {
        console.log("No user data found for email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const handleImageClick = (imageUri) => {
    console.log("SET IMAGEEEEE");
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const deleteImage = async (image_name) => {
    const userData = await fetchUserData(userEmail);
    if (!userData) {
      throw new Error("User data not found");
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
      throw new Error("User data not found");
    }
    console.log("Selected category:", category);

    const awsPhotoKey = userData.awsPhotoKey || "";
    console.log("SELECTED IMAGE: ", selectedImage);
    imageUri = selectedImage;
    console.log("SELECTED IMAGE: ", selectedImage);

    console.log(
      "You are going to change image: ",
      imageUri,
      "\n to category: ",
      category
    );

    try {
      const response = await axios.get(`${API_URL}/changeCategory`, {
        params: {
          user_id: awsPhotoKey,
          image_name: imageUri,
          new_category: category,
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
  };

  const generateOutfit = async () => {
    try {
      const formData = new FormData();
      formData.append("baseFile", {
        uri: imagesToUse[0],
        type: "image/jpg",
        name: "base.jpg",
      });
      formData.append("topFile", {
        uri: imagesToUse[1],
        type: "image/jpg",
        name: "top.jpg",
      });
      formData.append("bottomFile", {
        uri: imagesToUse[2],
        type: "image/jpg",
        name: "bottom.jpg",
      });

      setLoadingVar(true);

      const response = await axios.post(`${API_URL}/generateOutfit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { status, data } = response;

      if (status === 200 && data.image) {
        const updatedImages = [...imagesToUse];
        updatedImages[0] = data.image;
        setGeneratedPhoto(updatedImages);
        outfitsSaved.push(updatedImages[0]);
        console.log("Outfit generated successfully");
      } else if (
        data?.message === "Model was too human like so could not generate"
      ) {
        alert(
          "Model rejected the image: too human-like. Try a different pose or image."
        );
      } else if (
        data?.message ===
        "Too many people are using the server or the model rejected the input."
      ) {
        alert("Model is currently overloaded. Try again in a few moments.");
      } else if (data?.message === "Error processing generated image.") {
        alert("An error occurred while processing the generated image.");
      } else {
        alert("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error generating outfit:", error);
      alert("Server error or high traffic. Please try again later.");
    } finally {
      setLoadingVar(false);
    }
  };

  const deletePhoto = async () => {
    setImagesToUse([]);
    setUploadedPhotoPath("");
    setGeneratedPhoto([]);
  };

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

  const saveToOutfits = async () => {
    try {
      const outfitToSave = generatedPhoto[0];

      const newArr = [...outfitsSaved, outfitToSave];
      setOutfitsSaved(newArr);

      // Save the outfit
      const fullOutfit = generatedPhoto[0];
      const individualItems = imagesToUse;

      const formData = new FormData();

      console.log("Fetching user data for:", userEmail);
      const userData = await fetchUserData(userEmail);

      if (!userData) {
        console.error("User data not found after fetchUserData");
        throw new Error("User data not found");
      }

      console.log("Fetched user data:", userData);

      const postNumberToUse = (userData.postNumber || 0) + 1;
      const awsPhotoKey = userData.awsPhotoKey;
      console.log("Calculated post number to use:", postNumberToUse);

      const userRef = doc(db, "users", userEmail);
      console.log("User reference created:", userRef.path);

      // Update postNumber using setDoc with merge
      await setDoc(userRef, { postNumber: postNumberToUse }, { merge: true });

      console.log("Successfully updated post number in Firestore.");

      const toFile = (base64, name) => ({
        uri: `data:image/jpeg;base64,${base64}`,
        type: "image/jpeg",
        name,
      });

      formData.append("fullOutfit", toFile(generatedPhoto[0], "full.jpg"));

      const fetchLocalImageAsBlob = async (fileUri) => {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        return blob;
      };

      console.log("Sending out these: ", imagesToUse);
      imagesToUse.forEach((itemUri, index) => {
        formData.append("individuals", {
          uri: itemUri,
          name: `item_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      formData.append("user_id", String(awsPhotoKey));
      formData.append("outfit_Id", postNumberToUse);

      await axios.post(`${API_URL}/uploadOutfit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "Outfit uploaded successfully with post number:",
        postNumberToUse
      );
    } catch (error) {
      console.error("Error in saveToOutfits:", error);
    }
    deletePhoto();
  };

  return (
    <ScrollView vertical>
      <View style={styles.topContainer}>
        <Button title="Delete Photo" onPress={() => deletePhoto()} />
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
          <View style={styles.generatedContainer}>
            <Image
              source={{ uri: "data:image/jpeg;base64," + generatedPhoto[0] }}
              style={styles.profileImage1}
            />
            <Button title="Save Outfit" onPress={saveToOutfits} />
          </View>
        ) : null}

        <Button title="Generate outfit" onPress={() => generateOutfit()} />
        <Button title="Load images" onPress={() => loadImages()} />
        <View style={styles.selectItemsRow}>
          <View style={styles.selectItemsRow}>
            <Text style={styles.selectItemsText}>Select Items</Text>
            <TouchableOpacity style={styles.addItemButton} onPress={pickImage}>
              <Ionicons
                name="add"
                size={28}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategoryy(category)}
                style={styles.categoryButton(selectedCategoryy === category)}
              >
                <Text
                  style={styles.categoryButtonText(
                    selectedCategoryy === category
                  )}
                >
                  {category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 20 }}
          >
            {categoryData[selectedCategoryy].length > 0 ? (
              categoryData[selectedCategoryy].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageClick(item)}
                >
                  <Image
                    key={selectedCategoryy.uri || index}
                    source={{ uri: item }}
                    style={styles.itemImage}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text>No items in {selectedCategoryy}</Text>
            )}
          </ScrollView>
          <Text style={styles.outfitTitle}>Saved Outfits</Text>

          <View style={styles.outfitsContainer}>
            {outfitsSaved.map((outfit, index) => (
              <Image
                key={index}
                source={{ uri: "data:image/jpeg;base64," + outfit }}
                style={styles.profileImage1}
              />
            ))}
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={uploadImageModalVisibleActualModal}
          onRequestClose={() => setUploadImageModalVisibleActualModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {uploadImageModalSpinner ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text>Uploading Image </Text>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : (
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
                options={["shirts", "pants", "hats"]}
                onSelect={(index, value) => {
                  handleCategoryChange(value);
                }}
                defaultIndex={0}
                defaultValue={selectedCategory || "Select Category"}
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

export default HomeScreen;
