import { cebuSpots } from '../utils/spots';

// Direct Groq client (capstone setup — no proxy server).
// ponytail: OpenAI-compatible endpoint, one model const, spot context from
// the static catalog so answers use real SeeBu data. gpt-oss rejects
// response_format=json_object, so replies arrive as plain text.
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b';

export const isAiConfigured = () => GROQ_KEY.length > 0;

// Keyword match over the built-in catalog: top 3 spots feed the prompt so
// the model answers from real data instead of inventing places.
const matchSpots = (text) => {
  const words = text.toLowerCase().split(/[^a-z0-9₱]+/).filter((w) => w.length > 2);
  if (words.length === 0) return [];
  return cebuSpots
    .map((s) => {
      const hay = `${s.title} ${s.loc} ${s.type} ${s.desc || ''}`.toLowerCase();
      let score = 0;
      for (const w of words) if (hay.includes(w)) score += 1;
      return { s, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.s);
};

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
  const spots = matchSpots(text);
  const system =
    'You are SeeBu, a friendly travel assistant for Cebu, Philippines. ' +
    'Keep replies under 120 words. When spot info is given below, use ONLY it for facts. ' +
    'Never invent places, prices, or schedules.' +
    (spots.length > 0 ? `\nSpot info:\n${spotContext(spots)}` : '');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
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
};
