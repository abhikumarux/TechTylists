import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  useColorScheme,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { app } from "./FireBaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { FeTile } from "react-native-svg";

const auth = getAuth(app);
const db = getFirestore(app);

const API_URL = "http://18.225.195.136:5000";

const UserScreen = ({ userEmail }) => {
  const [currentUsername, setCurrentUsername] = useState(null);
  const [friendUsername, setFriendUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [postCaption, setPostCaption] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [selectedTab, setSelectedTab] = useState("explore");
  const [myProfilePosts, setMyProfilePosts] = useState([]);
  const [myProfilePostsCaptions, setMyProfilePostsCaptions] = useState([]);
  const [allOutfits, setAllOutfits] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [expandedUsers, setExpandedUsers] = useState({});
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const styles = createStyles(colorScheme);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const username = userEmail;
        if (username) {
          setCurrentUsername(username);
          fetchFriends(username);
          fetchFriendRequests(username);
        }
      }
    });
    return unsubscribe;
  }, []);

  const fetchFriends = async (username) => {
    const friendsRef = collection(db, "users", username, "friendships");
    const q = query(friendsRef, where("status", "==", "accepted"));
    const snapshot = await getDocs(q);
    const friendList = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((friend) => friend.id !== username);
    console.log("ADSOPIFJASOIDJ: ", friendList);
    setFriends(friendList);
    return friendList;
  };

  const fetchFriendRequests = async (username) => {
    const requestsRef = collection(db, "users", username, "friendships");
    const q = query(
      requestsRef,
      where("status", "==", "pending"),
      where("initiator", "==", false)
    );
    const snapshot = await getDocs(q);
    setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const sendFriendRequest = async () => {
    if (!friendUsername || !currentUsername) {
      Alert.alert("Error", "Please enter a valid username.");
      return;
    }

    try {
      const friendRef = doc(db, "users", friendUsername);
      const friendDoc = await getDoc(friendRef);

      if (!friendDoc.exists()) {
        Alert.alert("User not found!");
        return;
      }

      const userFriendRef = doc(
        db,
        "users",
        currentUsername,
        "friendships",
        friendUsername
      );
      const friendFriendRef = doc(
        db,
        "users",
        friendUsername,
        "friendships",
        currentUsername
      );

      await setDoc(userFriendRef, {
        status: "pending",
        initiator: true,
        createdAt: new Date(),
      });

      await setDoc(friendFriendRef, {
        status: "pending",
        initiator: false,
        createdAt: new Date(),
      });

      Alert.alert("Friend request sent!");
      fetchFriendRequests(currentUsername);
    } catch (error) {
      console.error(error);
      Alert.alert("Something went wrong.");
    }
  };

  const acceptFriendRequest = async (friendUsername) => {
    try {
      const userFriendRef = doc(
        db,
        "users",
        currentUsername,
        "friendships",
        friendUsername
      );
      const friendFriendRef = doc(
        db,
        "users",
        friendUsername,
        "friendships",
        currentUsername
      );

      await setDoc(userFriendRef, { status: "accepted" }, { merge: true });
      await setDoc(friendFriendRef, { status: "accepted" }, { merge: true });

      Alert.alert("Friend request accepted!");
      fetchFriends(currentUsername);
      fetchFriendRequests(currentUsername);
    } catch (error) {
      console.error(error);
      Alert.alert("Error accepting friend request.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      setPostImage(result.assets[0].uri);
    }
  };

  const fetchUserData = async (email) => {
    try {
      console.log("Fetching user data for email:", email);

      if (!email) {
        throw new Error("Email is null or undefined");
      }

      const userRef = doc(db, "users", email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data found:", userData);
        return userData;
      } else {
        console.log("No user data found for email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const createPost = async () => {
    if (!postCaption) {
      Alert.alert("Error", "Please add a caption.");
      return;
    }
    if (!postImage) {
      Alert.alert("Error", "Please add an image.");
      return;
    }
    const userData = await fetchUserData(userEmail);
    if (!userData) {
      throw new Error("User data not found");
    }

    const postsRef = collection(db, "users", userEmail, "posts");
    const postsSnapshot = await getDocs(postsRef);
    var maxPostID = 1;
    var nextPostID = 1;
    if (!postsSnapshot.empty) {
      const postIDs = postsSnapshot.docs.map((doc) => parseInt(doc.id, 10));
      maxPostID = Math.max(...postIDs);
      nextPostID = maxPostID + 1;
    }

    const awsPhotoKey = userData.awsPhotoKey || "";
    const PostID = nextPostID;
    const formData = new FormData();
    const imageUri = postImage;
    const filename = imageUri.split("/").pop();
    const fileExtension = filename.split(".").pop();
    const mimeType = `image/${fileExtension}`;

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });
    formData.append("user_id", currentUsername);
    formData.append("caption", postCaption);
    formData.append("awsPhotoKey", awsPhotoKey);
    formData.append("PostID", PostID);
    try {
      const response = await axios.post(`${API_URL}/createPost`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message === "Post created successfully") {
        Alert.alert("Success", "Post created successfully!");
        const newPostRef = doc(postsRef, nextPostID.toString());
        await setDoc(newPostRef, { caption: postCaption });
        setPostImage(null);
        setPostCaption("");
      } else {
        Alert.alert("Error", "Something went wrong while creating your post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An error occurred while creating the post.");
    }
  };

  const fetchAllPosts = async () => {
    const userData = await fetchUserData(userEmail);
    if (!userData) {
      throw new Error("User data not found");
    }
    const awsPhotoKey = userData.awsPhotoKey || "";

    const postsRef = collection(db, "users", userEmail, "posts");
    const postsSnapshot = await getDocs(postsRef);
    var postIDs;

    if (!postsSnapshot.empty) {
      postIDs = postsSnapshot.docs.map((doc) => parseInt(doc.id, 10));
    }

    const postCount = postIDs.length;
    const formData = new FormData();
    formData.append("postCount", postCount);
    formData.append("awsPhotoKey", awsPhotoKey);

    try {
      const response = await axios.get(`${API_URL}/fetchAllPostsForUser`, {
        params: {
          awsPhotoKey: awsPhotoKey,
          postCount: postCount,
        },
      });

      if (response.data.posts) {
        const postsRef = collection(db, "users", userEmail, "posts");
        const postsSnapshot = await getDocs(postsRef);

        if (!postsSnapshot.empty) {
          const posts = postsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              caption: data.caption,
            };
          });
          const captions = posts.map((post) =>
            post.caption ? post.caption : ""
          );
          setMyProfilePostsCaptions(captions);
        } else {
          console.log("No posts found for this user.");
        }
        setMyProfilePosts(response.data.posts);
        console.log(response.data.posts.length);
      } else {
        Alert.alert("Error", "Something went wrong while creating your post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An error occurred while creating the post.");
    }
  };

  const fetchOutfits = async () => {
    setFriends([]);
    setOutfits([]);
    const fetchedFriends = await fetchFriends(userEmail);
    console.log("RETURNED: ", fetchedFriends); // await it and get the result

    const friendEmails = fetchedFriends
      .filter((friend) => friend.id !== userEmail) // optional safety
      .map((friend) => friend.id);

    const allEmails = [...friendEmails];
    const allOutfits = [];
    console.log("trying: ", allEmails);
    for (const email of allEmails) {
      try {
        const userData = await fetchUserData(email);

        if (!userData) {
          console.error(`User data not found for: ${email.id}`);
          continue;
        }

        const awsPhotoKey = userData.awsPhotoKey;
        console.log(`Fetching outfits for ${email} (AWS key: ${awsPhotoKey})`);

        const response = await axios.get(`${API_URL}/getOutfits`, {
          params: { user_id: awsPhotoKey },
        });

        const outfitsForThisUser = response.data.outfits.map((outfit) => ({
          ...outfit,
          userEmail: email,
        }));

        allOutfits.push(...outfitsForThisUser);
      } catch (err) {
        console.error(`Failed to fetch outfits for ${email}:`, err);
      }
    }

    setOutfits(allOutfits);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Button title="Explore" onPress={() => setSelectedTab("explore")} />
        <Button title="Friends" onPress={() => setSelectedTab("friends")} />
        <Button title="Profile" onPress={() => setSelectedTab("profile")} />
      </View>

      {selectedTab === "explore" && (
        <View>
          <Button title="Load Friends Images" onPress={fetchOutfits} />
          <Text style={styles.header}>Explore</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {outfits.length === 0 ? (
              <Text style={styles.subHeader}>No outfits to explore yet.</Text>
            ) : (
              outfits.map((outfit, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 32,
                    padding: 16,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                    {outfit.userEmail}'s Outfit
                  </Text>
                  <Image
                    source={{ uri: outfit.full }}
                    style={{
                      width: "100%",
                      height: undefined,
                      aspectRatio: 1,
                      borderRadius: 12,
                      resizeMode: "contain",
                      marginBottom: 8,
                    }}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {outfit.items.map((itemUrl, i) => (
                      <Image
                        key={i}
                        source={{ uri: itemUrl }}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 8,
                          marginRight: 8,
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {selectedTab === "friends" && (
        <View>
          <Text style={styles.header}>Friends</Text>

          <Text style={styles.header}>Add Friend</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter friend's username"
            value={friendUsername}
            onChangeText={setFriendUsername}
          />
          <Button title="Send Friend Request" onPress={sendFriendRequest} />

          <Text style={styles.header}>Friend Requests</Text>
          {requests.length > 0 ? (
            requests.map((r) => (
              <View key={r.id} style={styles.friendItem}>
                <Text>{r.id} sent you a request</Text>
                <Button
                  title="Accept"
                  onPress={() => acceptFriendRequest(r.id)}
                />
              </View>
            ))
          ) : (
            <Text>No new requests</Text>
          )}

          <Text style={styles.header}>Friends</Text>
          {friends.length > 0 ? (
            friends.map((f) => (
              <Text key={f.id} style={styles.friendItem}>
                👤 {f.id}
              </Text>
            ))
          ) : (
            <Text>No friends yet</Text>
          )}
        </View>
      )}

      {selectedTab === "profile" && (
        <View>
          <Text style={styles.header}>Create Post</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a caption"
            value={postCaption}
            onChangeText={setPostCaption}
          />
          <Button title="Pick an Image" onPress={pickImage} />
          {postImage && (
            <Image source={{ uri: postImage }} style={styles.imagePreview} />
          )}
          <Button title="Post" onPress={createPost} />

          <Text style={styles.header}>My Posts</Text>
          {myProfilePosts.length > 0 ? (
            myProfilePosts.map((post, index) => (
              <View key={index} style={styles.postItem}>
                <Text>{myProfilePostsCaptions[index]}</Text>
                <Image source={{ uri: post }} style={styles.imagePreview} />
              </View>
            ))
          ) : (
            <Text>No posts yet</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colorScheme) => {
  const isDark = colorScheme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      marginTop: 50,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#444" : "#ccc",
      paddingBottom: 10,
    },
    header: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 20,
      color: isDark ? "#fff" : "#000",
    },
    subHeader: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 20,
      color: isDark ? "#fff" : "#000",
    },
    input: {
      borderWidth: 1,
      padding: 10,
      marginBottom: 10,
      borderColor: isDark ? "#888" : "#ccc",
      borderRadius: 5,
      color: isDark ? "#fff" : "#000",
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
    },
    friendItem: {
      marginVertical: 5,
      color: isDark ? "#fff" : "#000",
    },
    imagePreview: {
      width: 100,
      height: 100,
      resizeMode: "cover",
      marginVertical: 10,
      borderRadius: 8,
    },
    postItem: {
      marginBottom: 15,
    },
  });
};

export default UserScreen;
