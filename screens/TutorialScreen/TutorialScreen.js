// TutorialScreen.js (final screen saves flag and goes to Home)
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Swiper from "react-native-swiper";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

const tutorialScreens = [
  {
    image: require("../../assets/Tutorial1.png"),
    title: "Capture Your Body",
    subheading: "Snap a quick photo to create your virtual fit profile.",
    bottomTitle: "Get the Perfect Fit",
    bottomSubheading: "Snap a quick photo to create your virtual fit profile",
  },
  {
    image: require("../../assets/Tutorial2.png"),
    title: "Scan Your Clothes",
    subheading: "Take a picture of your favorite Clothes!",
    bottomTitle: "Bring Your Clothes to Life",
    bottomSubheading:
      "Our smart scanner removes the background, so you can try them on virtually.",
  },
  {
    image: require("../../assets/Tutorial3.png"),
    title: "Mix & Match Styles",
    subheading: "Style your outfits on your virtual self.",
    bottomTitle: "Try On & Customize",
    bottomSubheading: "Experiment with different looks before stepping out!",
  },
  {
    image: require("../../assets/Tutorial4.png"),
    title: "Let's Get You Started with Your First Outfit",
    subheading:
      "Please scan any clothing you would like to add to your personal wardrobe",
    bottomTitle: "Customize Your Look",
    bottomSubheading: "Adjust to find the best fit and style for you.",
  },
];

const TutorialScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userEmail } = route.params || {};
  const swiperRef = useRef(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = createStyles(isDarkMode);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIndexChange = (index) => {
    setCurrentIndex(index);
  };

  const handleFinishTutorial = async () => {
    await AsyncStorage.setItem("hasSeenTutorial", "true");
    navigation.replace("Home", { userEmail });
  };

  const handleContinue = () => {
    if (currentIndex < tutorialScreens.length - 1) {
      swiperRef.current.scrollBy(1, true);
    }
  };

  const handleSkip = () => {
    swiperRef.current.scrollBy(tutorialScreens.length - currentIndex - 1, true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={true}
          style={styles.swiper}
          onIndexChanged={handleIndexChange}
          dotColor={isDarkMode ? "#2C3116" : "#FEE4E5"}
          activeDotColor={isDarkMode ? "#D1EF53" : "#CB3033"}
          index={currentIndex}
        >
          {tutorialScreens.map((screen, index) => (
            <View key={index} style={styles.slide}>
              <Animatable.View
                animation="slideInDown"
                duration={700}
                style={styles.textBox}
                key={`title-${index}`}
              >
                <Text style={styles.title}>
                  {screen.title.split(" ").map((word, wordIndex) => {
                    const isHighlight =
                      (index === 0 && word === "Body") ||
                      (index === 1 && word === "Clothes") ||
                      (index === 2 && word === "Styles") ||
                      (index === 3 && word === "Started");

                    return (
                      <Text
                        key={wordIndex}
                        style={{
                          color: isHighlight
                            ? isDarkMode
                              ? "#D1EF53"
                              : "#CB3033"
                            : isDarkMode
                            ? "#FFFFFF"
                            : "#000000",
                          fontWeight: isHighlight ? "bold" : "normal",
                        }}
                      >
                        {word}{" "}
                      </Text>
                    );
                  })}
                </Text>
                <Animatable.Text
                  animation="fadeInUp"
                  delay={200}
                  duration={600}
                  style={styles.subheading}
                >
                  {screen.subheading}
                </Animatable.Text>
              </Animatable.View>

              <Image source={screen.image} style={styles.image} />

              <Animatable.View
                animation="fadeInUp"
                delay={300}
                duration={700}
                style={styles.bottomTextBox}
              >
                <Text style={styles.bottomTitle}>{screen.bottomTitle}</Text>
                <Text style={styles.bottomSubheading}>
                  {screen.bottomSubheading}
                </Text>
              </Animatable.View>
            </View>
          ))}
        </Swiper>
      </View>

      <View style={styles.buttonWrapper}>
        {currentIndex < tutorialScreens.length - 1 ? (
          <>
            <TouchableOpacity
              style={[styles.navButtons, styles.nextButton]}
              onPress={handleContinue}
            >
              <Text style={styles.nextText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButtons, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.navButtons, styles.continueLastButton]}
            onPress={handleFinishTutorial}
          >
            <Text style={styles.continueLastText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
    },
    imageContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    swiper: {
      height: "100%",
    },
    slide: {
      justifyContent: "center",
      alignItems: "center",
    },
    textBox: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 10,
      width: "85%",
      backgroundColor: isDarkMode ? "#212121" : "#DEDEDE",
      height: 120,
      justifyContent: "center",
    },
    title: {
      fontSize: 29,
      fontWeight: "600",
      textAlign: "center",
    },
    subheading: {
      fontSize: 16,
      color: isDarkMode ? "#A0A0A0" : "#505050",
      textAlign: "center",
      marginTop: 5,
    },
    bottomTextBox: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 15,
      width: "85%",
      backgroundColor: "transparent",
      height: 100,
      justifyContent: "center",
    },
    bottomTitle: {
      fontSize: 24,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#000000",
      textAlign: "left",
    },
    bottomSubheading: {
      fontSize: 16,
      color: isDarkMode ? "#A0A0A0" : "#505050",
      textAlign: "left",
      marginTop: 5,
    },
    image: {
      width: "75%",
      height: "60%",
      resizeMode: "contain",
      marginBottom: 15,
      backgroundColor: isDarkMode ? "#C7E5B5" : "#E5B5B5",
      borderRadius: 20,
    },
    buttonWrapper: {
      width: "100%",
      alignItems: "center",
      paddingBottom: 40,
    },
    navButtons: {
      borderRadius: 15,
      width: 340,
      height: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },
    nextButton: {
      backgroundColor: isDarkMode ? "#D1EF53" : "#CB3033",
    },
    nextText: {
      fontSize: 22,
      fontWeight: "500",
      fontFamily: "Poppins-SemiBold",
      color: isDarkMode ? "#000000" : "#FFFFFF",
      textAlign: "center",
    },
    skipButton: {
      borderWidth: 2,
      borderColor: isDarkMode ? "#D1EF53" : "#CB3033",
      backgroundColor: "transparent",
    },
    skipText: {
      fontSize: 22,
      fontWeight: "500",
      fontFamily: "Poppins-SemiBold",
      color: isDarkMode ? "#FFFFFF" : "#000000",
      textAlign: "center",
    },
    continueLastButton: {
      backgroundColor: isDarkMode ? "#D1EF53" : "#CB3033",
      marginTop: 25,
      marginBottom: 50,
    },
    continueLastText: {
      fontSize: 22,
      fontWeight: "500",
      fontFamily: "Poppins-SemiBold",
      color: isDarkMode ? "#000000" : "#FFFFFF",
      textAlign: "center",
    },
  });

export default TutorialScreen;
