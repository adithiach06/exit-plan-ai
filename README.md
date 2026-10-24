# EXIT PLAN AI

> **"When Plan A Fails, You're Not Out of Options."**

An AI-powered travel safety and cybersecurity web application designed primarily for solo female travellers in India. EXIT PLAN AI bridges pre-trip risk preparedness, instant offline recovery protocols, safe haven discovery, and cybersecurity vigilance against travel fraud.

---

## Design System & Editorial Aesthetic

EXIT PLAN AI uses a premium, editorial travel-tech aesthetic:
- **Forest Green** (`#183D32`): Trust, resilience, and command
- **Warm Ivory** (`#F7F5EF`): High-legibility paper tone
- **Sage** (`#DCE7DC`): Calming secondary accents
- **Muted Terracotta** (`#C9785B`): Critical alerts, emergency actions, and active waypoints
- **Charcoal** (`#242824`): Crisp editorial body typography

Typography pairs **Newsreader** (classic editorial serif) for headings with **Plus Jakarta Sans** (clean, crisp sans-serif) for body and interface elements.

---

## Technology Stack

- **Frontend:** React 18, Vite 5, JavaScript (ES Modules)
- **Styling:** Modular CSS variables and design tokens (`variables.css`, `index.css`)
- **Offline & Persistence:** LocalStorage API + Service Worker (PWA manifest)
- **Emergency Integration:** India 24/7 National Emergency directory (112, 1091, 181, 139, 1930)
- **External Services (When Configured):**
  - Google Maps API (safe havens and assistance locator)
  - Secure Backend Proxy for AI services (protects API credentials)

---

## Project Structure

```
exit-plan-ai/
├── public/
│   ├── favicon.svg          # Brand shield icon
│   ├── manifest.json        # PWA Web App Manifest
│   └── sw.js                # Offline caching service worker
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Badge.jsx    # Status pills & tags
│   │   │   ├── Button.jsx   # Primary, secondary, terracotta, emergency
│   │   │   ├── Card.jsx     # Editorial bordered cards
│   │   │   ├── Icons.jsx    # SVG icons with consistent 1.6px stroke
│   │   │   ├── Modal.jsx    # Dialog wrapper
│   │   │   └── SosModal.jsx # Instant India emergency hotline drawer
│   │   └── layout/          # Layout components
│   │       ├── AppLayout.jsx# Global layout wrapper
│   │       ├── Header.jsx   # Top utility bar, brand lockup & navigation
│   │       └── Footer.jsx   # India helpline directory & architecture notes
│   ├── hooks/
│   │   ├── useLocalStorage.js # Safe JSON localStorage persistence
│   │   └── useOnlineStatus.js # Online/Offline network watcher
│   ├── pages/
│   │   ├── Home.jsx           # Mission overview & architecture roadmap
│   │   ├── ExitPlan.jsx       # Stage 1: Backup Travel Plans (Plan B)
│   │   ├── AssistanceMap.jsx  # Stage 2: Safe Havens & Google Maps locator
│   │   ├── MessageScanner.jsx # Stage 3: Cybersecurity & scam shield
│   │   ├── SafetyVault.jsx    # Stage 4: Offline document & contact vault
│   │   └── Assistant.jsx      # Stage 5: AI Travel Safety Advisor
│   ├── services/
│   │   ├── api.js             # Backend AI proxy client
│   │   └── storage.js         # Local persistence & emergency contacts
│   ├── styles/
│   │   ├── variables.css      # Brand tokens, colors, spacing, typography
│   │   └── index.css          # Editorial layout utilities & resets
│   ├── App.jsx                # Router & active page dispatcher
│   └── main.jsx               # React DOM root & PWA registration
├── .env.example               # Template for environment configuration
├── .gitignore                 # Secrets and build ignore rules
├── index.html                 # Entry HTML with web fonts
├── package.json               # Dependencies and scripts
└── vite.config.js             # Vite configuration
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your machine.
If Node.js is not yet installed, you can install it using Windows Package Manager:
```powershell
winget install OpenJS.NodeJS.LTS
```
Or download the official installer from [nodejs.org](https://nodejs.org).

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Security & Secrets Policy

1. **Zero Secret Leaks:** Client-side bundles never contain private API keys.
2. **Backend Gateway:** External AI models are accessed exclusively through a secure backend proxy (`VITE_AI_BACKEND_URL`).
3. **Local Privacy:** User trip itineraries and emergency notes are stored strictly in client-side LocalStorage unless the user explicitly chooses to transmit them.
