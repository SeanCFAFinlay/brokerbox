# BrokerBox - Monorepo (pnpm Workspace)

This is the production-ready architecture isolating the database models, backend logic, and frontend components via `pnpm` workspace definitions. It compiles three distinct Expo React Native mobile applications.

## Prerequisites
- Node 18+
- pnpm 9.x+

## Installation & Setup

1. **Install dependencies at the root:**
   ```bash
   cd brokerbox-monorepo
   pnpm install
   ```

2. **Setup the Database:**
   Ensure the Neon Database URL is inside `packages/db/.env`:
   ```bash
   DATABASE_URL="postgresql://[USER]:[PASS]@[NEON_URL]?sslmode=require&channel_binding=require"
   ```
   *Run the Prisma migration tools:*
   ```bash
   cd packages/db
   pnpm run push
   pnpm run seed
   pnpm run generate
   ```

## Running the API Gateway
The React Native apps cannot securely access Prisma directly. Run the central internal node proxy API layer:
```bash
cd packages/api
pnpm run dev
# Running on http://localhost:4000
```

## Running the Mobile Applications
Expo apps are located in the `apps/` directory and utilize Metro Bundler extensions to natively resolve `@brokerbox/*` workspaces packages.

Start the app of your choice using standard EXPO flags:
```bash
cd apps/broker
npx expo start
```
```bash
cd apps/client
npx expo start
```
```bash
cd apps/lender
npx expo start
```

Inside the terminal window, press:
- `i` to launch on the iOS simulator
- `a` to launch on Android emulator
- `w` to launch locally in browser emulation

## Dev Authentication
Each of the 3 mobile apps maintains a strict `_layout.tsx` Dev Password Gate. 
**Access Password:** `admin`
## Deployment

### Web Application (Vercel)
The web app is configured for Vercel. Ensure you set the `DATABASE_URL` environment variable in the Vercel dashboard.
- Build Command: `pnpm run build --filter @brokerbox/web`
- Root Directory: `apps/web`

### Mobile Applications (EAS)
Use Expo Application Services (EAS) to build and submit the mobile apps.
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build --platform all --profile production`

### Backend API (Docker)
The API can be deployed using the provided `Dockerfile` in `apps/api`.
```bash
docker build -t brokerbox-api -f apps/api/Dockerfile .
docker run -p 3001:3001 -e JWT_SECRET=your_secret brokerbox-api
```
