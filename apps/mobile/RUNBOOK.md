# BrokerBox Mobile App - RUNBOOK

## Setup Next-Gen Expo App

1. Ensure Node and NPM are installed.
2. Inside the `brokerbox-mobile` directory, install dependencies:
```bash
npm install
```

## Database Connection & Sync
This repository interacts with a Neon Postgres database directly using Prisma.
Ensure your `.env` and `prisma/.env` both contain the working Neon connection:
```bash
DATABASE_URL="postgresql://[USER]:[PASS]@[NEON_URL]?sslmode=require&channel_binding=require"
```

To regenerate the Prisma client after schema updates:
```bash
npx prisma generate
```

To push schema changes (WARNING: Local data loss if forced):
```bash
npx prisma db push --accept-data-loss
```

To seed the database with Lenders, Clients, and Complex Deal Scenarios:
```bash
npx prisma db seed
```

## Running the App

Run the development server natively:
```bash
npx expo start
```
- Press `i` to open in iOS Simulator (Requires Xcode).
- Press `a` to open in Android Emulator (Requires Android Studio).
- Press `w` to open in web mode (fallback for local layout testing without simulators).

*Note: The Expo API Routes (`app/api/*`) are inherently local to the running server. When deploying to production on Expo Application Services (EAS), you may need a separate Express or Next backend, or use Expo Server-Side Rendering (SSR) hosting settings.*

## Admin Access
The mobile app defaults to an "Off" state displaying a password gate.
- Username/Email: Any
- Password: **admin**

Logging in persists via `expo-secure-store`.
