// SignUp.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  useColorScheme,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../FireBaseConfig";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, runTransaction } from "firebase/firestore";
import axios from "axios";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import createStyles from "./styles";

const db = getFirestore(app);
const API_URL = "http://18.227.89.214:5000";

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const isDarkMode = colorScheme === "dark";

  const handleSignUp = async () => {
    try {
      const auth = getAuth();
      console.log("Creating user with email:", email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const counterRef = doc(db, "counters", "awsPhotoKey");

      const newValue = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          transaction.set(counterRef, { lastValue: 0 });
        }

        const lastValue = counterDoc.data()?.lastValue || 0;
        const newValue = lastValue + 1;

        transaction.update(counterRef, { lastValue: newValue });

        return newValue;
      });

      console.log("Adding user data to Firestore...");
      await setDoc(doc(db, "users", user.email), {
        email: user.email,
        awsPhotoKey: newValue,
      });

      try {
        const response = await axios.post(`${API_URL}/register`, {
          username: String(newValue),
        });
        console.log("User created:", response.data);
        alert("User created successfully");
      } catch (error) {
        console.error(
          "Error creating user:",
          error.response?.data || error.message
        );
        alert("Failed to create user");
      }

      console.log("User data added to Firestore");
    } catch (error) {
      console.error("Error during sign-up:", error);
      setErrorMessage(error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={
          colorScheme === "dark"
            ? require("../../assets/RLlogoWhite.png")
            : require("../../assets/RLlogo.png")
        }
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>
        <Text style={{ color: isDarkMode ? "#D1EF53" : "#CB3033" }}>
          Register
        </Text>{" "}
        to join Us!
      </Text>
      <Text style={styles.welcomeLabel}>Please enter your Information</Text>

      <TextInput
        style={styles.email}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.password}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign up</Text>
      </TouchableOpacity>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Text style={styles.orText}>——— OR ———</Text>

      <TouchableOpacity style={styles.socialButtonGoogle}>
        <FontAwesome
          name="google"
          size={20}
          color={colorScheme === "dark" ? "white" : "white"}
        />
        <Text style={styles.socialButtonTextGoogle}>Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButtonApple}>
        <Ionicons
          name="logo-apple"
          size={20}
          color={colorScheme === "dark" ? "black" : "white"}
        />
        <Text style={styles.socialButtonTextApple}>Sign up with Apple</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.alreadyHaveAccountText}>
          Already have an account?{" "}
        </Text>
        <Text
          style={styles.loginText}
          onPress={() => navigation.navigate("Login")}
        >
          Login
        </Text>
      </View>
    </View>
  );
};

export default SignUp;
