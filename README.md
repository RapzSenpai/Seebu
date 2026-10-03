# SeeBu

A Cebu travel guide app built with Expo + Firebase. Explore spots, save places, read reviews, meet local guides, and chat with a travel assistant.

## Run it

```bash
npm install
cp .env.example .env   # fill in your keys
npx expo start -c
```

## Setup notes

- **Firebase**: console → project settings → fill the `EXPO_PUBLIC_FIREBASE_*` keys. Deploy rules with `firebase deploy --only firestore:rules`.
- **Cloudinary**: unsigned upload preset → `EXPO_PUBLIC_CLOUDINARY_*` keys (admin photo uploads).
- **Groq**: paste a key into `EXPO_PUBLIC_GROQ_API_KEY` for the chat assistant. Client-visible by design here — use a restricted free key.
- **Admin**: set `role: 'admin'` on your `users/{uid}` doc via the Firestore console.

## Notes

- `.env` is gitignored and never committed.
- Light mode + SeeBu Default accent are the app defaults; each account keeps its own appearance.
