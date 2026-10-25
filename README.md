# 🧳 EXIT PLAN AI
### When Plan A Fails, You're Not Out of Options.

**EXIT PLAN AI** is a travel safety and cybersecurity web application designed primarily for solo female travellers in India. It helps travellers prepare for unexpected situations, identify potentially suspicious messages, locate nearby safety facilities, and access practical guidance when travel plans go wrong.

By bringing preventive safety planning, digital scam awareness, emergency resources, and travel assistance together, EXIT PLAN AI aims to help users feel more prepared when unexpected situations arise.

---

## 🎯 Problem Statement

Solo female travellers may face unexpected travel disruptions, unfamiliar surroundings, digital scams, and situations that require quick access to safety information.

During stressful situations, finding appropriate resources and deciding what to do next can be difficult.

EXIT PLAN AI addresses these challenges through a centralised platform that helps users prepare backup travel plans, explore nearby facilities, assess suspicious messages, and access situation-specific safety guidance.

## 💡 Our Solution

EXIT PLAN AI focuses on **preventive safety and emergency preparedness**.

Instead of concentrating on a single travel-safety feature, the application combines multiple tools to help users prepare before travelling and respond more effectively when unexpected situations arise.

---

## ✨ Key Features

### 1. 🗺️ Exit Plans — Preventive Safety Planner
- Create and manage travel plans.
- Store relevant trip details and emergency contact information.
- Review trip information and prepare backup arrangements.
- Validate important trip details to reduce input errors.

### 2. 📍 Safe Havens — Safety Assistance Map
- Explore nearby safety-related facilities, including hospitals, police stations, and transport facilities where available.
- View facility locations on an interactive map.
- Search for facilities using mapping and geospatial services.
- Retain previously loaded facility information during an offline session.

*Fresh facility searches require an internet connection.*

### 3. 🛡️ Scam Shield
- Analyse suspicious text messages using locally executed detection rules.
- Identify potentially suspicious patterns associated with scams.
- Display a risk assessment to help users evaluate a message.
- Support awareness of potential digital fraud.

*Risk assessments are indicative and do not guarantee that a message is safe or malicious.*

### 4. 🔐 Safety Vault
- Store emergency-related information locally in the browser.
- Maintain an emergency checklist.
- Review relevant trip and emergency information.
- Prepare an emergency summary for reference or printing.

### 5. 🆘 SOS Help
- Access emergency contact options and helpline information.
- View saved emergency contact details.
- Copy a prepared emergency message for communication.

*SOS Help does not automatically dispatch emergency services, send SMS messages, or continuously track the user's location.*

### 6. 🤖 Travel Advisor
- Explore predefined safety guidance for selected travel emergencies.
- Access practical steps for situations such as feeling unsafe or experiencing transport cancellations.
- Use available trip information to provide relevant context within the application.

*The current Travel Advisor uses predefined safety guidance rather than a live generative AI service.*

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| Vite | Development server and production build |
| JavaScript | Application logic |
| HTML and CSS | Structure and styling |
| Leaflet | Interactive maps |
| OpenStreetMap | Map data |
| Overpass API | Geospatial facility queries, if configured |
| Nominatim | Geocoding and location search, if configured |
| Browser Local Storage | Persisting selected user data locally |
| Git and GitHub | Version control and source-code hosting |

External services are subject to their availability, usage policies, and terms.

---

## 📁 Project Structure

EXIT PLAN AI uses a component-based React architecture, with separate directories for pages, reusable components, services, data, and styling.

> Verify the filenames and directories below against the actual repository before submission.

```text
exit-plan-ai/
├── public/                       # Static assets
├── src/
│   ├── components/               # Reusable UI components
│   │   └── common/               # Shared interface components
│   ├── data/                     # Predefined safety scenarios
│   ├── pages/                    # Main application pages
│   │   ├── Assistant.jsx         # Travel Advisor
│   │   ├── AssistanceMap.jsx     # Safe Havens map
│   │   └── MessageScanner.jsx    # Scam Shield
│   ├── services/                 # Application logic and services
│   │   ├── api.js                # Optional API helper functions
│   │   ├── safeHavensService.js  # Facility search functionality
│   │   └── scamDetector.js       # Rule-based scam detection
│   └── styles/                   # Application styles
├── .env.example                  # Example environment configuration
├── .gitignore                    # Files excluded from Git
├── index.html                    # Application HTML entry point
├── package.json                  # Dependencies and npm scripts
├── package-lock.json             # Locked dependency versions
├── vite.config.js                # Vite configuration
└── README.md                     # Project documentation
```

### Directory Overview

- **`src/components/`** — Reusable interface components.
- **`src/pages/`** — Main application pages and feature interfaces.
- **`src/services/`** — Services for facility searches and local scam detection.
- **`src/data/`** — Predefined safety scenarios used by the Travel Advisor.
- **`src/styles/`** — Application styling.
- **`public/`** — Static assets served by Vite.

---

## 🧠 AI Implementation and Architecture

EXIT PLAN AI currently combines locally executed detection rules, predefined safety guidance, browser storage, and external mapping services.

- **Scam Shield:** Uses locally executed rules to identify suspicious message patterns.
- **Travel Advisor:** Provides predefined safety guidance for selected scenarios.
- **Safe Havens:** Uses external geospatial services to support location and facility searches.
- **Local data storage:** Selected trip and safety information is stored in the browser.

The current implementation does not require a dedicated application backend or connect to a live generative AI service.

AI-powered development tools assisted during development. Their use does not mean that every application feature is powered by an AI model.

---

## 🏗️ Architecture Overview

The application runs primarily in the user's browser.

**React Interface → Local Application Logic → Browser Storage and External Mapping Services**

- React components provide the user interface.
- Local JavaScript logic handles application features, including rule-based scam analysis.
- Browser Local Storage persists selected information.
- External geospatial services support relevant map and facility searches.

The current implementation does not require a dedicated application backend.

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/adithiach06/exit-plan-ai.git
```

**2. Navigate to the project directory**

```bash
cd exit-plan-ai
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL displayed in your terminal, typically `http://localhost:5173/`.

### Production Build

To create a production build, run:

```bash
npm run build
```

Vite generates the production files in the `dist` directory.

To preview the production build locally, run:

```bash
npm run preview
```

---

## 📱 Mobile Compatibility

EXIT PLAN AI is a browser-based application that can be accessed on compatible desktop and mobile browsers.

The interface has undergone basic mobile-layout testing.

The current implementation is a web application, not a native Android or iOS application. Performance and feature availability may vary depending on the device, browser, network connection, and external services.

---

## 🔒 Privacy and Security Considerations

- Scam message analysis is performed locally by the current rule-based implementation.
- Selected trip and safety information is stored in browser Local Storage.
- External mapping and geospatial services may receive queries necessary to provide their functionality.
- Browser Local Storage is not encrypted storage and should not be treated as a secure vault for highly sensitive information.
- The application does not currently provide automatic emergency dispatch or continuous location tracking.
- Users should independently verify critical safety information and emergency contact details.

**Security note:** Never commit private API keys, passwords, access tokens, or other secrets to the repository. The `.env.example` file is intended for example configuration only.

---

## ⚠️ Current Limitations

EXIT PLAN AI is a working prototype, and several limitations should be considered:

1. The Travel Advisor uses predefined guidance rather than live generative AI.
2. Scam Shield uses rules and patterns; it may produce false positives or miss sophisticated scams.
3. New Safe Havens searches depend on internet connectivity and external service availability.
4. Map results depend on the completeness and accuracy of available geospatial data.
5. Selected information is stored in browser Local Storage and may not synchronise across devices.
6. SOS Help provides contact options and message preparation but does not automatically contact emergency services.
7. Safety recommendations are decision-support information and cannot guarantee personal safety.

---

## 🔮 Future Enhancements

Potential future improvements include:

- Integrating a securely implemented AI backend for more flexible travel guidance.
- Improving scam detection using additional validated detection techniques.
- Enhancing offline access to essential safety resources.
- Adding optional location-sharing workflows with explicit user consent.
- Improving accessibility and mobile usability.
- Expanding language support for Indian travellers.
- Introducing additional privacy and data-protection safeguards.

These are proposed enhancements, not claims about currently implemented functionality.

---

## 🙌 Acknowledgements

EXIT PLAN AI was developed with assistance from AI-powered development tools, including **Google Antigravity** and **ChatGPT by OpenAI**, for development guidance, coding assistance, troubleshooting, and documentation.

The project also uses open-source libraries and external services to support its functionality.

Relevant technologies and resources include:

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)

Third-party libraries, services, datasets, and assets remain subject to their respective licences, attribution requirements, and terms of use.

AI tools were used as development aids. Their involvement does not replace the need to understand, test, and review the resulting implementation.

---

## 📌 Project Information

**Project Name:** EXIT PLAN AI

**Category:** Travel Safety and Cybersecurity

**Target Audience:** Solo female travellers, particularly in India

**Application Type:** React-based web application

**Source Code:**  
https://github.com/adithiach06/exit-plan-ai

**Live Demo:** Add your deployed website URL here once deployment is complete.

---

## ❤️ Our Vision

We believe that better preparation can help travellers make more informed decisions when unexpected situations arise.

EXIT PLAN AI aims to make safety planning, digital awareness, and access to practical guidance more accessible, helping travellers feel better prepared when Plan A fails.

**Because when Plan A fails, you're not out of options.**
