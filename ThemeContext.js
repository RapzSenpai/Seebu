import { useMemo } from 'react';

import { useColorScheme } from './lib/useColorScheme';

// Deprecated shim. The single source of truth for color is now the CSS custom
// properties in global.css plus Nativewind's useColorScheme. This adapter only
// exists so the screens that still use StyleSheet.create keep working without a
// 100-site rename (colors.text -> colors.foreground, colors.subText ->
// colors.mutedForeground, ...). Delete once the screens move to className.
const ThemeProvider = ({ children }) => children;

const useTheme = () => {
  const { colorScheme, isDarkColorScheme, setColorScheme, colors } = useColorScheme();

  return useMemo(
    () => ({
      isDarkMode: isDarkColorScheme,
      setIsDarkMode: (value) => setColorScheme(value ? 'dark' : 'light'),
      colors: {
        background: colors.background,
        card: colors.card,
        text: colors.foreground,
        subText: colors.mutedForeground,
        accent: colors.primary,
        border: colors.border,
      },
      colorScheme,
    }),
    [colors, colorScheme, isDarkColorScheme, setColorScheme]
  );
};

export { ThemeProvider, useTheme };