import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import UploadScreen from "./screens/UploadScreen";
import ProfileScreen from "./screens/ProfileScreen";
import UserScreen from "./screens/UserScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LandingScreen from "./screens/LandingScreen/LandingScreen";
import Login from "./screens/LoginScreen/login";
import SignUp from "./screens/SignUpScreen/SignUp";
import TutorialScreen from "./screens/TutorialScreen/TutorialScreen";
import { app } from "./screens/FireBaseConfig";

const auth = getAuth(app);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainApp = ({ route }) => {
  const { userEmail } = route.params || {};
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Photo") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => <HomeScreen userEmail={userEmail} />}
      />
      <Tab.Screen name="Photo" component={UploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen
        name="User Screen"
        children={() => <UserScreen userEmail={userEmail} />}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsLoggedIn(true);
      } else {
        setUserEmail(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Tutorial"
            component={TutorialScreen} // Show tutorial screen after login
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={MainApp}
            initialParams={{ userEmail: userEmail }} // Pass user email to the home screen
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
