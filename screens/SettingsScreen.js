import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Switch,
  Alert,
  Platform,
  StatusBar,
  Pressable
} from 'react-native';
import { auth, signOut } from '../firebase'; 
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import BottomSheetModal from '../components/BottomSheetModal';
import { cebuSpots } from '../utils/spots';
import { enableNotifications, disableNotifications } from '../utils/notifications';

const SettingsScreen = () => {
  const { isDarkMode, setIsDarkMode, colors } = useTheme();
  const { isAdmin, profile } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state change in App.js switches to the login stack automatically.
    } catch (error) {
      console.error("Logout Error:", error.message);
    } finally {
      setModalVisible(false);
    }
  };

  // The stored preference on the user's Firestore document is the source of
  // truth, so the toggle survives restarts instead of living in local state.
  useEffect(() => {
    setNotificationsEnabled(profile?.notificationsEnabled === true);
  }, [profile?.notificationsEnabled]);

  const handleToggleNotifications = async (value) => {
    if (notificationsBusy) return;
    setNotificationsBusy(true);
    try {
      if (value) {
        const result = await enableNotifications();
        if (result.ok) {
          setNotificationsEnabled(true);
        } else {
          Alert.alert(
            'Notifications blocked',
            'Allow notifications for SeeBu in your device settings, then try again.'
          );
          setNotificationsEnabled(false);
        }
      } else {
        await disableNotifications();
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Notification preference error:', error?.message);
      Alert.alert('Notifications', 'Could not update notification settings. Please try again.');
      setNotificationsEnabled(profile?.notificationsEnabled === true);
    } finally {
      setNotificationsBusy(false);
    }
  };

  // Helper component for settings rows
  const SettingsItem = ({ icon, title, onPress, rightElement, color }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: colors.card }]} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (color || colors.text) + '15' }]}>
          <Feather name={icon} size={18} color={color || colors.text} />
        </View>
        <Text style={[styles.itemText, { color: color || colors.text }]}>{title}</Text>
      </View>
      {rightElement ? rightElement : <Feather name="chevron-right" size={18} color={colors.subText} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{profile?.displayName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Traveller'}</Text>
            <Text style={[styles.userEmail, { color: colors.subText }]}>{auth.currentUser?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0' }]} onPress={() => router.push('/profile')}>
             <Feather name="edit-3" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Stats Section — real values: shared spot catalog + interests on this user's document */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{cebuSpots.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Destinations</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder, { borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{profile?.interests?.length || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Interests</Text>
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: colors.accent }]}>Preferences</Text>
        <SettingsItem 
          icon="moon" 
          title="Dark Mode" 
          rightElement={
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor="#fff"
            />
          }
        />
        <SettingsItem 
          icon="bell" 
          title="Push Notifications" 
          rightElement={
            <Switch 
              value={notificationsEnabled} 
              onValueChange={handleToggleNotifications}
              disabled={notificationsBusy}
              trackColor={{ false: "#767577", true: colors.accent }}
              thumbColor="#fff"
            />
          }
        />

        <Text style={[styles.sectionHeader, { color: colors.accent }]}>Account</Text>
        {isAdmin && (
          <SettingsItem
            icon="shield"
            title="Admin Panel"
            color={colors.accent}
            onPress={() => router.push('/admin')}
          />
        )}
        <SettingsItem icon="user" title="Personal Information" onPress={() => router.push('/profile')} />
        <SettingsItem icon="shield" title="Security & Password" onPress={() => router.push('/profile')} />

        <Text style={[styles.sectionHeader, { color: colors.accent }]}>Support</Text>
        <SettingsItem icon="file-text" title="Terms & Privacy" onPress={() => router.push('/terms')} />
        
        {/* Logout */}
        <View style={{ marginTop: 20 }}>
          <SettingsItem 
            icon="log-out" 
            title="Logout" 
            color="#ff4444" 
            onPress={() => setModalVisible(true)} 
          />
        </View>

        <Text style={[styles.versionText, { color: colors.subText }]}>SeeBu v1.0.4 Premium</Text>
      </ScrollView>

      {/* Logout Confirmation Bottom Sheet */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Wait, leaving so soon?"
        snapPoints={['50%']}
        initialSnap={0}
      >
        <Text style={[styles.modalSubTitle, { color: colors.subText }]}>Are you sure you want to log out of SeeBu?</Text>
        
        <View style={styles.modalButtons}>
          <Pressable 
            style={[styles.modalButton, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0' }]} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
          </Pressable>

          <Pressable 
            style={[styles.modalButton, { backgroundColor: colors.accent }]} 
            onPress={handleLogout}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Yes, Logout</Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 50 },
  profileCard: { 
    flexDirection: 'row', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    marginBottom: 15,
    marginTop: Platform.OS === 'android' ? 50 : 20,
    borderWidth: 1,
  },
  avatar: { width: 60, height: 60, backgroundColor: '#f7f200', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '900', fontSize: 24, color: '#000' },
  profileInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: '800' },
  userEmail: { fontSize: 13, marginTop: 2 },
  editBtn: { padding: 8, borderRadius: 10 },
  
  statsContainer: { flexDirection: 'row', borderRadius: 20, padding: 15, marginBottom: 25 },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },

  sectionHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 10, marginLeft: 5 },
  
  item: { padding: 15, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemText: { fontSize: 16, fontWeight: '600' },
  
  versionText: { textAlign: 'center', marginTop: 30, fontSize: 12, fontWeight: '600' },

  modalSubTitle: { fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 22, color: '#666' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalButton: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center' }
});

export default SettingsScreen;