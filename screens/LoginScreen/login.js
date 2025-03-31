import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  useColorScheme,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import createStyles from "./styles";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
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

      {/* Remember Me & Forgot Password Row */}
      <View style={styles.rememberMeContainer}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
          <MaterialCommunityIcons
            name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
            size={24}
            color={rememberMe ? styles.rememberedColor : styles.rememberColor}
          />
        </TouchableOpacity>
        <Text style={styles.rememberMeText}>Remember me</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
        <Text style={styles.logInButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* OR Separator */}
      <Text style={styles.orText}>——— OR ———</Text>

      {/* Social Login Buttons */}
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

      {/* Sign Up Text */}
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
