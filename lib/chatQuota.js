import AsyncStorage from '@react-native-async-storage/async-storage';

// Daily chat budget (capstone: enforced in-app; a proxy would enforce
// server-side, but client-side is enough for a demo and never crashes).
export const CHAT_DAILY_LIMIT = 10;

const keyFor = (uid) => `seebu:chatquota:${uid || 'guest'}`;
const today = () => new Date().toISOString().slice(0, 10);

const read = async (uid) => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(uid));
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.date === today()) return parsed.count || 0;
  } catch {}
  return 0;
};

export const remainingToday = async (uid) =>
  Math.max(0, CHAT_DAILY_LIMIT - (await read(uid)));

// Returns true if a message may be sent (and consumes one).
export const consumeOne = async (uid) => {
  const used = await read(uid);
  if (used >= CHAT_DAILY_LIMIT) return false;
  try {
    await AsyncStorage.setItem(keyFor(uid), JSON.stringify({ date: today(), count: used + 1 }));
  } catch {}
  return true;
};
