# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Vietnamese History educational app** with two parallel implementations:

- **`VietNamHistoryNativeReactApp/`** — Cross-platform Expo/React Native app (TypeScript) — active development target
- **`VietnamHistoryJavaApp/`** — Original Android native app (Java) — reference/legacy

Migration from the Java app to React Native is ongoing. All new features should target the React Native app.

## React Native App (`VietNamHistoryNativeReactApp/`)

### Commands

```bash
cd VietNamHistoryNativeReactApp
npx expo start          # Dev server (scan QR with Expo Go)
npx expo start --android  # Launch on Android emulator/device
npx expo start --ios      # Launch on iOS simulator
npx expo start --web      # Launch in browser
npx expo lint             # ESLint
```

No test suite is configured.

### Architecture

**Routing:** Expo Router with file-based routes under `src/app/`. Bottom tabs are defined in `src/app/(tabs)/`.

**Data layer:** All data comes from Firebase Firestore. The `src/services/` directory contains one service file per Firestore collection (e.g., `periodService.ts`, `quizService.ts`). Components import from services, never from Firebase directly.

**State:** No global state manager. Firebase Auth state is accessed via `src/hooks/useAuth.ts`. Theme (dark/light) is in `src/contexts/ThemeContext.tsx`. User session persists via AsyncStorage.

**Models:** TypeScript interfaces in `src/models/` mirror Firestore document shapes. Path alias `@/*` maps to `src/*` (configured in `tsconfig.json`).

**Platform-specific files:** Some components have `.web.tsx` variants (e.g., `src/components/app-tabs.web.tsx`) that override the default `.tsx` on web.

**Theme system:** Design tokens live in `src/constants/theme.ts`. The app uses a dark/gold redesign — refer to existing screen styles when adding new screens.

### Firebase

- Project: `lichsuvietnam-d3c26`
- Services used: Firestore, Auth (email, Google, Facebook), Storage
- Config is in `.env` as `EXPO_PUBLIC_*` variables
- Collections: `periods`, `stages`, `events`, `persons`, `articles`, `quizzes`, `forums`, `users`, `museums`

### Key Content Structure

Historical data is hierarchical: **Period → Stage → Event**. The full dataset is in `full_periods_database.json` at the repo root (366 KB). Periods span Vietnamese history from 700 BCE to present.

## Android Java App (`VietnamHistoryJavaApp/`)

### Commands

```bash
cd VietnamHistoryJavaApp
./gradlew assembleDebug                  # Build debug APK
./gradlew connectedAndroidTest           # Run instrumented tests (requires device/emulator)
./gradlew test                           # Run unit tests
```

- **Min SDK**: 30, **Target SDK**: 36
- **Package**: `com.example.vietnamhistoryapplication`
- Fragment-based architecture with Activity containers
- Uses Glide (images), ExoPlayer (video), Firebase (same backend as RN app)
