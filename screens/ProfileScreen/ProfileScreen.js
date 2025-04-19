// ProfileScreen.js (adds Logout button to Profile tab)
import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../FireBaseConfig";

const ProfileScreen = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      Alert.alert("Logout failed", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

export default ProfileScreen;
