// AI proxy for the SeeBu travel assistant.
//
// The app calls this endpoint; the model API key stays in this function's
// environment and never reaches the client bundle.
//
// Set these on your HOST (Vercel / Netlify / Cloudflare), not in the Expo
// .env — anything EXPO_PUBLIC_ prefixed or in app.config.js `extra` gets
// inlined into the app and can be lifted by anyone who opens the bundle:
//
//   AI_PROVIDER   gemini | openai | anthropic
//   AI_API_KEY    the API key for that provider
//   AI_MODEL      model id (optional; blank uses the default below)
//
// Until a provider is chosen the endpoint returns 503 and the app falls back
// to its built-in offline Cebu answers, so nothing breaks while undecided.

const MAX_MESSAGE_LENGTH = 500;

const SYSTEM_PROMPT =
  'You are a helpful Cebu travel guide. Answer the user clearly and concisely ' +
  'with local Cebu suggestions for attractions, food, transportation, hotels, and sightseeing.';

const DEFAULTS = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
};

// One entry point per provider. Swapping providers means editing only here.
async function askProvider(provider, apiKey, model, message) {
  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Gemini ${res.status}`);
    return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.75,
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `OpenAI ${res.status}`);
    return data?.choices?.[0]?.message?.content || '';
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens: 300, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: message }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Anthropic ${res.status}`);
    return (data?.content || []).map((block) => block.text || '').join('');
  }

  throw new Error(`Unknown AI_PROVIDER "${provider}". Use gemini, openai, or anthropic.`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'message is required' });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
  }

  const provider = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  const apiKey = (process.env.AI_API_KEY || '').trim();
  if (!provider || !apiKey) {
    return res.status(503).json({
      error: 'AI not configured on the server. Set AI_PROVIDER and AI_API_KEY.',
    });
  }

  const model = (process.env.AI_MODEL || '').trim() || DEFAULTS[provider];
  if (!model) {
    return res.status(400).json({
      error: `Unknown AI_PROVIDER "${provider}". Use one of: ${Object.keys(DEFAULTS).join(', ')}.`,
    });
  }

  try {
    const reply = await askProvider(provider, apiKey, model, message);
    if (!reply) return res.status(502).json({ error: 'Empty response from provider' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[ai-proxy]', provider, error.message);
    return res.status(502).json({ error: error.message });
  }
};
