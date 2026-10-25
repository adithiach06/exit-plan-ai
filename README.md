# EXIT PLAN AI

> **When Plan A Fails, You're Not Out of Options.**

EXIT PLAN AI is a travel safety and cybersecurity web application designed primarily for solo female travellers in India. It helps users prepare backup travel plans, discover nearby safe havens, access emergency information, and identify potential travel-related scams.

The application is implemented as a **standalone React + Vite single-page web client**. All built-in core features run entirely in the browser without requiring a backend server or external generative AI API.

---

## Architectural Overview

* **Standalone Web Client:** The frontend runs directly in modern web browsers. No backend server (e.g. Node/Express, Python, or Flask) needs to be launched or configured to run the application.
* **No External Generative AI Required:** All threat detection and contingency guidance operate via built-in, deterministic client-side engines and pre-verified safety blueprints.
* **Optional Backend Proxy (`src/services/api.js`):** The repository includes `src/services/api.js` containing optional backend-proxy client functions (`checkBackendHealth`, `analyzeTravelMessage`, `requestAdvisorGuidance`). According to the architectural inspection, these functions are **not currently connected to or invoked by any UI component**; they serve as architectural scaffolding for optional future enterprise proxy deployment.
* **Privacy-First Data Storage:** Personal emergency contacts and trip itineraries are saved exclusively in the browser's `localStorage` and never transmitted to external servers.

---

## Key Features

### 1. Exit Plans — Backup Travel Planning

* Create and manage travel itineraries with origin, destination, dates, transport modes, and accommodation details.
* Validate trip information, preventing invalid phone numbers and past departure dates.
* Stored strictly in browser local storage (`localStorage`); no itinerary data is sent to external servers.
* Active trip context automatically integrates into the Travel Advisor and Safe Havens shortcuts.

### 2. Safe Havens — Nearby Assistance

* Search for nearby hospitals, police stations, transport hubs, and women-friendly accommodations.
* Interactive map powered by Leaflet and OpenStreetMap data.
* Live facility queries use public OpenStreetMap Overpass API endpoints with automatic retry strategies and endpoint fallbacks.
* **Connectivity & Offline Behavior:** Live facility searches require active internet connectivity. However, previously loaded facility data remains accessible during an offline session, and emergency helpline shortcuts remain permanently accessible offline.
* Quality indicators truthfully reflect whether phone numbers and 24/7 hours are listed in OpenStreetMap data without making unsupported safety claims.

### 3. Scam Shield — Travel Scam Detection

* Analyzes suspicious travel-related communications (SMS, WhatsApp, emails, and payment requests).
* Detects patterns including urgency, OTP phishing, credential harvesting, fake booking cancellations, and digital-arrest extortion attempts.
* **Deterministic Client-Side Rules:** All analysis is performed entirely in the browser using deterministic threat heuristics. No message text is ever uploaded to external servers, cloud AI models, or third-party databases.
* Provides risk tier scores (Low, Medium, High, Critical), identified scam signatures, and immediate self-protection checklists.

### 4. Safety Vault — Emergency Information

* Store personal emergency contacts and travel safety checklists locally.
* Uses browser local storage (`localStorage`) so saved contacts remain accessible even when offline.
* Generate a formatted emergency summary ready for printing or saving as a PDF.
* **Privacy note:** Data stored in browser storage remains on the user's device and may be cleared if browser site data is deleted. It is not an encrypted cloud vault.

### 5. Travel Advisor — Crisis Guidance

* Access step-by-step contingency guidance across 7 core travel crisis scenarios: transport disruption, missed transit, feeling unsafe/harassment, medical emergencies, lost passport/ID, digital extortion, and offline stranded.
* **Predefined Crisis Protocols:** Guidance is generated from structured, pre-verified safety blueprints rather than an unconstrained generative AI model.
* Dynamically incorporates locally saved itinerary context (e.g. current transit mode and destination) into practical alternatives.
* Operates 100% offline within the browser with zero external dependencies.

### 6. SOS Help

* One-tap access to Indian national emergency helplines (112 National Emergency, 1090 Women Helpline, 139 Railway Protection, etc.).
* Displays saved personal emergency contacts from Safety Vault with direct one-tap calling (`tel:` links).
* Generates a pre-formatted distress message template with a reliable clipboard copy function and fallback text display.
* **Notice:** External links and buttons initiate calls through the user's device when supported. EXIT PLAN AI does **not** automatically dispatch emergency services or track live GPS locations. In immediate physical danger in India, call **112** directly.

---

## Current Implementation vs. Future Possibilities

| Area | Current Implemented Functionality (Standalone Client) | Future Integration Possibilities (Optional Backend) |
| :--- | :--- | :--- |
| **Travel Advisor** | Built-in predefined scenario blueprints with active trip context | Optional cloud LLM proxy for free-form conversational queries |
| **Scam Shield** | In-browser deterministic rule-based threat scoring | Cloud-assisted threat intelligence feed updates |
| **Data Storage** | Local browser `localStorage` (private, single-device) | Optional end-to-end encrypted multi-device cloud synchronization |
| **Emergency Actions** | Device `tel:` dialer triggers & distress template copying | Automated SMS/push dispatch to emergency contacts via SMS gateway |
| **Backend Integration** | None required; `src/services/api.js` is an unconnected gateway stub | Deployed backend proxy server forwarding authenticated requests |

---

## Design System

EXIT PLAN AI uses an editorial travel-tech design system emphasizing clarity, high contrast, and calm usability during stressful situations.

* **Forest Green:** `#183D32`
* **Warm Ivory:** `#F7F5EF`
* **Sage:** `#DCE7DC`
* **Muted Terracotta:** `#C9785B`
* **Charcoal:** `#242824`

The design pairs Newsreader-style editorial headings with clean sans-serif interface typography.

---

## Technology Stack

* **Frontend Framework:** React 18, JavaScript (ES Modules)
* **Build Tool:** Vite 5
* **Styling:** Modular CSS with CSS custom properties
* **Client Storage:** Browser LocalStorage
* **Mapping:** Leaflet & OpenStreetMap (Overpass API & Nominatim)
* **Backend / External AI:** None required; runs completely standalone in the browser

---

## Project Structure

```text
exit-plan-ai/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── data/
│   │   └── advisorScenarios.js
│   ├── hooks/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ExitPlan.jsx
│   │   ├── AssistanceMap.jsx
│   │   ├── MessageScanner.jsx
│   │   ├── SafetyVault.jsx
│   │   └── Assistant.jsx
│   ├── services/
│   │   ├── api.js            # Optional backend proxy stub (not connected to current UI)
│   │   ├── safeHavensService.js
│   │   ├── scamDetector.js
│   │   └── storage.js
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

Install Node.js (version 18 or higher recommended).

Official download: https://nodejs.org/

### 1. Clone the repository

```bash
git clone https://github.com/adithiach06/exit-plan-ai.git
cd exit-plan-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal (typically `http://localhost:5173`). No backend server process needs to be started.

### 4. Create a production build

```bash
npm run build
```

The production output is generated in the `dist/` directory. You can preview the production bundle locally with:

```bash
npm run preview
```

---

## Security and Privacy

* **Zero Cloud Data Leakage:** Personal contacts and trip plans remain on the user's device in browser local storage.
* **No Unsecured Keys:** No private API keys or third-party AI tokens are embedded in client-side code.
* **Deterministic Privacy:** Scam Shield analyzes messages strictly in-memory without logging or network transfer.
* **Clear Operational Boundaries:** The app does not claim to replace official emergency dispatch or provide infallible scam detection.

---

## Limitations

* **Live Facility Discovery Requires Connectivity:** While previously retrieved facility data and emergency helplines persist offline, searching new map areas requires an active internet connection to query OpenStreetMap.
* **OpenStreetMap Data Coverage:** Facility information (phone numbers, hours, wheelchair accessibility) is crowd-sourced from OpenStreetMap and may be incomplete or outdated in rural or developing areas.
* **Browser Storage Constraints:** LocalStorage is tied to a specific browser and profile. Clearing browser cookies or cache will erase saved contacts and itineraries.
* **No Automatic Dispatch:** Emergency buttons initiate phone calls via the device's native dialer; the app cannot automatically track location or dispatch first responders.

---

## Responsible Use

EXIT PLAN AI is intended to support travel preparedness and safety awareness for solo travellers. Users should verify critical details when possible and immediately contact official emergency services (call **112** in India) in any life-threatening situation.

---

## Acknowledgements

This project uses Leaflet, OpenStreetMap, Nominatim, and Overpass API data under open licences. All helplines referenced are official public services of the Government of India and relevant state authorities.
