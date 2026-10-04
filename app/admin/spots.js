import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSpots } from '../../utils/useSpots';
import { saveSpotEdit, removeSpotDoc, hideSpot, restoreSpot } from '../../utils/adminSpots';
import SpotForm from '../../components/SpotForm';
import AdminScreen from '../../components/AdminScreen';
import { Feather } from '@expo/vector-icons';

const confirmDestructive = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onOk();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onOk },
    ]);
  }
};

const badgeFor = (spot) => {
  if (spot._custom) return 'Custom';
  if (spot._docId) return 'Override';
  return 'Built-in';
};

export default function AdminSpots() {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const { spots, syncing, refresh, hidden } = useSpots();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const matchesQuery = (s) =>
    `${s.title ?? ''} ${s.loc ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());

  const showingHidden = filter === 'Hidden';
  const filtered = useMemo(() => {
    const list = spots.filter((s) => {
      if (filter === 'Built-in' && !s.builtin) return false;
      if (filter === 'Custom' && !s._custom) return false;
      return true;
    });
    if (!query.trim()) return list;
    return list.filter(matchesQuery);
  }, [spots, query, filter]);

  const hiddenFiltered = useMemo(() => {
    if (!query.trim()) return hidden;
    return hidden.filter(matchesQuery);
  }, [hidden, query]);

  // DATA-02: seed the pin fields from the spot so a wrong pin is fixable.
  const openEdit = (item) => {
    setEditing(item);
    setEditLat(item.coords?.latitude != null ? String(item.coords.latitude) : '');
    setEditLng(item.coords?.longitude != null ? String(item.coords.longitude) : '');
  };

  const handleSave = async (formData) => {
    if (!editing) return;
    // Both empty = keep the current pin. Otherwise both must be strictly
    // numeric (parseFloat alone accepts "12abc") and in range; the coords
    // key is omitted entirely when unchanged so merge never sees undefined.
    const latOk = /^-?\d+(\.\d+)?$/.test(editLat.trim());
    const lngOk = /^-?\d+(\.\d+)?$/.test(editLng.trim());
    const lat = latOk ? parseFloat(editLat) : NaN;
    const lng = lngOk ? parseFloat(editLng) : NaN;
    let coords;
    if (!editLat.trim() && !editLng.trim()) {
      coords = undefined;
    } else if (
      latOk && lngOk &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    ) {
      coords = { latitude: lat, longitude: lng };
    } else {
      setError('Pin needs a latitude (-90 to 90) and longitude (-180 to 180), or leave both empty to keep the current pin.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await saveSpotEdit(editing, {
        ...formData,
        spotId: editing.spotId ?? editing.id,
        ...(coords ? { coords } : {}),
      });
      setEditing(null);
      refresh();
    } catch (e) {
      setError(e.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  // GUIDE-02: warn when guides point here so deletes/hides don't orphan
  // them silently. Number() both sides — console-typed string ids count too.
  const handleDelete = async (spot) => {
    const sid = Number(spot.spotId ?? spot.id);
    // A failed guide lookup must not read as "no guides" — stop and show
    // the error instead of orphaning guides silently.
    let gsnap = null;
    try {
      gsnap = await getDocs(collection(db, 'guides'));
    } catch (e) {
      setError(`Couldn't check attached guides (${e?.message || 'read failed'}). Delete blocked — try again.`);
      return;
    }
    const guideCount = gsnap.docs.filter((d) => Number(d.data()?.spotId) === sid).length;
    const base = spot._custom
      ? `${spot.title} will be permanently removed.`
      : `${spot.title} will be hidden from users. You can restore it later.`;
    const warn =
      guideCount > 0
        ? ` ${guideCount} guide${guideCount === 1 ? '' : 's'} still point${guideCount === 1 ? 's' : ''} here — reassign or delete ${guideCount === 1 ? 'it' : 'them'} in Guides first, or ${guideCount === 1 ? 'it' : 'they'} will show an empty spot.`
        : '';
    confirmDestructive(
      spot._custom ? 'Delete spot?' : 'Hide spot?',
      base + warn,
      async () => {
        setError('');
        try {
          if (spot._custom) {
            await removeSpotDoc(spot);
          } else {
            await hideSpot(spot);
          }
          refresh();
        } catch (e) {
          setError(e.message || 'Delete failed.');
        }
      }
    );
  };

  const handleRestore = (h) =>
    confirmDestructive('Restore spot?', 'Users will see it again.', async () => {
      setError('');
      try {
        await restoreSpot(h);
        refresh();
      } catch (e) {
        setError(e.message || 'Restore failed.');
      }
    });

  const renderRow = ({ item }) => {
    const badge = badgeFor(item);
    return (
      <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.rowMain}>
          <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
          {!!item.loc && <Text style={[styles.loc, { color: colors.subText }]}>{item.loc}</Text>}
          <View style={styles.badgeRow}>
            <Text style={[styles.badge, { color: colors.subText, borderColor: colors.border }]}>
              {badge}
            </Text>
            {item.rating != null && (
              <Text style={[styles.rating, { color: colors.subText }]}>
                {'★'} {item.rating}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => openEdit(item)}
            style={[styles.iconBtn, { backgroundColor: full.muted }]}
            accessibilityLabel={`Edit ${item.title}`}
          >
            <Feather name="edit-2" size={16} color={colors.text} />
          </TouchableOpacity>
          {item._custom ? (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={[styles.iconBtn, { backgroundColor: full.destructive }]}
              accessibilityLabel={`Delete ${item.title}`}
            >
              <Feather name="trash-2" size={16} color={full.primaryForeground} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={[styles.iconBtn, { backgroundColor: full.muted }]}
              accessibilityLabel={`Hide ${item.title} from users`}
            >
              <Feather name="trash-2" size={16} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHiddenRow = (h) => (
    <View
      key={h._docId}
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.rowMain}>
        <Text style={[styles.name, { color: colors.text }]}>
          {h.title || `Spot ${h.spotId}`}
        </Text>
        <Text style={[styles.badge, { color: colors.subText, borderColor: colors.border }]}>
          Hidden
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRestore(h)}
        style={[styles.iconBtn, { backgroundColor: full.muted }]}
        accessibilityLabel="Restore spot"
      >
        <Feather name="eye" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <AdminScreen title="Spots">
      <View style={styles.inner}>
      <TextInput
        style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        placeholder="Search spots…"
        placeholderTextColor={colors.subText}
        value={query}
        onChangeText={setQuery}
      />
      {!!error && <Text style={[styles.error, { color: full.destructive }]}>{error}</Text>}
      <View style={styles.chips}>
        {['All', 'Built-in', 'Custom', 'Hidden'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f ? colors.accent : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === f ? full.accentForeground : colors.subText },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {syncing ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.center} />
      ) : showingHidden ? (
        hiddenFiltered.length === 0 ? (
          <Text style={[styles.center, { color: colors.subText }]}>Nothing hidden.</Text>
        ) : (
          <FlatList
            data={hiddenFiltered}
            keyExtractor={(h) => h._docId}
            renderItem={({ item }) => renderHiddenRow(item)}
            contentContainerStyle={styles.list}
          />
        )
      ) : filtered.length === 0 ? (
        <Text style={[styles.center, { color: colors.subText }]}>No spots found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.spotId ?? s.id)}
          renderItem={renderRow}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            !syncing && filter === 'All' && hiddenFiltered.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>
                  Hidden from users
                </Text>
                {hiddenFiltered.map(renderHiddenRow)}
              </>
            ) : null
          }
        />
      )}
      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit {editing?.title}
            </Text>
            <Text style={[styles.coordHint, { color: colors.subText }]}>
              Map pin — edit both fields to move it, or leave both empty to keep the current pin.
            </Text>
            <View style={styles.coordRow}>
              <TextInput
                style={[styles.coordInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Latitude"
                placeholderTextColor={colors.subText}
                value={editLat}
                onChangeText={setEditLat}
                keyboardType="numeric"
                editable={!busy}
              />
              <TextInput
                style={[styles.coordInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Longitude"
                placeholderTextColor={colors.subText}
                value={editLng}
                onChangeText={setEditLng}
                keyboardType="numeric"
                editable={!busy}
              />
            </View>
            {editing && (
              <SpotForm
                key={editing._docId ?? editing.spotId ?? editing.id}
                initial={editing}
                onSubmit={handleSave}
                submitLabel="Save"
                busy={busy}
              />
            )}
            <TouchableOpacity
              onPress={() => setEditing(null)}
              style={[styles.closeBtn, { backgroundColor: full.muted }]}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      </View>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 12 },
  chips: { flexDirection: 'row', marginBottom: 12 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  error: { fontSize: 13, marginBottom: 8 },
  center: { marginTop: 40, textAlign: 'center' },
  list: { paddingBottom: 40 },
  row: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  rowMain: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  loc: { fontSize: 13, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  rating: { fontSize: 12 },
  actions: { flexDirection: 'row' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  btnText: { fontWeight: '700', fontSize: 13 },
  modal: { flex: 1 },
  modalBody: { padding: 16, paddingBottom: 40 },
  coordHint: { fontSize: 12, marginBottom: 8 },
  coordRow: { flexDirection: 'row', marginBottom: 12 },
  coordInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, marginRight: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  closeBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
});
