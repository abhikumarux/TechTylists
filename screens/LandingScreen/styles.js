import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const createStyles = (colorScheme) => {
  const isDarkMode = colorScheme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "white",
    },
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    gradient: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    tapeBannerBack: {
      backgroundColor: "black",
      paddingVertical: 10,
      width: "200%",
      position: "absolute",
      top: width * 0.3,
      transform: [{ rotate: "20deg" }],
      zIndex: -1,
      overflow: "hidden",
    },
    tapeBannerFront: {
      backgroundColor: "black",
      paddingVertical: 10,
      width: "200%",
      position: "absolute",
      top: width * 1.05,
      transform: [{ rotate: "-15deg" }],
      zIndex: 2,
      overflow: "hidden",
    },
    tapeBannerBottom: {
      backgroundColor: isDarkMode ? "black" : "white",
      width: "200%",
      position: "absolute",
      top: width * 1.8,
      zIndex: 2,
      overflow: "hidden",
    },
    backBannerText: {
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      fontSize: 34,
      lineHeight: 55,
      fontFamily: "BebasNeue-Regular",
      fontWeight: "700",
      textAlign: "left",
      width: width * 2,
      letterSpacing: 2,
      overflow: "hidden",
    },
    frontBannerText: {
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      fontSize: 22,
      lineHeight: 55,
      fontFamily: "BebasNeue-Regular",
      fontWeight: "700",
      textAlign: "left",
      width: width * 2,
      letterSpacing: 2,
      overflow: "hidden",
    },
    bottomBannerText: {
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      fontSize: 20,
      lineHeight: 55,
      fontFamily: "BebasNeue-Regular",
      fontWeight: "700",
      textAlign: "left",
      width: width * 2,
      letterSpacing: 2,
      overflow: "hidden",
    },
    scaleWrapper: {
      transform: [{ scaleY: 1.7 }],
    },
    scrollingBanner: {
      flexDirection: "row",
      alignItems: "center",
    },
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 30,
    },
    textContainer: {
      alignItems: "flex-start",
      marginBottom: 190,
    },
    title: {
      fontSize: 38,
      lineHeight: 52,
      fontFamily: "BebasNeue-Regular",
      fontWeight: "700",
      color: isDarkMode ? "white" : "black",
      textAlign: "left",
    },
    lastLine: {
      flexDirection: "row",
      alignItems: "center",
    },
    button: {
      backgroundColor: isDarkMode ? "#D1EF53" : "#CB3033",
      paddingHorizontal: 30,
      borderRadius: 36,
      marginLeft: 15,
      height: 45,
      justifyContent: "center",
    },
  });
};

export default createStyles;
