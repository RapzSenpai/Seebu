import { cebuSpots } from '../utils/spots';

// Direct Groq client (capstone setup — no proxy server).
// ponytail: OpenAI-compatible endpoint, one model const, spot context from
// the static catalog so answers use real SeeBu data. gpt-oss rejects
// response_format=json_object, so replies arrive as plain text.
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b';

export const isAiConfigured = () => GROQ_KEY.length > 0;

// Keyword matching is gone on purpose (CHAT-05): with 12 built-ins the
// whole catalog fits in the prompt, so every question is grounded and
// fees/hours/schedule queries never fall back to general knowledge.
// Static catalog = public app data only, nothing admin-private.
const spotContext = (spots) =>
  spots
    .map(
      (s) =>
        `- ${s.title} (${s.loc}, ${s.type}): ${s.desc || ''}` +
        ` Expense: ${s.estimatedExpense || 'n/a'}.` +
        ` Getting there: ${s.howToGetThere || s.transport?.instructions || 'n/a'}.` +
        ` Hours: ${s.hours || 'n/a'}. Fees: ${s.fees || 'n/a'}.`
    )
    .join('\n');

export const fetchAiReply = async (text) => {
  const system =
    'You are SeeBu, a friendly travel assistant for Cebu, Philippines. ' +
    'Keep replies under 120 words. When spot info is given below, use ONLY it for facts. ' +
    'Never invent places, prices, or schedules.' +
    `\nSpot info:\n${spotContext(cebuSpots)}`;

  // CHAT-04: hard timeout so a dead connection can't spin forever.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });
    if (res.status === 429) throw new Error('Too many requests — try again in a bit.');
    if (!res.ok) throw new Error(`AI request failed (${res.status}).`);
    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content?.trim() || '';
    if (!raw) throw new Error('Empty AI reply.');
    // Tolerate models that wrap in JSON despite no format request.
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.reply === 'string' && parsed.reply.trim()) return parsed.reply.trim();
    } catch {}
    return raw;
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('Assistant timed out — check connection and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};
