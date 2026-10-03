import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, Alert, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import {
  isCloudinaryConfigured,
  pickImageAsync,
  uploadImageAsync,
} from '../utils/cloudinary';

// Multi-photo version of AdminImagePicker: value is string[], uploads go to
// Cloudinary unsigned presets (no secret in client). First photo is NOT the
// cover — the main photo picker above owns that; these feed spot.photos[],
// which SpotGallery swipes through after the cover.
const AdminPhotoPicker = ({ label, value, onChange, folder, max = 6 }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const list = Array.isArray(value) ? value : [];

  const fail = (message) => {
    setError(message);
    if (Platform.OS === 'web') window.alert(message);
    else Alert.alert('Photos', message);
  };

  const handleAdd = async () => {
    if (busy || list.length >= max) return;
    if (!isCloudinaryConfigured()) {
      fail(
        'Photo uploads are not set up yet. Add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env, then restart the app.'
      );
      return;
    }
    setError('');
    setBusy(true);
    try {
      const uri = await pickImageAsync();
      if (!uri) return;
      const url = await uploadImageAsync(uri, folder);
      onChange([...list, url]);
    } catch (e) {
      fail(e.message || 'Could not upload photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.subText }]}>
        {label} ({list.length}/{max})
      </Text>
      {list.length > 0 && (
        <View style={styles.grid}>
          {list.map((uri) => (
            <View
              key={uri}
              style={[styles.thumb, { borderColor: colors.border }]}
            >
              <Image source={{ uri }} style={styles.thumbImg} />
              <TouchableOpacity
                onPress={() => onChange(list.filter((u) => u !== uri))}
                style={[styles.remove, { backgroundColor: colors.card }]}
                accessibilityLabel="Remove photo"
              >
                <Feather name="x" size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {list.length < max && (
        <TouchableOpacity
          onPress={handleAdd}
          disabled={busy}
          style={[styles.add, { backgroundColor: full.muted }]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Feather name="plus" size={16} color={colors.text} />
              <Text style={[styles.addText, { color: colors.text }]}>Add photo</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      {!!error && <Text style={[styles.status, { color: full.destructive }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  thumb: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  thumbImg: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute', top: 4, right: 4, width: 24, height: 24,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  add: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
  },
  addText: { fontWeight: '700', fontSize: 14 },
  status: { fontSize: 12, marginTop: 6 },
});

export default AdminPhotoPicker;
