import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import { db } from '../../firebase';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { useSpots } from '../../utils/useSpots';
import AdminImagePicker from '../../components/AdminImagePicker';
import AdminScreen from '../../components/AdminScreen';

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

const emptyForm = (spotId) => ({
  spotId,
  name: '',
  specialty: '',
  location: '',
  contact: '',
  photoUrl: '',
  verified: false,
  rating: '',
  reviews: '',
});

// Shared searchable spot picker. Filter row uses includeAll ("All spots");
// the guide form uses it without, as "Assigned Spot". One component, both
// dropdowns, same spots data.
const SpotSelect = ({ visible, onClose, spots, value, onSelect, includeAll, colors, full }) => {
  const [q, setQ] = useState('');
  const options = q.trim()
    ? spots.filter((s) => (s.title || '').toLowerCase().includes(q.trim().toLowerCase()))
    : spots;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.dropOverlay}>
        <View style={[styles.dropPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Search spots…"
            placeholderTextColor={colors.subText}
            value={q}
            onChangeText={setQ}
          />
          <FlatList
            data={includeAll ? [{ all: true }, ...options] : options}
            keyExtractor={(s) => (s.all ? 'all' : String(s.spotId ?? s.id))}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: s }) => {
              if (s.all) {
                const active = value == null;
                return (
                  <TouchableOpacity
                    onPress={() => { onSelect(null); onClose(); }}
                    style={[styles.dropRow, active && { backgroundColor: full.muted }]}
                  >
                    <Text style={[styles.dropText, { color: colors.text }]}>All spots</Text>
                    {active && <Feather name="check" size={16} color={colors.accent} />}
                  </TouchableOpacity>
                );
              }
              const sid = s.spotId ?? s.id;
              const active = value === sid;
              return (
                <TouchableOpacity
                  onPress={() => { onSelect(sid); onClose(); }}
                  style={[styles.dropRow, active && { backgroundColor: full.muted }]}
                >
                  <Text style={[styles.dropText, { color: colors.text }]} numberOfLines={1}>
                    {s.title}
                  </Text>
                  {active && <Feather name="check" size={16} color={colors.accent} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.dropEmpty, { color: colors.subText }]}>No spots match.</Text>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function AdminGuides() {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const { spots } = useSpots();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(null));
  const [busy, setBusy] = useState(false);
  const [spotDropOpen, setSpotDropOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'guides'));
      setGuides(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError(e.message || 'Could not load guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const spotName = (spotId) =>
    spots.find((s) => (s.spotId ?? s.id) === spotId)?.title ?? `Spot ${spotId}`;

  const filtered = useMemo(
    () => (filter == null ? guides : guides.filter((g) => g.spotId === filter)),
    [guides, filter]
  );

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(filter ?? spots[0]?.spotId ?? spots[0]?.id ?? null));
    setFormOpen(true);
  };

  const openEdit = (guide) => {
    setEditing(guide);
    setForm({
      spotId: guide.spotId ?? null,
      name: guide.name ?? '',
      specialty: guide.specialty ?? '',
      location: guide.location ?? '',
      contact: guide.contact ?? '',
      photoUrl: guide.photoUrl ?? '',
      verified: !!guide.verified,
      rating: guide.rating != null ? String(guide.rating) : '',
      reviews: guide.reviews != null ? String(guide.reviews) : '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Guide name is required.');
      return;
    }
    if (form.spotId == null) {
      setError('Pick a spot for this guide.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      spotId: form.spotId,
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      location: form.location.trim(),
      contact: form.contact.trim(),
      photoUrl: form.photoUrl,
      verified: !!form.verified,
      rating: form.rating === '' ? null : Number(form.rating),
      reviews: form.reviews === '' ? null : Number(form.reviews),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'guides', editing.id), payload);
      } else {
        await addDoc(collection(db, 'guides'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      setFormOpen(false);
      load();
    } catch (e) {
      setError(e.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (guide) =>
    confirmDestructive('Delete guide?', `${guide.name} will be removed.`, async () => {
      try {
        await deleteDoc(doc(db, 'guides', guide.id));
        load();
      } catch (e) {
        setError(e.message || 'Delete failed.');
      }
    });

  const renderRow = ({ item, index }) => (
    <View>
      <View style={styles.row}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: full.muted }]}>
            <Text style={[styles.avatarLetter, { color: colors.accent }]}>
              {(item.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.rowMain} onPress={() => openEdit(item)}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified && (
              <Feather name="check-circle" size={15} color={colors.accent} />
            )}
          </View>
          <Text style={[styles.sub, { color: colors.subText }]} numberOfLines={1}>
            {[item.specialty, spotName(item.spotId)].filter(Boolean).join(' • ')}
          </Text>
          {item.rating != null && (
            <Text style={[styles.rating, { color: colors.subText }]}>
              {'★'} {item.rating}
              {item.reviews != null ? ` (${item.reviews})` : ''}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openEdit(item)}
          style={[styles.iconBtn, { backgroundColor: full.muted }]}
          accessibilityLabel={`Edit ${item.name}`}
        >
          <Feather name="edit-2" size={15} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={[styles.iconBtn, { backgroundColor: full.muted }]}
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Feather name="trash-2" size={15} color={full.destructive} />
        </TouchableOpacity>
      </View>
      {index < filtered.length - 1 && (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      )}
    </View>
  );

  return (
    <AdminScreen title="Guides">
      <View style={styles.inner}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => setFilterDropOpen(true)}
          style={[styles.filterBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>
            {filter == null ? 'All spots' : spotName(filter)}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openAdd}
          style={[styles.addIconBtn, { backgroundColor: colors.accent }]}
          accessibilityLabel="Add guide"
        >
          <Feather name="plus" size={20} color={full.accentForeground} />
        </TouchableOpacity>
      </View>
      <SpotSelect
        visible={filterDropOpen}
        onClose={() => setFilterDropOpen(false)}
        spots={spots}
        value={filter}
        onSelect={setFilter}
        includeAll
        colors={colors}
        full={full}
      />
      {!!error && <Text style={[styles.error, { color: full.destructive }]}>{error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.center} />
      ) : filtered.length === 0 ? (
        <Text style={[styles.center, { color: colors.subText }]}>No guides yet.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          renderItem={renderRow}
          contentContainerStyle={styles.list}
        />
      )}
      <Modal visible={formOpen} animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editing ? `Edit ${editing.name}` : 'Add guide'}
            </Text>
            <Text style={[styles.label, { color: colors.subText }]}>Assigned Spot</Text>
            <TouchableOpacity
              onPress={() => setSpotDropOpen(true)}
              style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Text
                style={[styles.dropdownText, { color: form.spotId != null ? colors.text : colors.subText }]}
                numberOfLines={1}
              >
                {form.spotId != null ? spotName(form.spotId) : 'Select a spot'}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.subText} />
            </TouchableOpacity>
            <SpotSelect
              visible={spotDropOpen}
              onClose={() => setSpotDropOpen(false)}
              spots={spots}
              value={form.spotId}
              onSelect={(sid) => setForm((f) => ({ ...f, spotId: sid }))}
              colors={colors}
              full={full}
            />
            {[
              ['Name *', 'name'],
              ['Specialty', 'specialty'],
              ['Location', 'location'],
              ['Contact', 'contact'],
            ].map(([label, key]) => (
              <View key={key} style={styles.field}>
                <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                  placeholder={label}
                  placeholderTextColor={colors.subText}
                  value={form[key]}
                  onChangeText={set(key)}
                />
              </View>
            ))}
            <AdminImagePicker
              label="Photo"
              value={form.photoUrl}
              onChange={set('photoUrl')}
              folder="seebu/guides"
            />
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: colors.subText }]}>Verified</Text>
              <Switch value={form.verified} onValueChange={set('verified')} />
            </View>
            {[['Rating', 'rating'], ['Reviews', 'reviews']].map(([label, key]) => (
              <View key={key} style={styles.field}>
                <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                  placeholder={label}
                  placeholderTextColor={colors.subText}
                  value={form[key]}
                  onChangeText={set(key)}
                  keyboardType="numeric"
                />
              </View>
            ))}
            <TouchableOpacity
              onPress={handleSave}
              disabled={busy}
              style={[styles.addBtn, { backgroundColor: colors.accent }]}
            >
              {busy ? (
                <ActivityIndicator size="small" color={full.accentForeground} />
              ) : (
                <Text style={[styles.btnText, { color: full.accentForeground }]}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormOpen(false)}
              style={[styles.addBtn, { backgroundColor: full.muted }]}
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
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 6, alignItems: 'center' },
  filterBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  filterText: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  addIconBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, marginBottom: 12,
  },
  dropdownText: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  dropOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dropPanel: { borderWidth: 1, borderRadius: 16, padding: 12, maxHeight: '70%' },
  dropRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10 },
  dropText: { fontSize: 15, flex: 1 },
  dropEmpty: { fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  addBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { fontWeight: '800', fontSize: 14 },
  error: { fontSize: 13, marginBottom: 8 },
  center: { marginTop: 40, textAlign: 'center' },
  list: { paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 19, fontWeight: '900' },
  rowMain: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  sub: { fontSize: 13, marginTop: 2 },
  rating: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 58 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  modal: { flex: 1 },
  modalBody: { padding: 16, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
});
