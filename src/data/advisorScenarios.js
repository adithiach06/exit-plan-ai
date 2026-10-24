/**
 * Structured Scenario Guidance for EXIT PLAN AI Safety Assistant
 * Tailored specifically for solo female travellers navigating India.
 */

export const ADVISOR_SCENARIOS = [
  {
    id: 'transport-disruption',
    number: 1,
    title: 'Cancelled or delayed transport',
    summary: 'Stranded at a railway station, bus terminus, or airport due to unexpected cancellations or multi-hour delays.',
    category: 'Transit Resilience',
    iconName: 'TrainIcon',
    immediatePriority: 'Remain inside verified passenger waiting halls (such as IRCTC Executive/First Class lounges or airport terminal buildings). Never exit into unlit station approaches or accept unmetered rides from unverified touts.',
    stepByStepActions: [
      'Locate the official station superintendent, ticket supervisor, or airline assistance counter immediately to receive official cancellation endorsement or a Ticket Deposit Receipt (TDR).',
      'For Indian Railways, open the official RailMadad app or consult the enquiry counter to identify alternative express trains running on the same corridor.',
      'Inform your trusted emergency contact of the delay, your exact location inside the terminal, and your intended contingency transit.',
      'If transit is delayed overnight, book verified station retiring rooms (IRCTC) or an airport transit hotel rather than searching for street-side lodges after dark.'
    ],
    practicalBackupOptions: [
      'Consult the government state road transport corporation (SRTC) depot for daytime express bus options.',
      'Inquire about Tatkal or Premium Tatkal quota berths on alternative trains heading toward your destination.',
      'Wait out late-night hours inside the station’s guarded 24/7 upper-class waiting lounge until daybreak.'
    ],
    thingsToAvoid: [
      'Do not accept private, unmarked cabs or follow touts claiming "all trains/buses are cancelled for days."',
      'Do not wait on isolated platform ends or deserted areas outside terminal boundaries.',
      'Do not surrender your original ticket or ID card to anyone other than uniformed railway or airline staff.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'Railway Protection Force (RPF)', number: '139', note: 'Security assistance on Indian trains and platforms' },
        { name: 'Women Helpline (All India)', number: '1091', note: 'Police distress support for women' },
        { name: 'Incredible India Tourist Helpline', number: '1363', note: '24/7 multi-language tourist transit guidance' }
      ],
      guidance: 'In case of harassment or immediate physical danger on station premises, dial 112 or notify station RPF personnel immediately.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { startingLocation, destination, transportMethod } = itinerary;
      return `For your planned journey from ${startingLocation || 'origin'} to ${destination || 'destination'} via ${transportMethod || 'transit'}, check official ${transportMethod === 'Train' ? 'IRCTC / RailMadad' : transportMethod === 'Flight' ? 'airline flight status boards' : 'state transport depots'} for alternative departures.`;
    }
  },
  {
    id: 'accommodation-unsafe',
    number: 2,
    title: 'Accommodation cancelled or unsafe',
    summary: 'Hotel reservation cancelled upon arrival, property does not match listing, or the surrounding environment feels isolated, dirty, or unsafe.',
    category: 'Safe Shelter',
    iconName: 'MapPinIcon',
    immediatePriority: 'Do not check in, do not enter rooms alone, and do not surrender your original ID documents. Step back to a well-lit, populated commercial area.',
    stepByStepActions: [
      'Decline check-in politely but firmly. Keep your luggage firmly in hand and step outside to a populated public space (e.g. a branded cafe, 24/7 fuel station convenience store, or transit hub).',
      'Contact your booking platform’s emergency escalation desk immediately to demand verified relocation or refund endorsement.',
      'Search for established, verified national chain hotels (e.g. Ginger, Lemon Tree, Taj, Ibis) or government circuit houses and inspection bungalows.',
      'Send a live GPS location pin and the name of the new property you are heading toward to your emergency contact.'
    ],
    practicalBackupOptions: [
      'If arriving late at night without verified rooms, retreat to the nearest major railway station executive lounge or airport terminal, which have round-the-clock security and passenger amenities.',
      'Look for verified women-friendly backpacker hostels (e.g. Zostel, goSTOPS) with staffed 24-hour reception desks and keycard security.'
    ],
    thingsToAvoid: [
      'Do not accept room recommendations from auto or taxi drivers claiming to know "safe, cheap private homestays."',
      'Do not accept rooms where external door latches or internal window locks are broken, or where staff demand keeping your physical passport/ID overnight.',
      'Do not search for accommodation on your phone while standing in deserted or poorly lit alleyways.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'Women in Distress Helpline', number: '181', note: 'National Commission 24/7 crisis guidance and safe shelter referrals' },
        { name: 'Women Helpline (Police)', number: '1091', note: 'Immediate police response' }
      ],
      guidance: 'If accommodation staff attempt to intimidate, detain, or extort you, dial 112 immediately.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { accommodation, destination } = itinerary;
      if (accommodation) {
        return `Your itinerary listed "${accommodation}" in ${destination || 'destination'}. If this property is compromised, switch to your pre-identified 24-hour backup stay within 2 km of ${destination}.`;
      }
      return `For your trip to ${destination || 'your destination'}, prioritize verified hotels in central, well-connected commercial areas rather than isolated outskirts.`;
    }
  },
  {
    id: 'feeling-unsafe',
    number: 3,
    title: 'Feeling unsafe or being followed',
    summary: 'Sensing suspicious attention, noticing an individual trailing you on foot or transit, or feeling unsafe in your immediate surroundings.',
    category: 'Immediate Personal Safety',
    iconName: 'AlertIcon',
    immediatePriority: 'Break isolation immediately. Move promptly toward visible authority figures, groups of female commuters, or staffed commercial establishments.',
    stepByStepActions: [
      'Change direction immediately toward a crowded, well-illuminated establishment (such as a busy chemist, supermarket, restaurant, or metro station ticket concourse).',
      'Make a clear phone call (or simulate one), speaking clearly: "I am right outside [Landmark/Shop name], see you in one minute."',
      'Approach a shopkeeper, security guard, or family and state plainly: "Someone is following me, please allow me to stand inside with you."',
      'Activate your phone’s emergency SOS broadcast and transmit your live location to your emergency contact.'
    ],
    practicalBackupOptions: [
      'Book a verified app-based cab (Uber or Ola) from inside a staffed building, verify driver photo and license plate before boarding, and share the live ride status.',
      'In a metro or railway station, step directly into the dedicated Women’s Coach or approach the station control room.'
    ],
    thingsToAvoid: [
      'Do not take shortcuts through poorly lit parks, unpaved alleyways, or quiet residential lanes to "get away quicker."',
      'Do not confront the individual directly in an isolated setting.',
      'Do not lead the person to your private hotel room or stay; direct yourself toward a public authority outpost first.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'National Emergency Number', number: '112', note: 'Unified 24/7 emergency dispatch across all Indian states' },
        { name: 'Women Helpline', number: '1091', note: 'Immediate police response for women in distress' },
        { name: 'Railway Protection Force', number: '139', note: 'Emergency assistance on trains and platforms' }
      ],
      guidance: 'In any situation involving imminent danger, call 112 immediately. Speak loudly and clearly so bystanders understand you are reporting your coordinates.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { emergencyContactName, emergencyContactPhone, destination } = itinerary;
      if (emergencyContactName) {
        return `Your emergency contact is ${emergencyContactName} (${emergencyContactPhone || 'phone saved'}). Use your phone’s quick SMS shortcut to transmit your coordinates in ${destination || 'transit'}.`;
      }
      return `If travelling in ${destination || 'your destination'}, note the nearest Mahila Police Helpdesk or major public transport terminal.`;
    }
  },
  {
    id: 'battery-connectivity',
    number: 4,
    title: 'Low phone battery or lost connectivity',
    summary: 'Phone battery dropping below 10%, no mobile network in remote hilly/rural terrain, or data connection failing during travel.',
    category: 'Technical Resilience',
    iconName: 'WifiOffIcon',
    immediatePriority: 'Conserve remaining battery power immediately. Switch your device to Ultra Battery Saver or Airplane Mode to preserve charge for emergency calling.',
    stepByStepActions: [
      'Reduce screen brightness to minimum, disable GPS, Bluetooth, and Wi-Fi scanning, and close all background applications.',
      'If under 5% battery, send one concise SMS to your emergency contact: "Low battery (4%). At [Location]. Heading to [Destination]. Safe." Then power the device off until needed.',
      'Head to the nearest transit terminal, cafe, or hotel lobby and ask to plug in your charger or use a power outlet.',
      'Refer to your physical paper safety card or printed itinerary for essential phone numbers, addresses, and transit routes.'
    ],
    practicalBackupOptions: [
      'Use a public telephone booth or ask a reputable hotel reception or shopkeeper to place a brief check-in call to your family.',
      'Look for public USB charging stations located in metro stations, airports, and major railway waiting halls.'
    ],
    thingsToAvoid: [
      'Do not drain the last percentage of battery browsing social media or attempting non-essential tasks.',
      'Do not leave your phone unattended at charging kiosks in crowded public areas.',
      'Do not venture into remote rural or mountain trails without having noted key landmarks on physical paper.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'National Emergency', number: '112', note: 'Can be dialed from any GSM phone even with low signal or without a SIM card' }
      ],
      guidance: 'Emergency number 112 is accessible on mobile networks even when you have no mobile data, call balance, or when roaming networks.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { destination } = itinerary;
      return `Ensure you keep your printed safety plan for ${destination || 'your trip'} in your daypack, containing offline hotel addresses in regional script.`;
    }
  },
  {
    id: 'lost-documents',
    number: 5,
    title: 'Lost documents, money, or phone',
    summary: 'Misplaced wallet, stolen handbag, or missing passport, Aadhaar, payment cards, or smartphone.',
    category: 'Identity & Financial Security',
    iconName: 'LockIcon',
    immediatePriority: 'Secure your financial accounts and prevent identity fraud. Block all payment cards and UPI facilities immediately.',
    stepByStepActions: [
      'Call your bank’s 24/7 toll-free helpline from any available phone to freeze all debit cards, credit cards, and net-banking access.',
      'If your phone was lost, immediately block your SIM card through your telecom provider (Jio, Airtel, Vi) to prevent unauthorized UPI or OTP access.',
      'Visit the nearest local police station or Government Railway Police (GRP) booth to lodge a Lost Property Report (or file an e-FIR). A stamped report copy is legally required for duplicate SIM/ticket issuance.',
      'Access digital backup copies of your ID (Aadhaar, Passport) from Digilocker or retrieve laminated photocopies from your luggage.'
    ],
    practicalBackupOptions: [
      'Use your emergency reserve cash stored separately in your secondary bag or hidden waist pouch.',
      'Have a family member transfer emergency funds via Western Union or to a trusted hotel management desk who can disburse funds upon verification.'
    ],
    thingsToAvoid: [
      'Do not delay reporting missing payment cards or SIM cards—cyber fraudsters act within minutes.',
      'Do not carry all original documents, credit cards, and cash in a single purse or handbag.',
      'Do not pay bribes or unofficial fees for filing a lost article police report.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'National Cyber Crime Reporting', number: '1930', note: 'Report unauthorized UPI transfers and financial fraud immediately' },
        { name: 'National Emergency Number', number: '112', note: 'Police dispatch and assistance' }
      ],
      guidance: 'If financial fraud or unauthorized transactions occur following document or phone loss, dial 1930 immediately to freeze accounts.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { destination } = itinerary;
      return `For your trip to ${destination || 'your destination'}, rely on the offline copies stored separately in your secondary bag as planned in your Safety Checklist.`;
    }
  },
  {
    id: 'suspicious-payment',
    number: 6,
    title: 'Unexpected or suspicious payment request',
    summary: 'Demands for inflated cash from drivers, fake hotel UPI QR codes sent over WhatsApp, or unauthorized "tourist tax" claims.',
    category: 'Cybersecurity & Fraud Prevention',
    iconName: 'ShieldIcon',
    immediatePriority: 'Do not scan unknown QR codes, do not enter your UPI PIN, and do not make off-platform payments under duress.',
    stepByStepActions: [
      'If a hotel claims your booking was cancelled and sends a WhatsApp link or QR code for "immediate advance payment", pause. Call the official property phone number listed on your original booking confirmation.',
      'If a cab or auto driver demands inflated cash above the agreed metered or app fare, insist on paying strictly through the official rideshare app or prepaid booth receipt.',
      'Request an official, stamped tax invoice for any claimed government entry or tourist processing fees. Genuine authorities always provide a printed receipt.',
      'Take a discreet photo or screenshot of the payment request, vehicle number plate, or phone number.'
    ],
    practicalBackupOptions: [
      'Offer to settle any fare dispute in front of the nearest traffic police booth or station master’s office.',
      'Pay with cash only if an official physical receipt is issued and you have verified the service with station staff.'
    ],
    thingsToAvoid: [
      'Never enter your 4-digit or 6-digit UPI PIN to "receive" a refund or cashback. Entering a PIN always authorizes money leaving your account.',
      'Do not pay private individuals posing as "tourist police" without verifying official credentials.',
      'Do not engage in heated shouting matches in isolated streets; suggest moving to an official booth.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'Cyber Crime Helpline', number: '1930', note: 'Report travel phishing, fake booking QR scams, and fraud' },
        { name: 'National Emergency', number: '112', note: 'Police assistance in cases of extortion or intimidation' }
      ],
      guidance: 'For suspicious travel-related cyber fraud or advance UPI scams, report immediately to 1930 or cybercrime.gov.in.'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { accommodation, transportMethod } = itinerary;
      return `Be particularly cautious of third-party messages claiming to represent ${accommodation || 'your booked hotel'} or off-platform payment requests for your ${transportMethod || 'transit'}.`;
    }
  },
  {
    id: 'alternative-route',
    number: 7,
    title: 'Need an alternative travel plan',
    summary: 'Blocked highways, sudden rail cancellations, severe weather (monsoon landslides/winter fog), or needing to divert to a safer route.',
    category: 'Route Adaptation',
    iconName: 'CompassIcon',
    immediatePriority: 'Pause your journey in a verified transit hub or secure city before attempting untested detours.',
    stepByStepActions: [
      'Check official regional advisories: Indian Meteorological Department (IMD) for weather alerts, state traffic police handles for road closures, and IRCTC for rail diversions.',
      'If travelling by road in mountain or coastal corridors, consult government transport depots before boarding private taxis.',
      'Review your pre-identified Plan B checkpoints and secondary accommodation in the Safety Planner.',
      'Re-route toward major arterial transit corridors (e.g. National Highways or main rail trunk lines) which have frequent police patrols and 24/7 facilities.'
    ],
    practicalBackupOptions: [
      'Switch from road transit to express rail if mountain highways or rural roads are compromised by landslides or weather.',
      'Re-book into a central district headquarters hotel rather than proceeding to isolated outposts during active disruption.'
    ],
    thingsToAvoid: [
      'Do not attempt unpaved mountain bypasses or night driving during heavy monsoon rains or dense fog.',
      'Do not rely on unverified advice from local touts claiming roads are clear when official police channels advise closure.',
      'Do not travel into unfamiliar rural detours without sharing your updated itinerary with family.'
    ],
    officialHelp: {
      emergencyNumber: '112',
      helplines: [
        { name: 'State Disaster Management', number: '1070', note: 'Natural disaster and major road block information' },
        { name: 'Incredible India Tourist Helpline', number: '1363', note: '24/7 regional transit guidance' }
      ],
      guidance: 'In situations of natural disaster, flash floods, or road collapse, dial 112 or State Disaster Management (1070).'
    },
    getContextualNotes: (itinerary) => {
      if (!itinerary) return null;
      const { startingLocation, destination } = itinerary;
      return `For your route from ${startingLocation || 'origin'} to ${destination || 'destination'}, refer to your saved Plan B contingency notes in the Safety Planner.`;
    }
  }
];
