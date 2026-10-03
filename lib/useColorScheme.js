import { useMemo } from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

import { COLORS } from './theme';
import { useAccentName, accentOverride } from './accent';

function useColorScheme() {
  const { colorScheme: preference, setColorScheme } = useNativewindColorScheme();
  const accentName = useAccentName();

  // Light is the default. The OS scheme is intentionally ignored so a fresh
  // install always opens light; an explicit per-account choice overrides.
  const colorScheme = preference ?? 'light';

  function toggleColorScheme() {
    return setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
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