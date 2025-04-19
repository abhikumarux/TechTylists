import { StyleSheet } from "react-native";

const createStyles = (colorScheme) => {
  const isDarkMode = colorScheme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      padding: 20,
      paddingTop: 100,
      backgroundColor: isDarkMode ? "#121212" : "white",
    },
    logo: {
      width: 75,
      height: 75,
      resizeMode: "contain",
      marginBottom: 20,
    },
    welcomeText: {
      alignSelf: "stretch",
      fontSize: 30,
      lineHeight: 32,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      textAlign: "center",
      marginBottom: 10,
    },
    welcomeLabel: {
      alignSelf: "stretch",
      fontSize: 14,
      lineHeight: 24,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: isDarkMode ? "white" : "#464646",
      textAlign: "center",
      marginBottom: 60,
    },
    email: {
      height: 56,
      borderRadius: 12,
      width: "100%",
      borderColor: isDarkMode ? "#F5F7FE" : "black",
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: isDarkMode ? "white" : "black",
    },
    password: {
      height: 56,
      borderRadius: 12,
      width: "100%",
      borderColor: isDarkMode ? "#F5F7FE" : "black",
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: isDarkMode ? "white" : "black",
    },
    rememberMeContainer: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      marginBottom: 15,
    },
    rememberMeText: {
      fontSize: 14,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: isDarkMode ? "#F5F7FE" : "black",
      marginLeft: 8,
    },
    forgotPassword: {
      fontSize: 14,
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      fontWeight: "700",
      marginLeft: 95,
    },
    error: {
      color: "red",
      marginTop: 10,
    },
    logInButtonText: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
      color: isDarkMode ? "white" : "white",
      textAlign: "center",
    },
    logInButton: {
      borderRadius: 12,
      backgroundColor: isDarkMode ? "#202226" : "black",
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
      paddingVertical: 15,
      marginTop: 15,
    },
    orText: {
      fontSize: 14,
      color: isDarkMode ? "#F5F7FE" : "black",
      marginVertical: 15,
      marginTop: 20,
      marginBottom: 20,
    },
    socialButtonGoogle: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#DB4437" : "#DB4437",
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 10,
      width: "100%",
      justifyContent: "center",
      marginBottom: 12,
    },
    socialButtonApple: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "white" : "black",
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 10,
      width: "100%",
      justifyContent: "center",
      marginBottom: 10,
    },
    socialButtonTextGoogle: {
      color: isDarkMode ? "white" : "white",
      fontSize: 16,
      marginLeft: 10,
      fontWeight: "600",
    },
    socialButtonTextApple: {
      color: isDarkMode ? "black" : "white",
      fontSize: 16,
      marginLeft: 10,
      fontWeight: "600",
    },
    signUpContainer: {
      flexDirection: "row",
      marginTop: 15,
    },
    dontHaveAccountText: {
      color: isDarkMode ? "#F5F7FE" : "black",
      fontSize: 14,
    },
    signUpText: {
      color: isDarkMode ? "#D1EF53" : "#CB3033",
      fontSize: 14,
      fontWeight: "700",
    },
    rememberColor: isDarkMode ? "#F5F7FE" : "black",
    rememberedColor: isDarkMode ? "#F5F7FE" : "red",
  });
};

export default createStyles;
