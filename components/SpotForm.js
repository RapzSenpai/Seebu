import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';
import AdminImagePicker from './AdminImagePicker';
import AdminPhotoPicker from './AdminPhotoPicker';

const TYPE_OPTIONS = ['Nature', 'Beach', 'History', 'Adventure'];
const MAX_STOPS = 5;

const blankStop = () => ({ t: '', title: '', text: '' });

// Controlled admin form. Parent owns coords + publish; this owns field state
// and hands back a parsed object via onSubmit.
const SpotForm = ({ initial, onSubmit, submitLabel, busy }) => {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const src = initial || {};

  const [title, setTitle] = useState(src.title || '');
  const [type, setType] = useState(src.type || '');
  const [loc, setLoc] = useState(src.loc || '');
  const [address, setAddress] = useState(src.address || '');
  const [desc, setDesc] = useState(src.desc || '');
  const [longDesc, setLongDesc] = useState(src.longDesc || '');
  const [hours, setHours] = useState(src.hours || '');
  const [fees, setFees] = useState(src.fees || '');
  const [bestTime, setBestTime] = useState(src.bestTime || '');
  const [duration, setDuration] = useState(src.duration || '');
  const [expense, setExpense] = useState(src.estimatedExpense || '');
  const [howTo, setHowTo] = useState(src.howToGetThere || '');
  const [tipsText, setTipsText] = useState(
    Array.isArray(src.tips) ? src.tips.join('\n') : ''
  );
  const [extraPhotos, setExtraPhotos] = useState(
    Array.isArray(src.photos) ? src.photos.filter(Boolean) : []
  );
  // Customs previously had no transport, leaving the Route tab empty.
  const [terminal, setTerminal] = useState(src.transport?.terminal || '');
  const [fare, setFare] = useState(src.transport?.fare || '');
  const [schedule, setSchedule] = useState(src.transport?.schedule || '');
  const [instructions, setInstructions] = useState(src.transport?.instructions || '');
  const [ratingText, setRatingText] = useState(
    src.rating != null ? String(src.rating) : ''
  );
  const [mainPhoto, setMainPhoto] = useState(src.img || '');
  const [stops, setStops] = useState(
    Array.isArray(src.itinerary) && src.itinerary.length
      ? src.itinerary.map((s) => ({
          t: s.t || '',
          title: s.title || '',
          text: s.text || '',
        }))
      : [blankStop()]
  );

  // Nominatim pick suggests a title after mount; fill it only when the field
  // is still empty so typed text is never wiped.
  useEffect(() => {
    if (src.title && !title) setTitle(src.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src.title]);

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: full.background },
  ];

  const Field = ({ label, ...props }) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.subText}
        editable={!busy}
        {...props}
      />
    </View>
  );

  const setStop = (i, key, value) =>
    setStops((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: value } : s)));

  const handleSubmit = () => {
    const tips = tipsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const photos = extraPhotos.filter(Boolean);
    const itinerary = stops
      .filter((s) => s.t.trim() || s.title.trim() || s.text.trim())
      .map((s) => ({ t: s.t.trim(), title: s.title.trim(), text: s.text.trim() }));
    const out = {
      title: title.trim(),
      type: type.trim(),
      loc: loc.trim(),
      address: address.trim(),
      desc: desc.trim(),
      longDesc: longDesc.trim(),
      hours: hours.trim(),
      fees: fees.trim(),
      bestTime: bestTime.trim(),
      duration: duration.trim(),
      estimatedExpense: expense.trim(),
      howToGetThere: howTo.trim(),
      tips,
      itinerary,
      img: mainPhoto,
      photos,
    };
    const rating = parseFloat(ratingText);
    if (Number.isFinite(rating)) out.rating = rating;
    // Only send transport when something was typed, so edits never wipe it.
    const transport = {
      terminal: terminal.trim(),
      fare: fare.trim(),
      schedule: schedule.trim(),
      instructions: instructions.trim(),
    };
    if (Object.values(transport).some(Boolean)) out.transport = transport;
    onSubmit(out);
  };

  return (
    <View>
      <Field label="Title (required)" value={title} onChangeText={setTitle} placeholder="Spot name" />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.subText }]}>Type</Text>
        <View style={styles.chips}>
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt;
            return (
              <TouchableOpacity
                key={opt}
                disabled={busy}
                onPress={() => setType(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.accent : full.muted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? full.accentForeground : colors.text },
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          style={[inputStyle, styles.customType]}
          placeholderTextColor={colors.subText}
          value={type}
          onChangeText={setType}
          editable={!busy}
          placeholder="Or custom type"
        />
      </View>
      <Field label="Location (required)" value={loc} onChangeText={setLoc} placeholder="Town or city" />
      <Field label="Address" value={address} onChangeText={setAddress} placeholder="Full address" />
      <Field label="Short description" value={desc} onChangeText={setDesc} placeholder="One-line summary" />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.subText }]}>Long description</Text>
        <TextInput
          style={[inputStyle, styles.tall]}
          placeholderTextColor={colors.subText}
          value={longDesc}
          onChangeText={setLongDesc}
          editable={!busy}
          multiline
          placeholder="Detailed write-up"
        />
      </View>
      <Field label="Hours" value={hours} onChangeText={setHours} placeholder="6:00 AM - 5:00 PM daily" />
      <Field label="Fees" value={fees} onChangeText={setFees} placeholder="Entrance fees" />
      <Field label="Est. travel expense" value={expense} onChangeText={setExpense} placeholder="₱250–₱450" />
      <Field label="How to get there" value={howTo} onChangeText={setHowTo} placeholder="Bus + tricycle to the entrance" />
      <Field label="Best time" value={bestTime} onChangeText={setBestTime} placeholder="Dry season mornings" />
      <Field label="Duration" value={duration} onChangeText={setDuration} placeholder="Half day" />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.subText }]}>Tips (one per line)</Text>
        <TextInput
          style={[inputStyle, styles.tall]}
          placeholderTextColor={colors.subText}
          value={tipsText}
          onChangeText={setTipsText}
          editable={!busy}
          multiline
          placeholder="One tip per line"
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.subText }]}>Itinerary</Text>
        {stops.map((s, i) => (
          <View
            key={i}
            style={[styles.stop, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <TextInput
              style={inputStyle}
              placeholderTextColor={colors.subText}
              value={s.t}
              onChangeText={(v) => setStop(i, 't', v)}
              editable={!busy}
              placeholder="Time"
            />
            <TextInput
              style={[inputStyle, styles.stopGap]}
              placeholderTextColor={colors.subText}
              value={s.title}
              onChangeText={(v) => setStop(i, 'title', v)}
              editable={!busy}
              placeholder="Stop title"
            />
            <TextInput
              style={[inputStyle, styles.stopGap]}
              placeholderTextColor={colors.subText}
              value={s.text}
              onChangeText={(v) => setStop(i, 'text', v)}
              editable={!busy}
              multiline
              placeholder="Stop details"
            />
            {stops.length > 1 ? (
              <TouchableOpacity
                disabled={busy}
                onPress={() => setStops((prev) => prev.filter((_, j) => j !== i))}
                style={[styles.rowBtn, { backgroundColor: full.muted }]}
              >
                <Text style={[styles.rowBtnText, { color: colors.text }]}>Remove stop</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        {stops.length < MAX_STOPS ? (
          <TouchableOpacity
            disabled={busy}
            onPress={() => setStops((prev) => [...prev, blankStop()])}
            style={[styles.rowBtn, { backgroundColor: full.muted }]}
          >
            <Text style={[styles.rowBtnText, { color: colors.text }]}>Add stop</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <AdminImagePicker
        label="Main photo (required)"
        value={mainPhoto}
        onChange={setMainPhoto}
        folder="seebu/spots"
      />
      <AdminPhotoPicker
        label="Extra photos"
        value={extraPhotos}
        onChange={setExtraPhotos}
        folder="seebu/spots"
      />
      <Field label="Transport terminal" value={terminal} onChangeText={setTerminal} placeholder="South Bus Terminal (Cebu City)" />
      <Field label="Transport fare" value={fare} onChangeText={setFare} placeholder="₱210–₱280" />
      <Field label="Transport schedule" value={schedule} onChangeText={setSchedule} placeholder="Every 30 mins (3AM–9PM)" />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.subText }]}>Transport instructions</Text>
        <TextInput
          style={[inputStyle, styles.tall]}
          placeholderTextColor={colors.subText}
          value={instructions}
          onChangeText={setInstructions}
          editable={!busy}
          multiline
          placeholder="Bus + tricycle to the entrance"
        />
      </View>
      <Field
        label="Rating (optional, 0-5)"
        value={ratingText}
        onChangeText={setRatingText}
        keyboardType="decimal-pad"
        placeholder="Blank = unset"
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={busy}
        style={[styles.submit, { backgroundColor: colors.accent }]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={full.accentForeground} />
        ) : (
          <Text style={[styles.submitText, { color: full.accentForeground }]}>
            {submitLabel || 'Submit'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  tall: { height: 110, paddingTop: 12, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700' },
  customType: { marginTop: 2 },
  stop: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 },
  stopGap: { marginTop: 8 },
  rowBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  rowBtnText: { fontWeight: '700', fontSize: 13 },
  submit: { marginTop: 6, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { fontWeight: '800', fontSize: 15 },
});

export default SpotForm;
