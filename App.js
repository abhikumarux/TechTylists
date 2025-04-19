// App.js (with custom global dark/light themes)
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import UploadScreen from "./screens/UploadScreen/UploadScreen";
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen";
import UserScreen from "./screens/UserScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LandingScreen from "./screens/LandingScreen/LandingScreen";
import Login from "./screens/LoginScreen/login";
import SignUp from "./screens/SignUpScreen/SignUp";
import TutorialScreen from "./screens/TutorialScreen/TutorialScreen";
import { app, auth } from "./screens/FireBaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, useColorScheme } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ Custom Themes
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#121212",
    card: "#1E1E1E",
    text: "#ffffff",
    border: "#333333",
    notification: "#D1EF53",
    primary: "#D1EF53",
  },
};

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
    card: "#ffffff",
    text: "#000000",
    border: "#cccccc",
    notification: "#CB3033",
    primary: "#CB3033",
  },
};

const MainApp = ({ route }) => {
  const { userEmail } = route.params || {};
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "black" : "#fff",
          borderTopColor: colorScheme === "dark" ? "black" : "#ccc",
          height: 80,
          position: "absolute",
        },
        tabBarActiveTintColor: colorScheme === "dark" ? "#D1EF53" : "#CB3033",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#9DB2CE" : "#888",
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Closet") {
            const isDark = colorScheme === "dark";

            return (
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: focused
                    ? isDark
                      ? "#D1EF53"
                      : "#CB3033"
                    : isDark
                    ? "#2c2c2c"
                    : "#e5e5e5",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 40,
                  shadowColor: focused
                    ? isDark
                      ? "#D1EF53"
                      : "#CB3033"
                    : isDark
                    ? "#2c2c2c"
                    : "#e5e5e5",
                  shadowOpacity: 0.4,
                  shadowOffset: { width: 0, height: 5 },
                  shadowRadius: 5,
                  elevation: focused ? 5 : 0,
                  borderWidth: focused ? 0 : 1,
                  borderColor: isDark ? "#555" : "#ccc",
                }}
              >
                <MaterialCommunityIcons
                  name="hanger"
                  size={38}
                  color={
                    focused
                      ? isDark
                        ? "black"
                        : "white"
                      : isDark
                      ? "#aaa"
                      : "#666"
                  }
                />
              </View>
            );
          }

          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Photo") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "Social") {
            iconName = focused ? "earth-sharp" : "earth-outline";
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
      <Tab.Screen
        name="Photo"
        children={() => <UploadScreen userEmail={userEmail} />}
      />
      <Tab.Screen
        name="Closet"
        children={() => <UploadScreen userEmail={userEmail} />}
        options={{
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Social"
        children={() => <UserScreen userEmail={userEmail} />}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialScreen, setInitialScreen] = useState("Home");
  const colorScheme = useColorScheme();

  // ✅ Use custom themes
  const theme = colorScheme === "dark" ? MyDarkTheme : MyLightTheme;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const shouldLogout = await AsyncStorage.getItem("shouldLogoutOnExit");
        if (shouldLogout === "true") {
          await AsyncStorage.removeItem("shouldLogoutOnExit");
          await signOut(auth);
          return;
        }

        const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
        setInitialScreen(hasSeenTutorial === "true" ? "Home" : "Tutorial");
        setUserEmail(user.email);
        setIsLoggedIn(true);
      } else {
        setUserEmail(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🌀 Loading state checking for login auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer theme={theme}>
        {isLoggedIn ? (
          <Stack.Navigator>
            {initialScreen === "Tutorial" && (
              <Stack.Screen
                name="Tutorial"
                component={TutorialScreen}
                initialParams={{ userEmail }}
                options={{ headerShown: false }}
              />
            )}
            <Stack.Screen
              name="Home"
              component={MainApp}
              initialParams={{ userEmail }}
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
    </>
  );
};

export default App;
