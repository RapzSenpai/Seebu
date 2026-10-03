import { Platform } from 'react-native';
// expo-router 6.0.24 does not re-export the navigation theme, so these come
// from @react-navigation/native (defined in @react-navigation/core).
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// SeeBu palette: sky-blue primary, smoky-white background, soft-violet accent.
// Kept in sync with the CSS custom properties in global.css.
// Light text on primary/accent passes WCAG AA. Dark theme is deep
// blue-slate (not pure black) with retuned lighter accents.
const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(242, 245, 247)',
    grey5: 'rgb(217, 226, 234)',
    grey4: 'rgb(227, 234, 240)',
    grey3: 'rgb(91, 122, 153)',
    grey2: 'rgb(90, 110, 130)',
    grey: 'rgb(90, 110, 130)',
    background: 'rgb(242, 245, 247)',
    foreground: 'rgb(14, 27, 44)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(14, 27, 44)',
    popover: 'rgb(255, 255, 255)',
    popoverForeground: 'rgb(14, 27, 44)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(3, 105, 161)',
    primaryForeground: 'rgb(255, 255, 255)',
    secondary: 'rgb(91, 122, 153)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(227, 234, 240)',
    mutedForeground: 'rgb(90, 110, 130)',
    accent: 'rgb(109, 91, 208)',
    accentForeground: 'rgb(255, 255, 255)',
    border: 'rgb(217, 226, 234)',
    input: 'rgb(217, 226, 234)',
    ring: 'rgb(3, 105, 161)',
  },
  dark: {
    grey6: 'rgb(28, 28, 33)',
    grey5: 'rgb(38, 38, 44)',
    grey4: 'rgb(19, 19, 22)',
    grey3: 'rgb(142, 142, 150)',
    grey2: 'rgb(163, 163, 173)',
    grey: 'rgb(163, 163, 173)',
    background: 'rgb(8, 8, 10)',
    foreground: 'rgb(245, 245, 244)',
    root: 'rgb(8, 8, 10)',
    card: 'rgb(19, 19, 22)',
    cardForeground: 'rgb(245, 245, 244)',
    popover: 'rgb(19, 19, 22)',
    popoverForeground: 'rgb(245, 245, 244)',
    destructive: 'rgb(255, 107, 94)',
    primary: 'rgb(56, 189, 248)',
    primaryForeground: 'rgb(6, 41, 61)',
    secondary: 'rgb(142, 142, 150)',
    secondaryForeground: 'rgb(8, 8, 10)',
    muted: 'rgb(28, 28, 33)',
    mutedForeground: 'rgb(163, 163, 173)',
    accent: 'rgb(169, 155, 255)',
    accentForeground: 'rgb(30, 27, 75)',
    border: 'rgb(38, 38, 44)',
    input: 'rgb(38, 38, 44)',
    ring: 'rgb(56, 189, 248)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(242, 245, 247)',
    grey5: 'rgb(217, 226, 234)',
    grey4: 'rgb(227, 234, 240)',
    grey3: 'rgb(91, 122, 153)',
    grey2: 'rgb(90, 110, 130)',
    grey: 'rgb(90, 110, 130)',
    background: 'rgb(242, 245, 247)',
    foreground: 'rgb(14, 27, 44)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(14, 27, 44)',
    popover: 'rgb(255, 255, 255)',
    popoverForeground: 'rgb(14, 27, 44)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(3, 105, 161)',
    primaryForeground: 'rgb(255, 255, 255)',
    secondary: 'rgb(91, 122, 153)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(227, 234, 240)',
    mutedForeground: 'rgb(90, 110, 130)',
    accent: 'rgb(109, 91, 208)',
    accentForeground: 'rgb(255, 255, 255)',
    border: 'rgb(217, 226, 234)',
    input: 'rgb(217, 226, 234)',
    ring: 'rgb(3, 105, 161)',
  },
  dark: {
    grey6: 'rgb(28, 28, 33)',
    grey5: 'rgb(38, 38, 44)',
    grey4: 'rgb(19, 19, 22)',
    grey3: 'rgb(142, 142, 150)',
    grey2: 'rgb(163, 163, 173)',
    grey: 'rgb(102, 102, 102)',
    background: 'rgb(8, 8, 10)',
    foreground: 'rgb(245, 245, 244)',
    root: 'rgb(8, 8, 10)',
    card: 'rgb(19, 19, 22)',
    cardForeground: 'rgb(245, 245, 244)',
    popover: 'rgb(19, 19, 22)',
    popoverForeground: 'rgb(245, 245, 244)',
    destructive: 'rgb(255, 107, 94)',
    primary: 'rgb(56, 189, 248)',
    primaryForeground: 'rgb(6, 41, 61)',
    secondary: 'rgb(142, 142, 150)',
    secondaryForeground: 'rgb(8, 8, 10)',
    muted: 'rgb(28, 28, 33)',
    mutedForeground: 'rgb(163, 163, 173)',
    accent: 'rgb(169, 155, 255)',
    accentForeground: 'rgb(30, 27, 75)',
    border: 'rgb(38, 38, 44)',
    input: 'rgb(38, 38, 44)',
    ring: 'rgb(56, 189, 248)',
  },
} as const;

const COLORS = Platform.OS === 'ios' ? IOS_SYSTEM_COLORS : ANDROID_COLORS;

// Corner radii. Driven by the --radius custom property so the same scale is
// available to JS and to the Tailwind utilities in tailwind.config.js.
const RADIUS = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  full: '9999px',
} as const;

const NAV_THEME = {
  light: {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      background: COLORS.light.background,
      border: COLORS.light.grey5,
      card: COLORS.light.card,
      notification: COLORS.light.destructive,
      primary: COLORS.light.primary,
      text: COLORS.black,
    },
  },
  dark: {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
  },
};

export { COLORS, NAV_THEME, RADIUS };
export type NavTheme = typeof NAV_THEME;
export type Colors = typeof COLORS;
