// Login.js (adds shouldLogoutOnExit logic)
import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  useColorScheme,
  Switch,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import createStyles from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../FireBaseConfig";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
        await AsyncStorage.removeItem("shouldLogoutOnExit");
      } else {
        await AsyncStorage.setItem("shouldLogoutOnExit", "true");
        await AsyncStorage.removeItem("rememberMe");
      }
    } catch (error) {
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
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.welcomeLabel}>
        Please Login or Sign up an Account
      </Text>

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

      <View style={styles.rememberMeContainer}>
        <Switch
          value={rememberMe}
          onValueChange={(val) => setRememberMe(val)}
          trackColor={{
            false: colorScheme === "dark" ? "#555" : "#ccc",
            true: colorScheme === "dark" ? "#D1EF53" : "#CB3033",
          }}
          thumbColor={
            rememberMe
              ? colorScheme === "dark"
                ? "#222"
                : "#fff"
              : colorScheme === "dark"
              ? "#555"
              : "#f4f3f4"
          }
          style={{ marginRight: 10 }}
        />

        <Text style={styles.rememberMeText}>Remember me</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
        <Text style={styles.logInButtonText}>Login</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Text style={styles.orText}>——— OR ———</Text>

      <TouchableOpacity style={styles.socialButtonGoogle}>
        <FontAwesome
          name="google"
          size={20}
          color={colorScheme === "dark" ? "white" : "white"}
        />
        <Text style={styles.socialButtonTextGoogle}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButtonApple}>
        <Ionicons
          name="logo-apple"
          size={20}
          color={colorScheme === "dark" ? "black" : "white"}
        />
        <Text style={styles.socialButtonTextApple}>Sign in with Apple</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.dontHaveAccountText}>Don't have an account? </Text>
        <Text
          style={styles.signUpText}
          onPress={() => navigation.navigate("SignUp")}
        >
          Sign Up
        </Text>
      </View>
    </View>
  );
};

export default Login;
