import { Platform } from 'react-native';
// expo-router 6.0.24 does not re-export the navigation theme, so these come
// from @react-navigation/native (defined in @react-navigation/core).
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// SeeBu palette. Kept in sync with the CSS custom properties in global.css.
const IOS_SYSTEM_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(245, 245, 245)',
    grey5: 'rgb(224, 224, 224)',
    grey4: 'rgb(210, 210, 210)',
    grey3: 'rgb(199, 199, 199)',
    grey2: 'rgb(136, 136, 136)',
    grey: 'rgb(136, 136, 136)',
    background: 'rgb(245, 245, 245)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(0, 0, 0)',
    popover: 'rgb(255, 255, 255)',
    popoverForeground: 'rgb(0, 0, 0)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(247, 242, 0)',
    primaryForeground: 'rgb(8, 8, 8)',
    secondary: 'rgb(136, 136, 136)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(224, 224, 224)',
    mutedForeground: 'rgb(136, 136, 136)',
    accent: 'rgb(247, 242, 0)',
    accentForeground: 'rgb(8, 8, 8)',
    border: 'rgb(224, 224, 224)',
    input: 'rgb(224, 224, 224)',
    ring: 'rgb(247, 242, 0)',
  },
  dark: {
    grey6: 'rgb(26, 26, 26)',
    grey5: 'rgb(26, 26, 26)',
    grey4: 'rgb(17, 17, 17)',
    grey3: 'rgb(102, 102, 102)',
    grey2: 'rgb(136, 136, 136)',
    grey: 'rgb(102, 102, 102)',
    background: 'rgb(8, 8, 8)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(0, 0, 0)',
    card: 'rgb(17, 17, 17)',
    cardForeground: 'rgb(255, 255, 255)',
    popover: 'rgb(17, 17, 17)',
    popoverForeground: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(247, 242, 0)',
    primaryForeground: 'rgb(8, 8, 8)',
    secondary: 'rgb(102, 102, 102)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(26, 26, 26)',
    mutedForeground: 'rgb(102, 102, 102)',
    accent: 'rgb(247, 242, 0)',
    accentForeground: 'rgb(8, 8, 8)',
    border: 'rgb(26, 26, 26)',
    input: 'rgb(26, 26, 26)',
    ring: 'rgb(247, 242, 0)',
  },
} as const;

const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(245, 245, 245)',
    grey5: 'rgb(224, 224, 224)',
    grey4: 'rgb(210, 210, 210)',
    grey3: 'rgb(199, 199, 199)',
    grey2: 'rgb(136, 136, 136)',
    grey: 'rgb(136, 136, 136)',
    background: 'rgb(245, 245, 245)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(0, 0, 0)',
    popover: 'rgb(255, 255, 255)',
    popoverForeground: 'rgb(0, 0, 0)',
    destructive: 'rgb(186, 26, 26)',
    primary: 'rgb(247, 242, 0)',
    primaryForeground: 'rgb(8, 8, 8)',
    secondary: 'rgb(136, 136, 136)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(224, 224, 224)',
    mutedForeground: 'rgb(136, 136, 136)',
    accent: 'rgb(247, 242, 0)',
    accentForeground: 'rgb(8, 8, 8)',
    border: 'rgb(224, 224, 224)',
    input: 'rgb(224, 224, 224)',
    ring: 'rgb(247, 242, 0)',
  },
  dark: {
    grey6: 'rgb(26, 26, 26)',
    grey5: 'rgb(26, 26, 26)',
    grey4: 'rgb(17, 17, 17)',
    grey3: 'rgb(102, 102, 102)',
    grey2: 'rgb(136, 136, 136)',
    grey: 'rgb(102, 102, 102)',
    background: 'rgb(8, 8, 8)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(0, 0, 0)',
    card: 'rgb(17, 17, 17)',
    cardForeground: 'rgb(255, 255, 255)',
    popover: 'rgb(17, 17, 17)',
    popoverForeground: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(247, 242, 0)',
    primaryForeground: 'rgb(8, 8, 8)',
    secondary: 'rgb(102, 102, 102)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(26, 26, 26)',
    mutedForeground: 'rgb(102, 102, 102)',
    accent: 'rgb(247, 242, 0)',
    accentForeground: 'rgb(8, 8, 8)',
    border: 'rgb(26, 26, 26)',
    input: 'rgb(26, 26, 26)',
    ring: 'rgb(247, 242, 0)',
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