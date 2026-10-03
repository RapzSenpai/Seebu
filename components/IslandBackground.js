import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../ThemeContext';

// ponytail: single reusable island visual. Swap assets/island.jpg in one
// place to change it app-wide. Photo stays clear (0.12 wash, was 0.82 milk),
// then a smooth gradient crash zone overlaps the photo's bottom third so the
// image melts into the background — no crop line, no stepped bands.
// pointerEvents none so it never blocks touches.
const withAlpha = (rgb, a) => {
  const m = String(rgb).match(/[\d.]+/g) || [];
  const [r = 242, g = 245, b = 247] = m.map(Number);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const IslandBackground = () => {
  const { colors } = useTheme();
  const bg = colors.background;

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.photoZone}>
        <Image
          source={require('../assets/island.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
        {/* faint seat for content, not a fog — photo stays readable */}
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: bg, opacity: 0.12 }]}
        />
      </View>
      {/* Seamless multi-stop fade: photo extends deep, gradient reaches 100% solid before photo ends */}
      <LinearGradient
        colors={[
          withAlpha(bg, 0),
          withAlpha(bg, 0.05),
          withAlpha(bg, 0.18),
          withAlpha(bg, 0.42),
          withAlpha(bg, 0.70),
          withAlpha(bg, 0.90),
          bg,
          bg,
        ]}
        locations={[0, 0.18, 0.35, 0.52, 0.70, 0.86, 0.96, 1]}
        style={styles.blend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  photoZone: {
    width: '100%',
    height: '52%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blend: {
    position: 'absolute',
    top: '18%',
    width: '100%',
    height: '36%',
  },
});

export default IslandBackground;
