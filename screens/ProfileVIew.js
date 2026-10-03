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
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import IslandBackground from '../components/IslandBackground';

// Firebase Config
import { auth, db, updateEmail, updatePassword, updateProfile } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadImageAsync, isCloudinaryConfigured } from "../utils/cloudinary";
import { useUser } from "../UserContext";

// ponytail: same 6 options as RegisterScreen. Source of truth lives there;
// this list must stay in sync with it.
const INTEREST_OPTIONS = ["Beaches", "Food", "History", "Nightlife", "Mountains", "Shopping"];

const ProfileScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { colors: full } = useColorScheme();
  const { refresh: refreshProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "••••••••",
    profileImg: "",
    interests: [],
  });
  const [originalUserData, setOriginalUserData] = useState(userData);

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
        interests: [],
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
          interests: Array.isArray(data.interests) ? data.interests : [],
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
            interests: [],
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
      // Local phone URIs die with the device — upload to Cloudinary first so
      // the photo URL survives reinstalls and other devices.
      let photoURL = userData.profileImg;
      if (photoURL && !photoURL.startsWith("http")) {
        if (!isCloudinaryConfigured()) {
          throw new Error("Photo upload not configured. Ask the admin to set Cloudinary.");
        }
        photoURL = await uploadImageAsync(photoURL, "seebu/profiles");
      }
      const userRef = doc(db, "users", user.uid);
      let dbOk = true;
      try {
        // setDoc with merge, not updateDoc: web registrants never get a document
        // written at registration, and updateDoc fails on a missing document.
        await setDoc(
          userRef,
          {
            displayName: userData.name,
            profileImg: photoURL,
            email: normalizedEmail,
            interests: userData.interests || [],
          },
          { merge: true }
        );
      } catch (dbError) {
        if (dbError?.code === 'permission-denied' || dbError?.message?.toLowerCase().includes('permission')) {
          console.warn('Firestore update blocked; interests not persisted.');
          dbOk = false;
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
        photoURL: photoURL,
      });

      const savedData = {
        ...userData,
        profileImg: photoURL,
        email: normalizedEmail,
        password: "••••••••",
        // ponytail: never display interests as saved when the doc write failed.
        interests: dbOk ? (userData.interests || []) : (originalUserData.interests || []),
      };
      setUserData(savedData);
      setOriginalUserData(savedData);
      setIsEditing(false);
      refreshProfile?.();
      Alert.alert(
        "Success",
        dbOk ? "Profile updated successfully!" : "Signed-in profile updated, but interests did not save (offline?)."
      );
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

  // Pencil: viewing → enter edit mode; editing → change photo.
  const handleAvatarPress = () => {
    if (isEditing) {
      pickImage();
    } else {
      handleEdit();
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const fields = [
    { key: 'name', label: 'Name', icon: 'user', keyboard: 'default', secure: false },
    { key: 'email', label: 'Email', icon: 'mail', keyboard: 'email-address', secure: false },
    { key: 'password', label: 'Password', icon: 'lock', keyboard: 'default', secure: !showPassword },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <IslandBackground />
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >

          <View style={styles.header}>
            <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : null)} style={[styles.backButton, { backgroundColor: full.muted }]}>
              <Feather name="chevron-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              {userData.profileImg ? (
                <Image source={{ uri: userData.profileImg }} style={[styles.profileImage, { borderColor: colors.accent }]} />
              ) : (
                <View style={[styles.profileImage, styles.avatarFallback, { borderColor: colors.accent, backgroundColor: colors.card }]}>
                  <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                    {(userData.name || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={[styles.pencilBadge, { backgroundColor: colors.accent, borderColor: colors.background }]} onPress={handleAvatarPress}>
                <Feather name="edit-2" size={15} color={full.accentForeground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{userData.name || "Traveller"}</Text>
            <Text style={[styles.userEmail, { color: colors.subText }]}>{userData.email}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Account Information</Text>
          {fields.map((f, i) => (
            <View key={f.key}>
              {isEditing ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subText }]}>{f.label.toUpperCase()}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.accent }]}>
                    <Feather name={f.icon} size={18} color={colors.accent} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={userData[f.key]}
                      editable
                      keyboardType={f.keyboard}
                      autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                      secureTextEntry={f.secure}
                      onChangeText={(text) => setUserData({ ...userData, [f.key]: text })}
                      placeholderTextColor={colors.subText}
                    />
                    {f.key === 'password' && (
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={colors.subText} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <View style={[styles.infoRow, i < fields.length - 1 && styles.infoDivider, { borderColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.subText }]}>{f.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    {f.key === 'password' ? '••••••••' : (userData[f.key] || '—')}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {isEditing && (
            <View style={styles.interestBlock}>
              <Text style={[styles.label, { color: colors.subText }]}>TRAVEL INTERESTS</Text>
              <View style={styles.interestRow}>
                {INTEREST_OPTIONS.map((opt) => {
                  const on = (userData.interests || []).includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() =>
                        setUserData({
                          ...userData,
                          interests: on
                            ? userData.interests.filter((i) => i !== opt)
                            : [...(userData.interests || []), opt],
                        })
                      }
                      style={[
                        styles.interestChip,
                        { borderColor: colors.border, backgroundColor: colors.card },
                        on && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                    >
                      <Text
                        style={[
                          styles.interestText,
                          { color: colors.subText },
                          on && { color: full.accentForeground },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: colors.accent }, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={full.accentForeground} />
                ) : (
                  <Text style={[styles.mainBtnText, { color: full.accentForeground }]}>Save Changes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel} disabled={loading} style={styles.cancelLink}>
                <Text style={[styles.cancelLinkText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.accent }]} onPress={handleEdit}>
              <Text style={[styles.mainBtnText, { color: full.accentForeground }]}>Edit</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  loadingContainer: { justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20
  },
  headerTitle: { fontSize: 24, fontWeight: "900" },

  imageSection: { alignItems: "center", marginBottom: 26 },
  imageWrapper: { position: "relative" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  pencilBadge: {
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
  userEmail: { fontSize: 13, marginTop: 4 },

  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  infoRow: { paddingVertical: 13 },
  infoDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  infoValue: { fontSize: 16, fontWeight: '600' },

  inputGroup: { marginBottom: 16, marginTop: 8 },
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
  interestBlock: { marginTop: 4, marginBottom: 8 },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  interestChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  interestText: { fontWeight: '600', fontSize: 13 },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24
  },
  mainBtnText: { fontWeight: "800", fontSize: 16 },
  cancelLink: { alignItems: 'center', paddingVertical: 14 },
  cancelLinkText: { fontWeight: '700', fontSize: 15 }
});

export default ProfileScreen;
