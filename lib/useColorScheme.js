import { useMemo, useSyncExternalStore } from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

import { COLORS } from './theme';
import { useAccentName, accentOverride } from './accent';

// Explicit scheme: the app's authoritative JS theme state. NativeWind's
// observable tracks the OS and can be overwritten with the system value by
// foreground resyncs (e.g. returning from the notification permission
// dialog) — with no change event to repair it, because re-selecting the
// already-active native override is a no-op. The explicit choice always
// wins; the OS value only seeds first paint before init runs.
let explicit = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const getExplicit = () => explicit;
const subscribeExplicit = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setExplicitScheme = (scheme) => {
  const value = scheme === 'dark' ? 'dark' : 'light';
  if (value === explicit) return;
  explicit = value;
  emit();
};

function useColorScheme() {
  const {
    colorScheme: preference,
    setColorScheme: setNativeScheme,
  } = useNativewindColorScheme();
  const accentName = useAccentName();
  const explicitScheme = useSyncExternalStore(subscribeExplicit, getExplicit);

  // Light is the default. The OS scheme is intentionally ignored so a fresh
  // install always opens light; an explicit per-account choice overrides.
  // Explicit (login/init/user toggle) beats the OS-tracked preference, so a
  // system resync can never repaint the UI behind the user's choice.
  const colorScheme = explicitScheme ?? preference ?? 'light';

  function setColorScheme(scheme) {
    setExplicitScheme(scheme);
    setNativeScheme(scheme === 'dark' ? 'dark' : 'light');
  }

  function toggleColorScheme() {
    const next = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
  }

  // Accent override is memoized so the colors identity stays stable and
  // downstream useMemo consumers don't recompute every render.
  // The override covers primary too: ThemeContext maps colors.accent from
  // primary, which is where most highlights actually render from.
  const colors = useMemo(() => {
    const base = COLORS[colorScheme];
    const over = accentOverride(colorScheme, accentName);
    if (!over) return base;
    return {
      ...base,
      primary: over.accent,
      primaryForeground: over.accentForeground,
      accent: over.accent,
      accentForeground: over.accentForeground,
      ring: over.ring,
    };
  }, [colorScheme, accentName]);

  return {
    colorScheme,
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors,
  };
}

export { useColorScheme };