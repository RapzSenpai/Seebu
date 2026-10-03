import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../ThemeContext';
import { useColorScheme } from '../../lib/useColorScheme';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import AdminScreen from '../../components/AdminScreen';

const formatDateTime = (value) => {
  if (!value) return 'No date';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No date';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function AdminMessages() {
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      setItems(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHandled = async (item) => {
    try {
      await setDoc(doc(db, 'inquiries', item.id), { handled: !item.handled }, { merge: true });
      setItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, handled: !m.handled } : m)));
    } catch {}
  };

  // Reply lands in replies[] on the same doc; the user reads it in-app in
  // Contact > Your messages. Nothing leaves the app, nothing faked.
  const sendReply = async (item) => {
    const text = reply.trim();
    if (!text || sending) return;
    if (text.length > 1000) return;
    setSending(true);
    try {
      const entry = { text, at: new Date().toISOString(), by: 'admin' };
      await updateDoc(doc(db, 'inquiries', item.id), {
        replies: arrayUnion(entry),
        replied: true,
        handled: true,
        lastReplyAt: entry.at,
      });
      setItems((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? { ...m, replies: [...(m.replies || []), entry], replied: true, handled: true }
            : m
        )
      );
      setReply('');
    } catch {}
    setSending(false);
  };

  const unread = items.filter((m) => !m.handled).length;

  return (
    <AdminScreen title={unread > 0 ? `Messages (${unread} new)` : 'Messages'}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={styles.center} />
        ) : items.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Feather name="inbox" size={28} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>No inquiries yet.</Text>
          </View>
        ) : (
          items.map((m) => {
            const open = openId === m.id;
            const replies = Array.isArray(m.replies) ? m.replies : [];
            return (
              <View key={m.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => { setOpenId(open ? null : m.id); setReply(''); }}>
                  <View style={styles.cardHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sender, { color: colors.text }]} numberOfLines={1}>
                        {m.displayName || 'Unknown'}
                      </Text>
                      <Text style={[styles.meta, { color: colors.subText }]} numberOfLines={1}>
                        {m.email || 'No email'} • {m.category || 'General'} • {formatDateTime(m.createdAt)}
                      </Text>
                    </View>
                    {!m.handled && <View style={[styles.dot, { backgroundColor: colors.accent }]} />}
                    <Feather
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.subText}
                    />
                  </View>
                  <Text style={[styles.body, { color: colors.text }]} numberOfLines={open ? undefined : 2}>
                    {m.message}
                  </Text>
                </TouchableOpacity>

                {open && (
                  <View style={styles.thread}>
                    {replies.map((r, i) => (
                      <View
                        key={i}
                        style={[styles.replyBubble, { backgroundColor: full.muted }]}
                      >
                        <Text style={[styles.replyBy, { color: colors.accent }]}>
                          You • {formatDateTime(r.at)}
                        </Text>
                        <Text style={[styles.replyText, { color: colors.text }]}>{r.text}</Text>
                      </View>
                    ))}
                    <TextInput
                      style={[styles.replyInput, { color: colors.text, borderColor: colors.border }]}
                      placeholder="Write a reply — the user sees it in Contact > Your messages."
                      placeholderTextColor={colors.subText}
                      multiline
                      value={reply}
                      onChangeText={setReply}
                    />
                    <View style={styles.threadActions}>
                      <TouchableOpacity
                        onPress={() => sendReply(m)}
                        disabled={sending || !reply.trim()}
                        style={[
                          styles.sendBtn,
                          { backgroundColor: colors.accent },
                          (!reply.trim() || sending) && { opacity: 0.6 },
                        ]}
                      >
                        {sending ? (
                          <ActivityIndicator size="small" color={full.accentForeground} />
                        ) : (
                          <Text style={[styles.sendText, { color: full.accentForeground }]}>Reply</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleHandled(m)}
                        style={[styles.handledBtn, { backgroundColor: full.muted }]}
                      >
                        <Feather
                          name={m.handled ? 'check-circle' : 'circle'}
                          size={15}
                          color={m.handled ? colors.accent : colors.subText}
                        />
                        <Text style={[styles.handledText, { color: m.handled ? colors.accent : colors.subText }]}>
                          {m.handled ? 'Handled' : 'Mark handled'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4, paddingBottom: 40 },
  center: { marginTop: 32 },
  emptyCard: { alignItems: 'center', padding: 32, borderRadius: 16 },
  emptyText: { marginTop: 10, fontSize: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  sender: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 21 },
  thread: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#8888', paddingTop: 12 },
  replyBubble: { borderRadius: 12, padding: 10, marginBottom: 8 },
  replyBy: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  replyText: { fontSize: 14, lineHeight: 20 },
  replyInput: {
    borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14,
    minHeight: 80, textAlignVertical: 'top',
  },
  threadActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, justifyContent: 'center' },
  sendText: { fontWeight: '800', fontSize: 14 },
  handledBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  handledText: { fontSize: 13, fontWeight: '700' },
});
