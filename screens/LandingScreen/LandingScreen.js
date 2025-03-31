import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Animated,
  StatusBar,
  useColorScheme,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import createStyles from "./styles";

const { width } = Dimensions.get("window");

const LandingScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const scrollAnim1 = useRef(new Animated.Value(0)).current;
  const scrollAnim2 = useRef(new Animated.Value(0)).current;
  const scrollAnim3 = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const mainTextOpacityAnim = useRef(new Animated.Value(0)).current;
  const mainTextTranslateAnim = useRef(new Animated.Value(20)).current;
  const bannerTextOpacityAnim = useRef(new Animated.Value(0)).current;

  const startScrolling = (animation, duration) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: -width * 2,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(mainTextOpacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(mainTextTranslateAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bannerTextOpacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    startScrolling(scrollAnim1, 6000);
    startScrolling(scrollAnim2, 8000);
    startScrolling(scrollAnim3, 10000);

    StatusBar.setBarStyle(
      colorScheme === "dark" ? "light-content" : "dark-content",
      true
    );
  }, [colorScheme]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/landing.png")}
        style={styles.backgroundImage}
      >
        <Svg height="100%" width="100%" style={styles.gradient}>
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="60%" stopColor="transparent" stopOpacity="0" />
              <Stop
                offset="25%"
                stopColor={colorScheme === "dark" ? "black" : "white"}
                stopOpacity="10"
              />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad1)" />
        </Svg>

        <View style={styles.tapeBannerBack}>
          <View style={styles.scaleWrapper}>
            <Animated.View
              style={[
                styles.scrollingBanner,
                { transform: [{ translateX: scrollAnim1 }] },
              ]}
            >
              <Animated.Text
                style={[
                  styles.backBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                SNAP // DESIGN // CREATE // STYLE // REPEAT //
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.backBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                SNAP // DESIGN // CREATE // STYLE // REPEAT //
              </Animated.Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.overlay}>
          <View style={styles.textContainer}>
            <View style={styles.scaleWrapper}>
              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: mainTextOpacityAnim,
                    transform: [{ translateY: mainTextTranslateAnim }],
                  },
                ]}
              >
                ELEVATE YOUR
              </Animated.Text>
            </View>
            <View style={styles.scaleWrapper}>
              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: mainTextOpacityAnim,
                    transform: [{ translateY: mainTextTranslateAnim }],
                  },
                ]}
              >
                STYLE, ONE TAP
              </Animated.Text>
            </View>
            <View style={styles.lastLine}>
              <View style={styles.scaleWrapper}>
                <Animated.Text
                  style={[
                    styles.title,
                    {
                      opacity: mainTextOpacityAnim,
                      transform: [{ translateY: mainTextTranslateAnim }],
                    },
                  ]}
                >
                  AT A TIME
                </Animated.Text>
              </View>
              <Animated.View
                style={{ transform: [{ translateX: bounceAnim }] }}
              >
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={45}
                    color={colorScheme === "dark" ? "black" : "white"}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.tapeBannerFront}>
          <View style={styles.scaleWrapper}>
            <Animated.View
              style={[
                styles.scrollingBanner,
                { transform: [{ translateX: scrollAnim2 }] },
              ]}
            >
              <Animated.Text
                style={[
                  styles.frontBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                TEST \\ REPEAT \\ ENDLESS OUTFIT POSSIBILITIES \\ SNAP \\ REPEAT
                \\
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.frontBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                TEST \\ REPEAT \\ ENDLESS OUTFIT POSSIBILITIES \\ SNAP \\ REPEAT
                \\
              </Animated.Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.tapeBannerBottom}>
          <View style={styles.scaleWrapper}>
            <Animated.View
              style={[
                styles.scrollingBanner,
                { transform: [{ translateX: scrollAnim3 }] },
              ]}
            >
              <Animated.Text
                style={[
                  styles.bottomBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                STREETWEAR // REDLETTERS - STREETWEAR // REDLETTERS - STREETWEAR
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.bottomBannerText,
                  { opacity: bannerTextOpacityAnim },
                ]}
                numberOfLines={1}
              >
                STREETWEAR // REDLETTERS - STREETWEAR // REDLETTERS - STREETWEAR
              </Animated.Text>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LandingScreen;
