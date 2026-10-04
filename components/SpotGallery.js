import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { cx } from '../utils/cloudinary';

const { width: SCREEN_W } = Dimensions.get('window');

// Swipeable hero: [img, ...photos]. Single photo renders exactly as before.
// dotsTop positions the page dots for shorter heroes (Explore sheet);
// the default keeps the full-page hero unchanged.
const SpotGallery = ({ img, photos, dotsTop = 100 }) => {
  const [index, setIndex] = useState(0);
  // Dedupe: older customs stored the cover inside photos[] too.
  const list = [...new Set([img, ...(Array.isArray(photos) ? photos : [])].filter(Boolean))];
  if (list.length === 0) return null;

  return (
    <View style={styles.fill}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / SCREEN_W));
        }}
      >
        {list.map((uri) => (
          <Image key={uri} source={{ uri: cx(uri, 1000) }} style={styles.img} />
        ))}
      </ScrollView>
      {list.length > 1 && (
        <View style={[styles.dots, { top: dotsTop }]}>
          {list.map((uri, i) => (
            <View
              key={uri + i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  img: { width: SCREEN_W, height: '100%' },
  dots: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
});

export default SpotGallery;
