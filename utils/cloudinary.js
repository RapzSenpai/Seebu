import * as ImagePicker from 'expo-image-picker';

// Cloudinary unsigned uploads — no API secret in the client, ever.
// Setup (once, Cloudinary Console > Settings > Upload):
//   1. Add upload preset, mode Unsigned (e.g. `seebu_spots`)
//   2. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME + _UPLOAD_PRESET in .env
// Until both are set the admin forms fall back to manual URL entry.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = () =>
  CLOUD_NAME.length > 0 && UPLOAD_PRESET.length > 0;

export const pickImageAsync = async () => {
  const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Photo permission denied.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
};

// Uploads a local file URI, resolves to the CDN secure_url.
export const uploadImageAsync = async (localUri, folder) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured. Set env vars first.');
  }
  const body = new FormData();
  body.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  body.append('upload_preset', UPLOAD_PRESET);
  if (folder) body.append('folder', folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || 'Image upload failed.');
  }
  return json.secure_url;
};
