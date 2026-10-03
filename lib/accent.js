import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Accent choices. The pick drives both the primary and accent roles —
// most screens render highlights from primary (via ThemeContext), accents
// from accent — so both must move or the app looks half-painted.
// Backgrounds, surfaces, and text stay on the Light/Dark tokens, so
// readability and contrast never depend on the picked color.
const ACCENTS = {
  default: { label: 'SeeBu Default', light: null, dark: null },
  pink: {
    label: 'Pink',
    light: { accent: '#DB2777', accentForeground: '#FFFFFF', ring: '#DB2777' },
    dark: { accent: '#F472B6', accentForeground: '#500724', ring: '#F472B6' },
  },
  orange: {
    label: 'Orange',
    light: { accent: '#EA580C', accentForeground: '#FFFFFF', ring: '#EA580C' },
    dark: { accent: '#FB923C', accentForeground: '#431407', ring: '#FB923C' },
  },
  green: {
    label: 'Green',
    light: { accent: '#15803D', accentForeground: '#FFFFFF', ring: '#15803D' },
    dark: { accent: '#4ADE80', accentForeground: '#052E16', ring: '#4ADE80' },
  },
  yellow: {
    label: 'Yellow',
    light: { accent: '#A16207', accentForeground: '#FFFFFF', ring: '#A16207' },
    dark: { accent: '#FACC15', accentForeground: '#422006', ring: '#FACC15' },
  },
  grey: {
    label: { light: 'Dark Grey', dark: 'Light Grey' },
    light: { accent: '#4B5563', accentForeground: '#FFFFFF', ring: '#4B5563' },
    dark: { accent: '#D1D5DB', accentForeground: '#111827', ring: '#D1D5DB' },
  },
};

const ORDER = ['default', 'pink', 'orange', 'green', 'yellow', 'grey'];

// Per-account keys: accent belongs to the user, never the device. Guest
// (logged out) always renders the default, nothing persisted.
const keyFor = (uid) => (uid ? `seebu:accent:${uid}` : null);

let current = 'default';
let currentUid = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const sanitize = (v) => (v && ACCENTS[v] ? v : null);

// Called on login/logout (see app/_layout). Switches the active account,
// resets to default immediately (no leak from the previous user), then
// loads their saved accent: fast per-uid cache first, Firestore second.
export const setAccentUid = (uid) => {
  currentUid = uid || null;
  current = 'default';
  emit();
  if (!currentUid) return;
  const key = keyFor(currentUid);
  AsyncStorage.getItem(key)
    .then((v) => {
      const local = sanitize(v);
      if (local && currentUid === uid) {
        current = local;
        emit();
      }
    })
    .catch(() => {});
  getDoc(doc(db, 'users', currentUid))
    .then((snap) => {
      const remote = sanitize(snap.exists() ? snap.data()?.accent : null);
      if (remote && currentUid === uid) {
        current = remote;
        emit();
        AsyncStorage.setItem(key, remote).catch(() => {});
      }
    })
    .catch(() => {});
};

export const useAccentName = () => useSyncExternalStore(subscribe, () => current);

export const setAccentName = (name) => {
  if (!ACCENTS[name] || name === current) return;
  current = name;
  emit();
  if (!currentUid) return;
  AsyncStorage.setItem(keyFor(currentUid), name).catch(() => {});
  // ponytail: mirror next to theme so the accent survives reinstalls and
  // follows the account to a new phone. Failure keeps local-only, no crash.
  setDoc(doc(db, 'users', currentUid), { accent: name }, { merge: true }).catch(() => {});
};

export const accentLabel = (name, scheme = 'dark') => {
  const label = ACCENTS[name]?.label ?? 'SeeBu Default';
  return typeof label === 'string' ? label : label[scheme] ?? label.dark;
};

// Null for default = keep the base theme tokens untouched.
export const accentOverride = (scheme, name) =>
  ACCENTS[name]?.[scheme] ?? null;

// Dot color for the swatch UI. Default shows the base violet per scheme.
export const accentDot = (scheme, name, fallback) => {
  const over = accentOverride(scheme, name);
  if (over) return over.accent;
  return fallback;
};

export const ACCENT_ORDER = ORDER;
