# 🎧 Track Manager

A modern, React-based track management interface with audio playback, metadata filtering, optimistic updates, and smooth user interactions.

## ✨ Features

-   🎛️ **Optimistic Updates** for faster UI interactions and minimal latency feel
-   🗑️ **Bulk Deletion** with intuitive multi-select UI
-   🔊 **Audio Playback with Visualisation** per track (expandable)
-   📁 **Modal-Based Create/Edit** for seamless flow
-   🔍 Filtering by genre, artist, and title
-   📜 Pagination, sorting, search
-   🧠 Smart error handling and retry logic
-   💅 Built with TailwindCSS, Hooks and a clean UX

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Run locally

```bash
npm run dev
# or
yarn dev
```

Visit [https://localhost:3000](https://localhost:3000) to open the app.

## 🧭 App Structure

### `/tracks` (Main View)

-   Displays all tracks as cards with playback and controls
-   Pagination and filters are applied via query params
-   `+` button opens **Create Modal**
-   Clicking a card opens **Edit Modal**

### Modals

-   **CreateTrackModal** – create new tracks with optional file upload and metadata
-   **EditTrackModal** – update title, genre, artist, or upload new audio
-   Both modals support optimistic UI updates for instant feedback

## 🔄 Optimistic Updates

All create, edit, and delete actions update the UI **before** waiting for the server response. If the request fails, the change is rolled back and an error toast is shown.

## 🗑️ Bulk Delete

You can select multiple tracks using checkboxes and delete them all at once. The list updates immediately via optimistic removal.

## 🎶 Audio Visualisation

Each track can be played inline. Playback status is managed globally to ensure only one track plays at a time. Optional waveform/visualisation components can be plugged in (e.g. `wavesurfer.js`, `tone.js`).

## 🧪 Testing

Basic test IDs are included in UI for E2E and unit test coverage. Use Playwright or React Testing Library for automation.

## 🛠️ Tech Stack

-   React + TypeScript
-   React Router
-   TailwindCSS
-   API with axios
-   Hooks & composables (e.g. `useModalState`)
