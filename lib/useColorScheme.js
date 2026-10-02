import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { COLORS } from './theme';

function useColorScheme() {
  const { colorScheme: preference, setColorScheme } = useNativewindColorScheme();
  const systemColorScheme = useSystemColorScheme();

  // nativewind reports null until a preference is set, so fall back to the
  // OS appearance. Without this the JS colors would disagree with the CSS
  // variables in global.css on first render.
  const colorScheme = preference ?? systemColorScheme ?? 'light';

  function toggleColorScheme() {
    return setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  }

  return {
    colorScheme,
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[colorScheme],
  };
}

export { useColorScheme };