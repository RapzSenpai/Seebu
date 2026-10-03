import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import {
  isCloudinaryConfigured,
  pickImageAsync,
  uploadImageAsync,
} from '../utils/cloudinary';

// One-tap photo flow: Choose a Photo -> upload -> URL. No URL typing.
// Reused by Add Spot (photos), Guides (photoUrl), and anywhere admin-side.
const AdminImagePicker = ({ label, value, onChange, folder }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fail = (message) => {
    setError(message);
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Photo', message);
    }
  };

  const handleChoose = async () => {
    if (busy) return;
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
      onChange(url);
    } catch (e) {
      fail(e.message || 'Could not upload photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
      {value ? (
        <View
          style={[
            styles.preview,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Image source={{ uri: value }} style={styles.previewImg} />
          <View style={styles.previewRow}>
            <TouchableOpacity
              onPress={handleChoose}
              disabled={busy}
              style={[styles.halfBtn, { backgroundColor: full.muted }]}
            >
              <Text style={[styles.halfText, { color: colors.text }]}>
                Change
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChange('')}
              disabled={busy}
              style={[styles.halfBtn, { backgroundColor: full.muted }]}
            >
              <Text style={[styles.halfText, { color: colors.text }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleChoose}
          disabled={busy}
          style={[styles.choose, { backgroundColor: colors.accent }]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={full.accentForeground} />
          ) : (
            <>
              <Feather
                name="image"
                size={18}
                color={full.accentForeground}
              />
              <Text
                style={[styles.chooseText, { color: full.accentForeground }]}
              >
                Choose a Photo
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
      {busy && value ? (
        <Text style={[styles.status, { color: colors.subText }]}>
          Uploading…
        </Text>
      ) : null}
      {!!error && (
        <Text style={[styles.status, { color: full.destructive }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  choose: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  chooseText: { fontWeight: '800', fontSize: 15 },
  preview: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: 190 },
  previewRow: { flexDirection: 'row', gap: 8, padding: 8 },
  halfBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  halfText: { fontWeight: '700', fontSize: 14 },
  status: { fontSize: 12, marginTop: 6 },
});

export default AdminImagePicker;
