import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';

// Firebase Config
import { auth, db, signOut, updateEmail, updatePassword, updateProfile } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Theme State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "••••••••", 
    profileImg: "",
  });
  const [originalUserData, setOriginalUserData] = useState(userData);

  // Dynamic Theme Colors
  const theme = {
    background: isDarkMode ? "#080808" : "#F5F5F5",
    card: isDarkMode ? "#121212" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    subtext: isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)",
    border: isDarkMode ? "#1e1e1e" : "#E0E0E0",
    accent: "#f7f200", // Your signature yellow
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      let profileData = {
        name: user.displayName || "",
        email: user.email || "",
        profileImg: "",
        password: "••••••••",
      };

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        profileData = {
          name: data.displayName || profileData.name,
          email: data.email || profileData.email,
          profileImg: data.profileImg || profileData.profileImg,
          password: "••••••••",
        };
      }

      setUserData(profileData);
      setOriginalUserData(profileData);
    } catch (error) {
      if (error?.code === 'permission-denied' || error?.message?.toLowerCase().includes('permission')) {
        console.warn("Profile fetch permission denied; using auth profile fallback.");
        const user = auth.currentUser;
        if (user) {
          setUserData({
            name: user.displayName || "",
            email: user.email || "",
            profileImg: "",
            password: "••••••••",
          });
        }
      } else {
        console.error("Error fetching profile:", error);
      }
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUserData({ ...userData, profileImg: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const normalizedEmail = userData.email.trim().toLowerCase();
    try {
      const userRef = doc(db, "users", user.uid);
      try {
        // setDoc with merge, not updateDoc: web registrants never get a document
        // written at registration, and updateDoc fails on a missing document.
        await setDoc(
          userRef,
          {
            displayName: userData.name,
            profileImg: userData.profileImg,
            email: normalizedEmail,
          },
          { merge: true }
        );
      } catch (dbError) {
        if (dbError?.code === 'permission-denied' || dbError?.message?.toLowerCase().includes('permission')) {
          console.warn('Firestore update blocked; continuing with auth profile update.');
        } else {
          throw dbError;
        }
      }

      if (normalizedEmail !== user.email.toLowerCase()) {
        await updateEmail(user, normalizedEmail);
      }

      if (userData.password !== "••••••••" && userData.password.length >= 6) {
        await updatePassword(user, userData.password);
      }

      await updateProfile(user, {
        displayName: userData.name,
        photoURL: userData.profileImg,
      });

      const savedData = {
        ...userData,
        email: normalizedEmail,
        password: "••••••••",
      };
      setUserData(savedData);
      setOriginalUserData(savedData);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Security Timeout", "Please log out and log back in to change sensitive info.");
      } else {
        Alert.alert("Update Failed", error.message || "Unable to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setOriginalUserData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setUserData(originalUserData);
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out?')
      : await new Promise((resolve) => {
          Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Logout', onPress: () => resolve(true) },
          ]);
        });

    if (!confirmed) {
      return;
    }

    try {
      await signOut(auth);
      // Auth state change in App.js switches to the login stack automatically.
    } catch (error) {
      console.error('Logout Error:', error.message);
      Alert.alert('Logout Failed', error.message || 'Unable to log out.');
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingBottom: isEditing ? 200 : 60 } 
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : null)} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text, marginLeft: 8 }]}>My Profile</Text>
            {/* Theme Toggle Button */}
            <TouchableOpacity 
              onPress={() => setIsDarkMode(!isDarkMode)} 
              style={{ marginLeft: 15 }}
            >
              <Feather name={isDarkMode ? "sun" : "moon"} size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

            <TouchableOpacity 
              onPress={isEditing ? handleSave : handleEdit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.accent} size="small" />
              ) : (
                <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
              )}
            </TouchableOpacity>
          </View>
          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} disabled={loading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              {userData.profileImg ? (
                <Image source={{ uri: userData.profileImg }} style={[styles.profileImage, { borderColor: theme.accent }]} />
              ) : (
                <View style={[styles.profileImage, styles.avatarFallback, { borderColor: theme.accent, backgroundColor: theme.card }]}>
                  <Text style={[styles.avatarInitial, { color: theme.accent }]}>
                    {(userData.name || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={[styles.cameraIcon, { backgroundColor: theme.accent, borderColor: theme.background }]} onPress={pickImage}>
                  <Feather name="camera" size={18} color="#000" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>{userData.name || "Traveller"}</Text>
            <Text style={[styles.userJoined, { color: theme.subtext }]}>Cebu Adventurer</Text>
          </View>

          <View style={styles.form}>
            {/* NAME */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>FULL NAME</Text>
              <View style={[
                styles.inputWrapper, 
                { backgroundColor: theme.card, borderColor: theme.border },
                isEditing && { borderColor: theme.accent }
              ]}>
                <Feather name="user" size={18} color={theme.accent} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={userData.name}
                  editable={isEditing}
                  onChangeText={(text) => setUserData({ ...userData, name: text })}
                  placeholderTextColor={isDarkMode ? "#444" : "#999"}
                />
              </View>
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>EMAIL ADDRESS</Text>
              <View style={[
                styles.inputWrapper, 
                { backgroundColor: theme.card, borderColor: theme.border },
                isEditing && { borderColor: theme.accent }
              ]}>
                <Feather name="mail" size={18} color={theme.accent} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={userData.email}
                  editable={isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => setUserData({ ...userData, email: text })}
                  placeholderTextColor={isDarkMode ? "#444" : "#999"}
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>PASSWORD</Text>
              <View style={[
                styles.inputWrapper, 
                { backgroundColor: theme.card, borderColor: theme.border },
                isEditing && { borderColor: theme.accent }
              ]}>
                <Feather name="lock" size={18} color={theme.accent} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={userData.password}
                  editable={isEditing}
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => setUserData({ ...userData, password: text })}
                  placeholderTextColor={isDarkMode ? "#444" : "#999"}
                />
                {isEditing && (
                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                     <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={isDarkMode ? "#aaa" : "#666"} />
                   </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {!isEditing && (
            <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.accent }]} onPress={handleLogout}>
              <Feather name="log-out" size={18} color="#000" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginVertical: 20 
  },
  headerTitle: { fontSize: 24, fontWeight: "900" },
  editBtnText: { color: "#f7f200", fontSize: 16, fontWeight: "700" },
  
  imageSection: { alignItems: "center", marginBottom: 30 },
  imageWrapper: { position: "relative" },
  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 3, 
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 48, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: "800", marginTop: 15 },
  userJoined: { fontSize: 12, marginTop: 4 },

  form: { marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 8, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
  },
  input: { flex: 1, marginLeft: 15, fontSize: 16 },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
  },
  editActions: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#353535',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: "row",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  logoutText: { color: "#000", fontWeight: "900", fontSize: 16, marginLeft: 10 }
});

export default ProfileScreen;