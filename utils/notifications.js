import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { auth, db } from '../firebase';
import { doc, setDoc, deleteField } from 'firebase/firestore';

// Remote push was removed from Expo Go in SDK 53 (dev-build only). Local
// notifications still work in Expo Go. This module lazy-loads
// expo-notifications so merely opening Settings does not spam the Expo Go
// push warning, and skips the push-token step entirely when running in Go.
const isExpoGo = Constants.appOwnership === 'expo';

let Notifications = null;
let handlerSet = false;

const loadNotifications = () => {
  if (!Notifications) {
    // The library logs an Expo Go push warning at import time. Mute console
    // for exactly that import; real errors are still surfaced by our code.
    const warn = console.warn;
    const error = console.error;
    console.warn = () => {};
    console.error = () => {};
    try {
      Notifications = require('expo-notifications');
    } finally {
      console.warn = warn;
      console.error = error;
    }
  }
  if (!handlerSet) {
    handlerSet = true;
    // Show incoming notifications while the app is in the foreground.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return Notifications;
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
 * Turn notifications on: Android channel, OS permission prompt, persist the
 * preference, and fire a local confirmation so the user can see the pipeline
 * working immediately. In Expo Go the Expo push token step is skipped
 * (remote push needs a dev build); local notifications still work.
 */
export const enableNotifications = async () => {
  const N = loadNotifications();
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'SeeBu Notifications',
      importance: N.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0369A1',
    });
  }

  const current = await N.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await N.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return { ok: false, reason: 'permission-denied' };
  }

  let token = null;
  if (!isExpoGo) {
    try {
      const response = await N.getExpoPushTokenAsync();
      token = response?.data || null;
    } catch (error) {
      // Expected until an EAS project (app.json extra.eas.projectId) exists.
      console.warn('Expo push token unavailable:', error?.message);
    }
  }

  await savePreference({ notificationsEnabled: true, ...(token ? { expoPushToken: token } : {}) });

  try {
    await N.scheduleNotificationAsync({
      content: {
        title: 'Notifications enabled',
        body: isExpoGo
          ? 'Local reminders are on. Remote push needs a dev build.'
          : 'SeeBu will let you know about travel updates and tips for your trips.',
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.warn('Local confirmation notification failed:', error?.message);
  }

  return { ok: true, token, localOnly: isExpoGo };
};

/**
 * Turn notifications off: cancel anything scheduled and remove the stored
 * push token so the device is no longer targeted.
 */
export const disableNotifications = async () => {
  const N = loadNotifications();
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Could not cancel scheduled notifications:', error?.message);
  }
  await savePreference({ notificationsEnabled: false, expoPushToken: deleteField() });
  return { ok: true };
};
