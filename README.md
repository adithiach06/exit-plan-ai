# EXIT PLAN AI

> **When Plan A Fails, You're Not Out of Options.**

EXIT PLAN AI is a travel safety and cybersecurity web application designed primarily for solo female travellers in India. It helps users prepare backup travel plans, discover nearby safe havens, access emergency information, and identify potential travel-related scams.

## Key Features

### 1. Exit Plans — Backup Travel Planning

* Create and manage travel itineraries.
* Save departure and return dates, destinations, and transport details.
* Validate important trip information.
* Use saved itinerary information to support other safety features.

### 2. Safe Havens — Nearby Assistance

* Search for nearby hospitals, police stations, transport facilities, and accommodation.
* Explore available facilities on an interactive map.
* Filter facilities and access available location information.
* Use situation-based shortcuts for common travel emergencies.
* Retain previously loaded facility information during tested offline scenarios.

**Map data:** The tested map interface uses Leaflet and OpenStreetMap, with facility search supported by external geocoding and map-data services. Availability depends on connectivity and the data returned by those services.

### 3. Scam Shield — Travel Scam Detection

* Analyse suspicious messages for potential scam indicators.
* Detect patterns such as urgency, credential requests, payment demands, and digital-arrest threats.
* Display risk assessments and safety guidance.
* Perform the tested rule-based checks in the browser.

Risk assessments are guidance, not a guarantee that a message is safe or fraudulent.

### 4. Safety Vault — Emergency Information

* Store emergency contacts and travel-related safety information locally.
* Access saved safety information within the supported offline experience.
* Maintain a personal safety checklist.
* Generate an emergency summary for printing or saving as a PDF.

**Privacy note:** Information stored in browser storage may be lost if the user clears site data or changes browsers or devices. Do not treat the vault as a substitute for secure, encrypted document storage.

### 5. Travel Advisor — Crisis Guidance

* Browse predefined travel crisis scenarios.
* Access step-by-step contingency guidance.
* Review practical alternatives and relevant helpline information.
* Use saved itinerary context where supported.

The application does not automatically track a user's live location or dispatch emergency services.

### 6. SOS Help

* Display emergency helplines.
* Access saved emergency contacts.
* Copy an emergency message template.

In immediate danger in India, call **112** directly.

## Design System

EXIT PLAN AI uses an editorial travel-tech design with a focus on readability and calm, accessible interfaces.

* **Forest Green:** `#183D32`
* **Warm Ivory:** `#F7F5EF`
* **Sage:** `#DCE7DC`
* **Muted Terracotta:** `#C9785B`
* **Charcoal:** `#242824`

The design pairs Newsreader-style editorial headings with clean sans-serif interface typography.

## Technology Stack

* **Frontend:** React, JavaScript (ES Modules)
* **Build tool:** Vite
* **Styling:** CSS
* **Persistence:** Browser LocalStorage for supported saved information
* **Mapping:** Leaflet and OpenStreetMap
* **External data:** Geocoding and facility-data services, subject to their availability and terms

Confirm the exact installed versions and any additional integrations in `package.json` and the project source before listing them as dependencies.

## Project Structure

```text
exit-plan-ai/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── hooks/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ExitPlan.jsx
│   │   ├── AssistanceMap.jsx
│   │   ├── MessageScanner.jsx
│   │   ├── SafetyVault.jsx
│   │   └── Assistant.jsx
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

Some files or folders may differ depending on the current implementation.

## Getting Started

### Prerequisites

Install a supported version of Node.js. Check `package.json` for the project's required version.

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

Open the local URL printed in the terminal. Vite may use a port other than `5173` if that port is already occupied.

### 4. Create a production build

```bash
npm run build
```

The production output is generated in the `dist/` directory.

## Security and Privacy

* Keep private API keys and credentials out of client-side code and Git commits.
* Ignore local environment files using `.gitignore`.
* Remember that browser LocalStorage is not encrypted secure storage.
* Treat scam scores as indicators rather than definitive judgments.
* External maps, geocoding, and facility searches may require an internet connection.
* The application does not automatically contact emergency services.

Only configure external AI services through a properly secured backend if that integration is implemented and deployed.

## Limitations

* Facility data may be incomplete, outdated, or unavailable.
* Some features require an active internet connection.
* Previously loaded map and facility information may be available offline, but live searches require connectivity.
* Emergency helplines and guidance are provided for assistance; they do not replace professional emergency responders.
* Browser storage does not guarantee recovery after site data is cleared or the browser environment changes.

## Responsible Use

EXIT PLAN AI is intended to support travel preparedness and safety awareness. Users should verify critical information when possible and contact official emergency services when necessary.

## Acknowledgements

This project uses third-party libraries and external services. Their respective licences, attribution requirements, and usage terms should be reviewed and acknowledged before distribution.
