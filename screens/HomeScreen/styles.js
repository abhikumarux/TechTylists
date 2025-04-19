import { StyleSheet } from "react-native";

const createStyles = (colorScheme) => {
  const isDarkMode = colorScheme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      paddingTop: 10,
      backgroundColor: isDarkMode ? "#121212" : "#fff",
    },
    topContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      paddingTop: 85,
      backgroundColor: isDarkMode ? "#121212" : "#fff",
    },
    selectItemsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginVertical: 15,
      paddingHorizontal: 10,
    },

    selectItemsText: {
      fontSize: 24,
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: "600",
      color: isDarkMode ? "#BCBCBC" : "black",
    },
    addItemButton: {
      width: 35,
      height: 35,
      borderColor: isDarkMode ? "#BCBCBC" : "black",
      borderWidth: 2,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    addItemButtonText: {
      fontSize: 28,
      color: isDarkMode ? "#BCBCBC" : "black",
      fontWeight: "bold",
    },

    profileImage: {
      width: 150,
      height: 150,
      marginBottom: 20,
    },
    promptContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    promptText: {
      fontSize: 16,
      marginBottom: 30,
      color: isDarkMode ? "#fff" : "#000",
    },
    clothingCategory: {
      marginRight: 20,
      alignItems: "center",
      maxHeight: 300,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    itemImage: {
      width: 100,
      height: 100,
      marginRight: 10,
      borderRadius: 10,
      borderWidth: 2,
    },
    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
      backgroundColor: "#fff",
      padding: 25,
      borderRadius: 15,
      width: "80%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#333",
    },
    outfitTitle: {
      color: isDarkMode ? "white" : "#fff",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 15,
      marginBottom: 10,
      color: "#333",
      alignSelf: "flex-start",
    },
    dropdownButton: {
      width: "100%",
      padding: 12,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      backgroundColor: "#f9f9f9",
      marginBottom: 15,
    },
    dropdownButtonText: {
      fontSize: 16,
      color: "#333",
    },
    dropdownMenu: {
      width: "80%",
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      backgroundColor: "white",
    },
    dropdownOptionText: {
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 12,
      color: "#333",
    },
    dropdownOptionTextHighlight: {
      color: "red",
      fontWeight: "600",
    },
    closeButton: {
      marginTop: 10,
      padding: 12,
      backgroundColor: "red",
      borderRadius: 8,
      width: "100%",
      alignItems: "center",
    },
    closeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    picker: {
      height: 50,
      width: 150,
      marginBottom: 80,
      color: "black",
      backgroundColor: "blue",
    },
    pickerItem: {
      color: "black",
    },
    profileImage1: {
      width: "100%",
      height: 300,
      resizeMode: "contain",
      borderRadius: 10,
    },
    generatedContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    profileImage1: {
      width: 200,
      height: 300,
      resizeMode: "contain",
      marginBottom: 10,
      borderRadius: 10,
    },
    categoryButton: (isSelected) => ({
      padding: 10,
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor: isSelected
        ? colorScheme === "dark"
          ? "#D1EF53"
          : "#CB3033"
        : colorScheme === "dark"
        ? "transparent"
        : "transparent",
      borderWidth: 2,
      borderColor: isSelected
        ? colorScheme === "dark"
          ? "#D1EF53"
          : "#CB3033"
        : colorScheme === "dark"
        ? "#d9d9d9"
        : "black",
    }),
    categoryButtonText: (isSelected) => ({
      color: isSelected
        ? colorScheme === "dark"
          ? "black"
          : "white"
        : colorScheme === "dark"
        ? "#d9d9d9"
        : "black",
      fontWeight: "bold",
    }),
  });
};
export default createStyles;
