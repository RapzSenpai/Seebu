import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import AdminScreen from '../../components/AdminScreen';
import SpotForm from '../../components/SpotForm';
import SpotPicker from '../../components/SpotPicker';
import { allocateSpotId, publishSpot } from '../../utils/adminSpots';
import { useSpots } from '../../utils/useSpots';

const alertMsg = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
  else Alert.alert(title, msg);
};

// Admin: search a place, pin it, fill the form, publish.
const AddSpot = () => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const { spots, syncing } = useSpots();

  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [dropOpen, setDropOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [coords, setCoords] = useState(null);
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [suggested, setSuggested] = useState(null);
  const [formKey, setFormKey] = useState(0);
  // LOC-01: pin focus has its own key now. The form no longer remounts on
  // pick — SpotForm fills empty title/loc/address from `suggested` instead,
  // so typed description/fees/photos survive a second search.
  const [pinKey, setPinKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const applyCoords = (c) => {
    setCoords(c);
    setLatText(String(c.latitude));
    setLngText(String(c.longitude));
  };

  const onLatLng = (which, value) => {
    if (which === 'lat') setLatText(value);
    else setLngText(value);
    const lat = which === 'lat' ? parseFloat(value) : parseFloat(latText);
    const lng = which === 'lng' ? parseFloat(value) : parseFloat(lngText);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCoords({ latitude: lat, longitude: lng });
    }
  };

  // Nominatim requires an identifying User-Agent (usage policy) — the old
  // bare fetch got HTTP 403, which surfaced as the generic "Search failed."
  // Browsers forbid overriding User-Agent so this header only takes effect
  // on native, where browsers' automatic Referer doesn't exist. Either way
  // the real status is now surfaced instead of masked.
  const fetchPlaces = async (query, signal) => {
    const params = new URLSearchParams({
      format: 'json',
      limit: '6',
      addressdetails: '1',
      countrycodes: 'ph',
      q: query,
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SeeBuAdmin/1.0 (capstone project; contact team@seebu-capstone.app)',
      },
    });
    if (res.status === 403) {
      throw new Error('Search blocked by the map service (403). Check connection and retry.');
    }
    if (res.status === 429) {
      throw new Error('Too many searches — wait a few seconds and try again.');
    }
    if (!res.ok) throw new Error(`Search failed (${res.status}). Try again.`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  };

  // Debounced autocomplete: fires 600ms after typing stops (Nominatim asks
  // max ~1 req/s), min 3 chars, in-flight request aborted on each keystroke.
  const onChangeQuery = (text) => {
    setQ(text);
    setSearchError('');
    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = text.trim();
    if (query.length < 3) {
      setResults([]);
      setDropOpen(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    setDropOpen(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        setResults(await fetchPlaces(query, ctrl.signal));
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setSearchError(e.message || 'Search failed. Try again.');
        setResults([]);
      } finally {
        if (abortRef.current === ctrl) {
          abortRef.current = null;
          setSearching(false);
        }
      }
    }, 600);
  };

  const pickResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      applyCoords({ latitude: lat, longitude: lng });
    }
    const addr = r.address || {};
    const town =
      addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
    const title = (r.display_name || '').split(',')[0].trim();
    setSuggested({
      title,
      loc: town,
      address: r.display_name || '',
    });
    // No remount: the mounted form prefills empty fields from this.
    setPinKey((k) => k + 1);
    setResults([]);
    setDropOpen(false);
  };

  // X button: fresh location search only. Clears the query, suggestions,
  // prefill source, and pin — but never remounts the form, so manually
  // typed details below survive.
  const clearSearch = () => {
    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQ('');
    setResults([]);
    setDropOpen(false);
    setSearchError('');
    setSearching(false);
    setSuggested(null);
    setCoords(null);
    setLatText('');
    setLngText('');
  };

  const resetAll = () => {
    clearSearch();
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (form) => {
    if (!form.title) return alertMsg('Missing title', 'Give the spot a name.');
    if (!coords) return alertMsg('Missing pin', 'Drop a pin or enter lat/lng.');
    if (!form.img) return alertMsg('Missing photo', 'Add a main photo.');
    setPublishing(true);
    try {
      const spotId = await allocateSpotId(spots);
      const fullSpot = {
        ...form,
        spotId,
        id: spotId,
        coords,
        // Gallery prepends the cover itself; keep extras only (no dupes).
        photos: [...form.photos].filter(Boolean),
      };
      await publishSpot(fullSpot);
      const go = () =>
        router.push({ pathname: '/spot', params: { spot: JSON.stringify(fullSpot) } });
      if (Platform.OS === 'web') {
        window.alert('Spot published.');
        go();
      } else {
        Alert.alert('Spot published', form.title, [
          { text: 'View spot', onPress: go },
          { text: 'Add another', style: 'cancel' },
        ]);
      }
      resetAll();
    } catch (e) {
      alertMsg('Publish failed', e.message || 'Could not publish spot.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminScreen title="Add Spot">
    <ScrollView
      style={[styles.page, { backgroundColor: full.background }]}
      contentContainerStyle={styles.body}
    >
      {syncing ? (
        <Text style={[styles.note, { color: colors.subText }]}>Loading spots…</Text>
      ) : null}

      <Text style={[styles.h2, { color: colors.text }]}>Find place</Text>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            placeholderTextColor={colors.subText}
            value={q}
            onChangeText={onChangeQuery}
            placeholder="Type a place — e.g. Boracay"
            returnKeyType="search"
          />
          {q.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={styles.clearBtn}
              accessibilityLabel="Clear search"
            >
              <Text style={[styles.clearText, { color: colors.subText }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {searching && (
          <View style={[styles.searchSpin, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}
      </View>
      {searchError ? (
        <Text style={[styles.note, { color: full.destructive }]}>{searchError}</Text>
      ) : null}
      {dropOpen && !searching && !searchError && q.trim().length >= 3 && results.length === 0 ? (
        <Text style={[styles.note, { color: colors.subText }]}>
          No places found for “{q.trim()}”. Try a different spelling.
        </Text>
      ) : null}
      {dropOpen && results.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {results.map((r) => (
            <TouchableOpacity
              key={r.place_id}
              onPress={() => pickResult(r)}
              style={[styles.result, { borderColor: colors.border }]}
            >
              <Text style={[styles.resultText, { color: colors.text }]} numberOfLines={2}>
                {r.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.h2, { color: colors.text }]}>Pin location</Text>
      <SpotPicker coords={coords} onPick={applyCoords} focusKey={pinKey} />
      <View style={styles.latlng}>
        <TextInput
          style={[
            styles.latlngInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholderTextColor={colors.subText}
          value={latText}
          onChangeText={(v) => onLatLng('lat', v)}
          keyboardType="decimal-pad"
          placeholder="Latitude"
        />
        <TextInput
          style={[
            styles.latlngInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholderTextColor={colors.subText}
          value={lngText}
          onChangeText={(v) => onLatLng('lng', v)}
          keyboardType="decimal-pad"
          placeholder="Longitude"
        />
      </View>

      <Text style={[styles.h2, { color: colors.text }]}>Details</Text>
      <SpotForm
        key={formKey}
        initial={
          suggested
            ? { title: suggested.title, loc: suggested.loc, address: suggested.address }
            : undefined
        }
        onSubmit={handleSubmit}
        submitLabel="Publish Spot"
        busy={publishing}
      />
    </ScrollView>
    </AdminScreen>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  body: { padding: 16, paddingTop: 4, paddingBottom: 40 },
  h2: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  note: { fontSize: 13, marginTop: 6, marginBottom: 6 },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchBox: { flex: 1, position: 'relative', justifyContent: 'center' },
  clearBtn: {
    position: 'absolute', right: 6, width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  clearText: { fontSize: 15, fontWeight: '700' },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 44,
    height: 48,
    fontSize: 15,
  },
  searchSpin: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: 8, overflow: 'hidden' },
  result: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  resultText: { fontSize: 13, lineHeight: 18 },
  latlng: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  latlngInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
});

export default AddSpot;
