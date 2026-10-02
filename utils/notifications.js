import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteField } from 'firebase/firestore';

// Show incoming notifications while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true, // legacy fallback
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'SeeBu Notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#f7f200',
  });
};

// Persist the preference on the user's own Firestore document (setDoc + merge
// mirrors ProfileVIew so registrants without a document still work).
const savePreference = async (values) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await setDoc(doc(db, 'users', uid), values, { merge: true });
  } catch (error) {
    console.warn('Could not persist notification preference:', error?.message);
  }
};

/**
 * Turn notifications on: Android channel, OS permission prompt, capture the
 * Expo push token (stored on the user doc so a backend can target the device),
 * persist the preference, and fire a local confirmation so the user can see
 * the pipeline working immediately.
 */
export const enableNotifications = async () => {
  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return { ok: false, reason: 'permission-denied' };
  }

  let token = null;
  try {
    const response = await Notifications.getExpoPushTokenAsync();
    token = response?.data || null;
  } catch (error) {
    // Expected until an EAS project (app.json extra.eas.projectId) exists.
    console.warn('Expo push token unavailable:', error?.message);
  }

  await savePreference({ notificationsEnabled: true, ...(token ? { expoPushToken: token } : {}) });

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notifications enabled',
        body: 'SeeBu will let you know about travel updates and tips for your trips.',
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.warn('Local confirmation notification failed:', error?.message);
  }

  return { ok: true, token };
};

/**
 * Turn notifications off: cancel anything scheduled and remove the stored
 * push token so the device is no longer targeted.
 */
export const disableNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Could not cancel scheduled notifications:', error?.message);
  }
  await savePreference({ notificationsEnabled: false, expoPushToken: deleteField() });
  return { ok: true };
};
