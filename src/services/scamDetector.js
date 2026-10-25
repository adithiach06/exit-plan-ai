/**
 * Scam Shield - Deterministic Threat Analysis Engine for EXIT PLAN AI
 * Evaluates suspicious travel communications locally in the browser without remote uploads.
 * Privacy-first: No external API calls, zero tracking, no localStorage persistence.
 */

// Sample travel messages for interactive testing and demonstration
export const SAMPLE_MESSAGES = [
  {
    id: 'sample-otp-phishing',
    title: 'IRCTC Train Cancellation Phishing',
    category: 'Critical Risk Alert',
    tag: 'Critical • 100/100',
    riskLevel: 'Critical',
    text: 'URGENT IRCTC UPDATE: Train #12952 (Mumbai Rajdhani) has been cancelled due to emergency track maintenance. To claim your full refund or re-book guaranteed berth immediately, visit http://irctc-refund-portal.xyz/claim and share the 6-digit OTP sent to your mobile. If OTP is not submitted within 10 minutes, refund will be permanently forfeited.'
  },
  {
    id: 'sample-hotel-upi',
    title: 'Hotel Manager Personal UPI Advance Demand',
    category: 'High Risk Alert',
    tag: 'High • 70/100',
    riskLevel: 'High',
    text: 'Dear Guest, this is manager Sharma from Grand Heritage Resort Manali regarding your reservation tomorrow. Our booking software is undergoing emergency audit. Please pay 50% advance (Rs 3,500) within 15 minutes to our accountant personal UPI ID hotelmanager.manali@okaxis to confirm your check-in. Otherwise your room will be automatically cancelled and given to waiting guests.'
  },
  {
    id: 'sample-discount-bypass',
    title: 'WhatsApp 85% Luxury Stay & Platform Bypass',
    category: 'Medium Risk Alert',
    tag: 'Medium • 45/100',
    riskLevel: 'Medium',
    text: 'Exclusive Holiday Offer! Congratulations, you have been selected for an unbelievable 85% discount at 5-star Goa Luxury Beach Villas for 4 nights. Don’t book on Booking.com or Airbnb to save heavy platform commission tax. Message us directly on WhatsApp to pay offline via Google Pay and claim your VIP holiday voucher: https://bit.ly/goa-vip-offer-deal'
  },
  {
    id: 'sample-police-coercion',
    title: 'Police & Customs Digital Arrest Extortion',
    category: 'Critical Risk Alert',
    tag: 'Critical • 100/100',
    riskLevel: 'Critical',
    text: 'URGENT POLICE NOTICE: A parcel containing contraband linked to your Aadhaar card has been seized at Mumbai Airport Customs. An arrest warrant and FIR have been registered by Cyber Crime Branch. To clear your name and avoid immediate arrest at your hotel, connect on WhatsApp video call now and transfer Rs 25,000 security deposit to verification account police.clearance@sbi.'
  },
  {
    id: 'sample-location-driver',
    title: 'Unverified Driver Requesting Live Location & Advance',
    category: 'High Risk Alert',
    tag: 'High • 68/100',
    riskLevel: 'High',
    text: 'Madam, I am your private cab driver sent for airport pickup. My app GPS is not working properly. Please share your WhatsApp live location immediately and text me your exact hotel room number. Also please send Rs 800 fuel advance to my personal phone number 9876543210 on PhonePe before I start.'
  },
  {
    id: 'sample-normal-booking',
    title: 'Standard Flight / Rail Confirmation',
    category: 'Low Risk Indicator',
    tag: 'Low • 0/100',
    riskLevel: 'Low',
    text: 'Booking Confirmed: PNR 425-8910245. Flight AI-803 from New Delhi (DEL) T3 to Bengaluru (BLR) T2 on 15 Nov 2026. Departure: 06:15 AM. Check-in baggage: 15kg. Manage your booking or web check-in via official website https://www.airindia.com or call 24x7 customer support at 1860-233-1407. Have a pleasant journey.'
  }
];

/**
 * Educational / Negation patterns.
 * Official safety alerts frequently contain keywords like OTP or PIN,
 * but in a cautionary context ("Never share your OTP", "IRCTC never asks for PIN").
 */
const EDUCATIONAL_NEGATION_PATTERNS = [
  /\b(?:never|do not|don't|should not|never ever)\s+(?:share|disclose|reveal|give|tell|enter|transfer|pay)\b.{0,40}\b(?:otp|pin|password|cvv|code|money|advance|fund)\b/i,
  /\b(?:beware of|alert:|warning:|safety advisory:|caution:)\b.{0,50}\b(?:fake|fraud|scam|impostor|unauthorized|touts|phishing)\b/i,
  /\b(?:official(?:ly)?|police|irctc|bank)\s+(?:never\s+asks?|never\s+calls?|will\s+never\s+ask)\b/i
];

/**
 * Checks whether an incoming message is genuinely an official educational advisory.
 * Must have advisory language AND NOT contain scammer calls-to-action (like clicking bit.ly or paying to a personal UPI).
 */
const isEducationalSafetyAdvisory = (text) => {
  const hasAdvisoryMarker = EDUCATIONAL_NEGATION_PATTERNS.some((pat) => pat.test(text));
  if (!hasAdvisoryMarker) return false;

  // If it also contains an active demand to transfer money or click a shortened/spoofed link, it's NOT an advisory!
  const hasCallToAction =
    /\b(?:transfer|send|pay)\s+(?:rs\.?|inr|\d+)\s+to\b/i.test(text) ||
    /\b(?:bit\.ly|tinyurl|t\.co)\b/i.test(text) ||
    /\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc-|booking-)[a-zA-Z0-9_\-]*\.[a-z]{2,}\b/i.test(text);

  return !hasCallToAction;
};

/**
 * Checks whether a message is an ordinary legitimate travel confirmation.
 * E.g. Standard PNR receipts with official contact info and no coercive requests.
 */
const isLegitimateBookingConfirmation = (text) => {
  const hasBookingIdentifiers = /\b(?:pnr(?:\s*(?:no|number|:))?\s*[:#]?\s*\d{3}[-\s]?\d{7}|\bflight\s+[a-z]{2}[-\s]?\d{3,4}\b|train\s+#?\d{4,5})\b/i.test(text);
  const hasOfficialContact = /\b(?:https:\/\/(?:www\.)?(?:irctc\.co\.in|airindia\.com|makemytrip\.com|goindigo\.in|booking\.com)|1800[-\s]?\d+|1860[-\s]?\d+|help(?:desk|line)\s*(?:at\s*)?139)\b/i.test(text);
  
  // Must NOT contain personal UPI, urgency, OTP requests, or threats
  const hasCoercion = /\b(?:within\s+\d+\s+min|pay immediately|cancel(?:led)? immediately unless|send otp|share otp|personal upi|@[a-z]+)\b/i.test(text);

  return hasBookingIdentifiers && hasOfficialContact && !hasCoercion;
};

/**
 * Threat detection rules matrix with targeted regex patterns, category labels,
 * severity ratings, base weights, and contextual "why it matters" explanations.
 */
const THREAT_RULES = [
  // 1. Critical Credential & Sensitive Banking Traps
  {
    id: 'credential_otp_trap',
    category: 'Credential Theft',
    severity: 'critical',
    weight: 35,
    title: 'Request for One-Time Password (OTP) or Verification Code',
    description: 'Legitimate travel operators, banks, and IRCTC never ask passengers to share OTPs over text, phone, or forms.',
    whyItMatters: 'Sharing a one-time verification code grants fraudsters immediate authorization to drain your bank account, access your booking accounts, or hijack your mobile identity.',
    pattern: /\b(?:share|send|enter|provide|submit|give|verify)\b.{0,35}\b(?:otp|one[- ]time password|verification code|security code|auth code|6[- ]digit code|4[- ]digit code)\b|\b(?:otp|code)\b.{0,25}\b(?:will be forfeited|required to process|for refund|to confirm)\b/i,
    extractRegex: /\b(?:(?:share|send|enter|provide|submit|give|verify)\s+[^.,\n]{0,35}\b(?:otp|one[- ]time password|verification code|security code|6[- ]digit code|4[- ]digit code)|(?:otp|verification code)\s+[^.,\n]{0,25}\b(?:forfeited|required|refund|confirm))\b/i
  },
  {
    id: 'credential_pin_cvv',
    category: 'Financial Credential Harvest',
    severity: 'critical',
    weight: 35,
    title: 'Request for UPI PIN, MPIN, ATM PIN, or Card CVV',
    description: 'You NEVER need to enter a UPI PIN or provide a CVV to receive money or refunds.',
    whyItMatters: 'In the Indian Unified Payments Interface (UPI) architecture, entering a PIN is strictly for DEBITING (sending) money. Any claim that a PIN is needed to "receive" a refund is an active theft attempt.',
    pattern: /\b(?:upi pin|mpin|atm pin|cvv|card expiry|net banking password|debit card pin|credit card pin)\b/i,
    extractRegex: /\b(?:upi pin|mpin|atm pin|cvv|card expiry|net banking password|debit card pin|credit card pin)\b/i
  },
  {
    id: 'remote_access_malware',
    category: 'Device Compromise Risk',
    severity: 'critical',
    weight: 35,
    title: 'Request to Install Remote-Access Software or Unknown APK',
    description: 'Fraudsters impersonate customer support to convince travellers to install screen-sharing software or third-party APK packages.',
    whyItMatters: 'Remote desktop applications give attackers full viewing and control access over your smartphone, allowing them to intercept incoming SMS OTPs and control banking applications silently.',
    pattern: /\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen[- ]?share|remote desktop|ultraviewer|download (?:\.apk|app from link)|install apk)\b/i,
    extractRegex: /\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen[- ]?share|remote desktop|ultraviewer|download (?:\.apk|app from link)|install apk)\b/i
  },

  // 2. Urgent Booking Cancellation & Forfeiture Pressure
  {
    id: 'urgent_cancellation_threat',
    category: 'Coercive Cancellation Pressure',
    severity: 'high',
    weight: 22,
    title: 'Urgent Booking Cancellation or Forfeiture Threat',
    description: 'Threatening that your accommodation, train reservation, or flight will be cancelled or given to others unless immediate action is taken.',
    whyItMatters: 'Creating the illusion of an imminent booking cancellation causes panic, forcing travellers to make unverified payments before they can verify details with the official provider.',
    pattern: /\b(?:booking (?:will be )?(?:cancelled|released|forfeited)|room (?:will be )?(?:automatically )?(?:cancelled|released|given to waiting guests)|reservation (?:will be )?(?:cancelled|released)|cancel(?:led)? immediately unless|auto(?:matically)? cancel(?:led)? within|forfeited within|cancelled within \d+|avoid cancellation)\b/i,
    extractRegex: /\b(?:booking (?:will be )?(?:cancelled|released|forfeited)|room (?:will be )?(?:automatically )?(?:cancelled|released|given to waiting guests)|reservation (?:will be )?(?:cancelled|released)|cancel(?:led)? immediately unless|auto(?:matically)? cancel(?:led)? within|forfeited within|cancelled within \d+|avoid cancellation)\b/i
  },
  {
    id: 'urgency_deadline',
    category: 'Artificial Urgency & Panic Induction',
    severity: 'high',
    weight: 20,
    title: 'Artificial Time Pressure or Countdown Deadline',
    description: 'Imposing strict, short countdown windows (e.g. 10–20 minutes, "act now", "pay immediately") to pressure the traveller.',
    whyItMatters: 'Cognitive urgency suppresses rational scrutiny. Genuine hotels and transit operators do not cancel paid reservations on a 15-minute countdown without formal email notice.',
    pattern: /\b(?:within\s+(?:\d{1,2}|ten|fifteen|twenty|thirty)\s+(?:minutes?|mins?|hours?)|pay immediately|act now|immediate(?:ly)? pay(?:ment)?|before midnight|urgent action required|pay now or|video call now|urgent update|urgent notice)\b/i,
    extractRegex: /\b(?:within\s+(?:\d{1,2}|ten|fifteen|twenty|thirty)\s+(?:minutes?|mins?|hours?)|pay immediately|immediate(?:ly)? pay(?:ment)?|pay now or|before midnight|urgent action required|video call now|urgent update|urgent notice)\b/i
  },

  // 3. Legal Coercion & Digital Arrest Extortion
  {
    id: 'coercive_threats',
    category: 'Legal Coercion & Authority Extortion',
    severity: 'critical',
    weight: 35,
    title: 'Threats of Arrest, Police Warrants, or Legal Action',
    description: 'Intimidation messages claiming customs detention, narcotics investigations, or police warrants designed to coerce immediate payment.',
    whyItMatters: 'Scammers frequently execute "digital arrest" scams against travellers. Genuine Indian law enforcement agencies (Police, CBI, ED) never demand money transfers over WhatsApp or telephone to resolve cases.',
    pattern: /\b(?:police warrant|arrest warrant|non[- ]bailable warrant|under arrest|will be arrested|immediate arrest|avoid arrest|fir (?:has been |is )?registered|criminal case (?:registered|filed)|custodial (?:interrogation|remand)|detained at airport|customs detention|digital arrest|court notice|court summons|immigration penalty|legal action will be taken|urgent police notice)\b/i,
    extractRegex: /\b(?:police warrant|arrest warrant|non[- ]bailable warrant|under arrest|will be arrested|immediate arrest|avoid arrest|fir (?:has been |is )?registered|criminal case (?:registered|filed)|custodial (?:interrogation|remand)|detained at airport|customs detention|digital arrest|court notice|court summons|immigration penalty|legal action will be taken|urgent police notice)\b/i
  },
  {
    id: 'da_call_coercion',
    category: 'Digital Arrest & Call Coercion',
    severity: 'critical',
    weight: 35,
    title: 'Instructions Not to Disconnect or Stay on Video Call',
    description: 'Coercive orders demanding you remain continuously on a video or voice call, keep your camera on, stay in isolation, or not disconnect.',
    whyItMatters: 'In digital arrest scams, fraudsters pose as police on video calls and forbid victims from disconnecting to isolate them from help. Real Indian police or courts NEVER place citizens under "digital arrest" or conduct interrogations over WhatsApp/Skype.',
    pattern: /\b(?:(?:do not|don't)\s+(?:disconnect|cut|end|hang up)\s+(?:the )?(?:call|video call|phone)|(?:stay|remain|connect)\s+(?:on|connected to)\s+(?:the )?(?:video call|call|skype|whatsapp call)|connect on (?:whatsapp )?video call|video call now|keep (?:your )?camera on|virtual (?:custody|interrogation)|digital custody|(?:do not|don't)\s+(?:inform|tell|contact)\s+(?:anyone|family|lawyer|friends)|strict confidentiality under (?:the )?official secrets act)\b/i,
    extractRegex: /\b(?:(?:do not|don't)\s+(?:disconnect|cut|end|hang up)\s+(?:the )?(?:call|video call|phone)|(?:stay|remain|connect)\s+(?:on|connected to)\s+(?:the )?(?:video call|call|skype|whatsapp call)|connect on (?:whatsapp )?video call|video call now|keep (?:your )?camera on|virtual custody|digital custody|(?:do not|don't)\s+(?:inform|tell|contact)\s+(?:anyone|family|lawyer|friends))\b/i
  },
  {
    id: 'da_avoid_arrest_payment',
    category: 'Extortion & Payment to Avoid Arrest',
    severity: 'critical',
    weight: 35,
    title: 'Demand for Payment or Deposit to Avoid Arrest',
    description: 'Demands for money, "security deposits", "bail bonds", or "verification transfers" to avoid arrest, halt a warrant, or clear your name.',
    whyItMatters: 'Demanding payment to avoid arrest is criminal extortion. Genuine Indian law enforcement and judicial authorities NEVER ask for payments, deposits, or transfers over phone or messaging apps to clear an individual from criminal charges.',
    pattern: /\b(?:(?:pay|transfer|deposit|send)\b.{0,45}\b(?:to avoid (?:immediate )?arrest|to clear (?:your )?name|security deposit|bail (?:amount|deposit|bond)?|clearance (?:deposit|fee|account)|verification (?:account|fee|deposit)|escrow account|rbi (?:verification|clearance)|avoid legal action)\b|(?:to avoid (?:immediate )?arrest|to clear (?:your )?name|to (?:halt|cancel|stop) (?:the )?warrant)\b.{0,45}\b(?:pay|transfer|deposit|send)\b)\b/i,
    extractRegex: /\b(?:(?:pay|transfer|deposit|send)\s+[^.,\n]{0,45}\b(?:to avoid (?:immediate )?arrest|to clear (?:your )?name|security deposit|bail|clearance|verification account|escrow account|rbi verification|avoid legal action)|(?:to avoid (?:immediate )?arrest|to clear (?:your )?name|to (?:halt|cancel|stop) (?:the )?warrant)\s+[^.,\n]{0,45}\b(?:pay|transfer|deposit|send))\b/i
  },
  {
    id: 'da_aadhaar_threat',
    category: 'Identity Implicated in Criminal Offense',
    severity: 'high',
    weight: 25,
    title: 'Aadhaar or Identity Implicated in Criminal Offense',
    description: 'Claims that your Aadhaar card, PAN, or identity documents are tied to illegal shipments, contraband parcels, narcotics, or money laundering.',
    whyItMatters: 'Scammers claim illegal contraband or narcotics were seized in a parcel bearing your Aadhaar to induce panic. Legitimate investigative agencies do not notify citizens of criminal investigations via informal text or chat.',
    pattern: /\b(?:(?:aadhaar|pan card|passport|identity card|sim card|bank account)\b.{0,45}\b(?:linked to|involved in|misused in|found in|registered in|implicated in)\b.{0,40}\b(?:contraband|narcotics|drugs|money laundering|illegal|crime|fraud|terror|smuggling|unauthorized)\b|(?:parcel|consignment|courier|shipment)\b.{0,40}\b(?:linked to|containing|seized with|tagged with)\b.{0,40}\b(?:aadhaar|passport|pan card)\b|(?:aadhaar|pan card)\b.{0,35}\b(?:implicated|blacklisted|frozen by (?:court|police|cbi|ed)|under investigation for crime))\b/i,
    extractRegex: /\b(?:(?:aadhaar|pan card|passport|identity card|sim card)\s+[^.,\n]{0,45}\b(?:linked to|involved in|misused in|found in|registered in|implicated in)\s+[^.,\n]{0,40}\b(?:contraband|narcotics|drugs|money laundering|illegal|crime|fraud|terror|smuggling)|(?:parcel|consignment|courier|shipment)\s+[^.,\n]{0,40}\b(?:linked to|containing|seized with)\s+[^.,\n]{0,40}\b(?:aadhaar|passport|pan card)|(?:aadhaar|pan card)\s+[^.,\n]{0,35}\b(?:implicated|blacklisted|frozen))\b/i
  },
  {
    id: 'da_gov_impersonation',
    category: 'Law Enforcement & Agency Impersonation',
    severity: 'high',
    weight: 18,
    title: 'Impersonation of Police, CBI, ED, or Judicial Authority',
    description: 'Claiming to represent law enforcement, cyber crime cells, customs, or judicial authorities to command trust or induce fear.',
    whyItMatters: 'Impersonating police, CBI, or customs officers makes coercive demands seem authoritative. Genuine police officers do not conduct interrogations or resolve cases over messaging apps.',
    pattern: /\b(?:(?:mumbai|delhi|crime branch|cyber|state)\s+police|police department|cbi(?:\s+headquarters)?|central bureau of investigation|enforcement directorate|\bed\s+office|narcotics control bureau|\bncb\b|customs department|cyber crime (?:branch|cell|department|unit)|trai notice|telecom regulatory authority|supreme court of india|high court notice|cyber cell)\b/i,
    extractRegex: /\b(?:(?:mumbai|delhi|crime branch|cyber|state)\s+police|police department|cbi(?:\s+headquarters)?|central bureau of investigation|enforcement directorate|narcotics control bureau|customs department|cyber crime (?:branch|cell|department|unit)|trai notice|supreme court of india|cyber cell)\b/i
  },
  {
    id: 'suspension_threat',
    category: 'Identity & Account Suspension Threat',
    severity: 'high',
    weight: 20,
    title: 'Threat of Account, SIM, or Identity Document Suspension',
    description: 'Claims that your bank account, SIM card, Aadhaar, or KYC will be permanently blocked unless an immediate action is taken.',
    whyItMatters: 'Creating fear of travel disruption and identity suspension pressures travellers into rushed compliance before checking with official customer care.',
    pattern: /\b(?:account (?:will be )?(?:suspended|blocked|terminated)|kyc (?:expired|blocked|incomplete)|pan (?:card )?blocked|sim (?:card )?deactivated)\b/i,
    extractRegex: /\b(?:account (?:will be )?(?:suspended|blocked|terminated)|kyc (?:expired|blocked|incomplete)|pan (?:card )?blocked|sim (?:card )?deactivated)\b/i
  },

  // 4. Payment Divergence & Off-Platform Routing
  {
    id: 'personal_upi_handle',
    category: 'Unverified Payment Channel',
    severity: 'high',
    weight: 20,
    title: 'Personal UPI ID or Private Payment Request',
    description: 'Directing payment to personal UPI handles (e.g. @okaxis, @ybl, @sbi), personal mobile numbers, or private QR codes.',
    whyItMatters: 'Payments sent to personal UPI IDs lack consumer protection, travel insurance backing, and chargeback mechanisms. Once transferred via UPI, recovery is notoriously difficult.',
    pattern: /\b[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|sbi|icici|hdfcbank|postbank|federal)\b|\b(?:personal upi|send to upi|scan qr code|pay to accountant|gpay to personal|phonepe to personal|transfer to phonepe|transfer to gpay|fuel advance|security deposit|advance payment|pay advance|transfer (?:rs\.?|inr)\s*\d+|(?:send|pay|transfer)\b.{0,30}\b(?:personal phone|phonepe|gpay|paytm))\b/i,
    extractRegex: /\b(?:[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|sbi|icici|hdfcbank|postbank|federal)|personal upi|scan qr code|pay to accountant|gpay to personal|phonepe to personal|transfer to phonepe|transfer to gpay|fuel advance|security deposit|advance payment|pay advance|transfer (?:rs\.?|inr)\s*\d+|(?:send|pay|transfer)\s+[^.,\n]{0,30}\b(?:personal phone|phonepe|gpay|paytm))\b/i
  },
  {
    id: 'platform_bypass',
    category: 'Booking Platform Bypass',
    severity: 'medium',
    weight: 15,
    title: 'Request to Bypass Official Booking Platform',
    description: 'Requests to cancel reservations on trusted platforms (MakeMyTrip, Booking.com, Airbnb) to "save commission" or pay offline.',
    whyItMatters: 'Leaving the platform strips all safety guarantees, verified host accountability, emergency rebooking support, and customer mediation.',
    pattern: /\b(?:cancel on (?:booking\.com|airbnb|makemytrip|agoda|goibibo|oyo)|pay(?:ing)? (?:me )?directly|pay offline|avoid (?:platform|service) (?:fee|commission|tax)|save (?:heavy )?(?:commission|tax)|direct whatsapp deal)\b/i,
    extractRegex: /\b(?:cancel on (?:booking\.com|airbnb|makemytrip|agoda|goibibo|oyo)|pay(?:ing)? (?:me )?directly|pay offline|avoid (?:platform|service) (?:fee|commission|tax)|save (?:heavy )?(?:commission|tax)|direct whatsapp deal)\b/i
  },

  // 5. Physical & Location Privacy Threats (Crucial for Solo Female Travellers)
  {
    id: 'unverified_location_id_harvest',
    category: 'Physical & Location Privacy Risk',
    severity: 'critical',
    weight: 30,
    title: 'Request to Share Live Location, Room Details, or Government ID',
    description: 'Unverified contacts requesting your live WhatsApp location, hotel room number, or unredacted passport/Aadhaar copies over chat.',
    whyItMatters: 'Sharing live location or hotel room numbers with unverified third parties poses direct physical safety and stalking risks for solo travellers. Identity documents can also be exploited for SIM-swap fraud.',
    pattern: /\b(?:share (?:your )?(?:live )?location|send (?:your )?(?:live )?location|whatsapp (?:live )?location|current (?:hotel )?room number|send (?:your )?(?:aadhaar|passport|id proof) (?:copy|photo|on whatsapp))\b/i,
    extractRegex: /\b(?:share (?:your )?(?:live )?location|send (?:your )?(?:live )?location|whatsapp (?:live )?location|current (?:hotel )?room number|send (?:your )?(?:aadhaar|passport|id proof) (?:copy|photo|on whatsapp))\b/i
  },

  // 6. Authority & Brand Impersonation
  {
    id: 'authority_impersonation',
    category: 'Identity & Authority Impersonation',
    severity: 'high',
    weight: 18,
    title: 'Impersonation of IRCTC, Airline, or Hotel Authority',
    description: 'Claiming high administrative authority (e.g., Station Master, Reservation Manager, Airport Helpdesk) to command trust.',
    whyItMatters: 'Impersonating official entities makes deceptive requests seem legitimate. Official personnel will communicate via registered channels, not informal personal numbers.',
    pattern: /\b(?:irctc (?:official|helpdesk|support team)|station master office|railway passenger desk|hotel manager|general manager|chief reservation officer|airport security officer)\b/i,
    extractRegex: /\b(?:irctc (?:official|helpdesk|support team)|station master office|railway passenger desk|hotel manager|general manager|chief reservation officer|airport security officer)\b/i
  },

  // 7. Suspicious Links & Obfuscated Domains
  {
    id: 'url_shortener',
    category: 'Masked Destination Link',
    severity: 'medium',
    weight: 14,
    title: 'Shortened or Obfuscated Web Link',
    description: 'Shortened links (bit.ly, tinyurl, t.co, etc.) obscure the actual target website address.',
    whyItMatters: 'Masked URLs prevent you from verifying whether the destination domain is authentic before clicking, frequently redirecting to credential phishing pages.',
    pattern: /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy|ow\.ly|shorturl\.at)\/[a-zA-Z0-9_\-]+\b/i,
    extractRegex: /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy|ow\.ly|shorturl\.at)\/[a-zA-Z0-9_\-]+\b/i
  },
  {
    id: 'lookalike_spoofed_domain',
    category: 'Spoofed Travel Domain',
    severity: 'critical',
    weight: 30,
    title: 'Suspicious Lookalike Travel Domain',
    description: 'Web addresses combining official brand names with hyphens or unusual suffixes (.xyz, .top, .site, .club).',
    whyItMatters: 'Attackers register domains like `irctc-refund-portal.xyz` or `booking-confirm.site` to replicate official brand interfaces and steal credentials.',
    pattern: /\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc|railway|makemytrip|booking|airbnb|oyo|airindia)[a-zA-Z0-9_\-]*\.(?:xyz|top|site|club|buzz|info|online|icu|ru|tk)\b|\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc-|railway-|booking-)[a-zA-Z0-9_\-]*\.[a-z]{2,}\b/i,
    extractRegex: /\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc|railway|makemytrip|booking|airbnb|oyo|airindia)[a-zA-Z0-9_\-]*\.[a-zA-Z0-9_\-\.]+\b/i
  },
  {
    id: 'unencrypted_http_link',
    category: 'Insecure Link Protocol',
    severity: 'medium',
    weight: 10,
    title: 'Insecure Unencrypted HTTP Link',
    description: 'Links starting with "http://" rather than secure, encrypted "https://".',
    whyItMatters: 'Unencrypted connections can be intercepted or tampered with on public transit Wi-Fi networks. Legitimate payment and travel portals use HTTPS exclusively.',
    pattern: /\bhttp:\/\/(?![a-zA-Z0-9.\-_]*localhost)[a-zA-Z0-9.\-_]+\.[a-z]{2,}/i,
    extractRegex: /\bhttp:\/\/[a-zA-Z0-9.\-_]+\.[a-z]{2,}[^\s]*/i
  },

  // 8. Unrealistic Travel Incentives & Lotteries
  {
    id: 'unrealistic_discount_lottery',
    category: 'Unrealistic Travel Incentive',
    severity: 'medium',
    weight: 12,
    title: 'Unusually Large Discount or Free Vacation Prize Claim',
    description: 'Claims of 80–90% luxury hotel discounts or winning unentered vacation lotteries.',
    whyItMatters: 'Unrealistic deals act as psychological bait to lure travellers into making rushed off-platform down payments before they can verify accommodation legitimacy.',
    pattern: /\b(?:(?:8[0-9]|9[0-9])%\s*discount|congratulations,? you have been selected|won a free (?:vacation|trip|holiday|stay)|complimentary stay lottery|unbelievable (?:8[0-9]|9[0-9])%|claim (?:your )?vip (?:holiday )?voucher)\b/i,
    extractRegex: /\b(?:(?:8[0-9]|9[0-9])%\s*discount|congratulations[^\n,.]{0,30}selected|won a free (?:vacation|trip|holiday|stay)|complimentary stay lottery|claim (?:your )?vip (?:holiday )?voucher)\b/i
  }
];

/**
 * Perform transparent, deterministic heuristic analysis on travel message text.
 * Runs 100% locally in the user's browser.
 *
 * @param {string} text
 * @returns {Object} Comprehensive analysis breakdown
 */
export const analyzeMessageLocally = (text) => {
  const sanitized = (text || '').trim();

  // 1. Validate input presence
  if (!sanitized) {
    return {
      success: false,
      error: 'Please paste or type a travel message to analyze.'
    };
  }

  // 2. Validate minimum meaningful length
  if (sanitized.length < 15) {
    return {
      success: false,
      error: 'Message is too short to analyse meaningfully. Please provide more content (at least 15 characters), such as the complete SMS, WhatsApp message, or payment request.'
    };
  }

  // 3. Check for official educational advisories (suppresses false positives)
  if (isEducationalSafetyAdvisory(sanitized)) {
    return {
      success: true,
      riskLevel: 'Low',
      riskBadgeVariant: 'sage',
      riskScore: 0,
      summary: 'Official Travel Safety Advisory: This communication is an educational or security notice warning travellers against fraud. It does not solicit money, credentials, or personal actions.',
      warnings: [],
      extractedPhrases: [],
      recommendedSteps: [
        'Heed official safety guidance: never disclose passwords, OTPs, or UPI PINs to anyone claiming to be travel staff.',
        'Keep emergency helpline numbers (112, 1091, 1930) handy during transit.'
      ],
      verificationChannels: [
        {
          channel: 'Official IRCTC Helpline',
          guidance: 'Dial 139 for all official Indian Railways enquiries and security support.'
        },
        {
          channel: 'National Cyber Crime Portal',
          guidance: 'Report scams or fraud attempts directly at cybercrime.gov.in or call 1930.'
        }
      ],
      analyzedAt: new Date().toISOString(),
      characterCount: sanitized.length,
      wordCount: sanitized.split(/\s+/).filter(Boolean).length
    };
  }

  // 4. Check for standard legitimate booking confirmations
  if (isLegitimateBookingConfirmation(sanitized)) {
    return {
      success: true,
      riskLevel: 'Low',
      riskBadgeVariant: 'sage',
      riskScore: 0,
      summary: 'Standard Booking Confirmation: Contains authentic booking references and official support channels. No coercive countdowns, personal UPI demands, or credential requests were detected.',
      warnings: [],
      extractedPhrases: [],
      recommendedSteps: [
        'Save your booking PNR and confirmation voucher offline for transit reference.',
        'Manage travel exclusively through the official provider portal or verified customer care number.'
      ],
      verificationChannels: [
        {
          channel: 'Official Airline / IRCTC Portal',
          guidance: 'Manage bookings and web check-in directly through the carrier’s verified mobile app or official website.'
        }
      ],
      analyzedAt: new Date().toISOString(),
      characterCount: sanitized.length,
      wordCount: sanitized.split(/\s+/).filter(Boolean).length
    };
  }

  // 5. Evaluate message against threat rule matrix
  const detectedWarnings = [];
  const extractedPhrases = new Set();
  const matchedRuleIds = new Set();

  THREAT_RULES.forEach((rule) => {
    if (rule.pattern.test(sanitized)) {
      matchedRuleIds.add(rule.id);

      // Extract matching phrase snippet
      let snippet = '';
      if (rule.extractRegex) {
        const match = sanitized.match(rule.extractRegex);
        if (match && match[0]) {
          snippet = match[0].trim();
          extractedPhrases.add(snippet);
        }
      }

      // Specifically extract UPI handle if present in rule
      if (rule.id === 'personal_upi_handle') {
        const upiMatch = sanitized.match(/[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|sbi|icici|hdfcbank|postbank|federal)/i);
        if (upiMatch && upiMatch[0]) {
          extractedPhrases.add(upiMatch[0].trim());
          if (!snippet || snippet.toLowerCase() === 'personal upi') {
            snippet = upiMatch[0].trim();
          }
        }
      }

      detectedWarnings.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        severity: rule.severity,
        weight: rule.weight,
        description: rule.description,
        whyItMatters: rule.whyItMatters,
        snippet: snippet || null
      });
    }
  });

  // 6. Context-Aware Deduplication & Combination Analysis
  const hasCredentialTrap = matchedRuleIds.has('credential_otp_trap') || matchedRuleIds.has('credential_pin_cvv') || matchedRuleIds.has('remote_access_malware');
  const hasCoerciveLegalThreat = matchedRuleIds.has('coercive_threats');
  const hasCallCoercion = matchedRuleIds.has('da_call_coercion');
  const hasAvoidArrestPayment = matchedRuleIds.has('da_avoid_arrest_payment');
  const hasAadhaarThreat = matchedRuleIds.has('da_aadhaar_threat');
  const hasGovImpersonation = matchedRuleIds.has('da_gov_impersonation');
  const hasLocationHarvest = matchedRuleIds.has('unverified_location_id_harvest');
  const hasSpoofedDomain = matchedRuleIds.has('lookalike_spoofed_domain');
  const hasShortener = matchedRuleIds.has('url_shortener');
  const hasCancellationThreat = matchedRuleIds.has('urgent_cancellation_threat');
  const hasUrgencyCountdown = matchedRuleIds.has('urgency_deadline');
  const hasPersonalPayment = matchedRuleIds.has('personal_upi_handle');
  const hasPlatformBypass = matchedRuleIds.has('platform_bypass');
  const hasAuthorityImpersonation = matchedRuleIds.has('authority_impersonation');
  const hasSuspensionThreat = matchedRuleIds.has('suspension_threat');
  const hasUnrealisticOffer = matchedRuleIds.has('unrealistic_discount_lottery');

  // Count strong digital arrest indicators
  const daIndicatorCount =
    (hasGovImpersonation ? 1 : 0) +
    (hasAadhaarThreat ? 1 : 0) +
    (hasCoerciveLegalThreat ? 1 : 0) +
    (hasAvoidArrestPayment ? 1 : 0) +
    (hasCallCoercion ? 1 : 0);

  // Check if personal UPI is purely benign / isolated (no urgency, no cancellation, no coercion, no bypass, no threats)
  const isIsolatedPersonalUpi =
    hasPersonalPayment &&
    !hasCancellationThreat &&
    !hasUrgencyCountdown &&
    !hasCredentialTrap &&
    !hasCoerciveLegalThreat &&
    !hasCallCoercion &&
    !hasAvoidArrestPayment &&
    !hasAadhaarThreat &&
    !hasGovImpersonation &&
    !hasLocationHarvest &&
    !hasPlatformBypass &&
    !hasSpoofedDomain &&
    !hasShortener &&
    !hasSuspensionThreat &&
    !hasAuthorityImpersonation;

  // If isolated personal UPI, soften its severity and presentation
  if (isIsolatedPersonalUpi) {
    const upiWarning = detectedWarnings.find((w) => w.id === 'personal_upi_handle');
    if (upiWarning) {
      upiWarning.severity = 'medium';
      upiWarning.title = 'Personal UPI ID Mentioned (Informational)';
      upiWarning.description = 'A personal UPI address was identified. While many authentic homestays and local transport operators in India use UPI for convenience, always verify recipient identity before transferring funds.';
      upiWarning.whyItMatters = 'Direct UPI transfers cannot be recalled once sent. Ensure you settle payments in person upon arrival or verify against your original booking receipt.';
    }
  }

  // Check if government / police mention is purely informational (no threats, no arrest, no coercion, no payments)
  const isIsolatedGovImpersonation =
    hasGovImpersonation &&
    !hasCoerciveLegalThreat &&
    !hasCallCoercion &&
    !hasAvoidArrestPayment &&
    !hasAadhaarThreat &&
    !hasPersonalPayment &&
    !hasUrgencyCountdown &&
    !hasCredentialTrap &&
    !hasCancellationThreat &&
    !hasLocationHarvest &&
    !hasPlatformBypass &&
    !hasSpoofedDomain &&
    !hasShortener &&
    !hasSuspensionThreat;

  // If isolated government / police agency mention, soften its severity and presentation
  if (isIsolatedGovImpersonation) {
    const govWarning = detectedWarnings.find((w) => w.id === 'da_gov_impersonation');
    if (govWarning) {
      govWarning.severity = 'low';
      govWarning.title = 'Official Agency / Police Mentioned (Informational)';
      govWarning.description = 'A police or government entity was mentioned in an informational context without threats, arrest warrants, call coercion, or payment demands.';
      govWarning.whyItMatters = 'Official agencies are frequently referenced in safety advisories, campus notices, or routine travel information. Authentic public notices do not threaten arrest or demand money transfers.';
    }
  }

  // Calculate Base Clustered Scores (Prevents double counting overlapping regex matches)
  let baseScore = 0;

  // Credential Cluster
  if (matchedRuleIds.has('credential_otp_trap')) baseScore += 35;
  if (matchedRuleIds.has('credential_pin_cvv')) baseScore += 35;
  if (matchedRuleIds.has('remote_access_malware')) baseScore += 35;

  // Legal Coercion & Digital Arrest Cluster
  if (hasCoerciveLegalThreat) baseScore += 35;
  if (hasCallCoercion) baseScore += 35;
  if (hasAvoidArrestPayment) baseScore += 35;
  if (hasAadhaarThreat) baseScore += 25;
  if (hasSuspensionThreat && !hasCoerciveLegalThreat && !hasAadhaarThreat) baseScore += 20;

  // Law Enforcement Agency Impersonation Cluster
  if (isIsolatedGovImpersonation) {
    baseScore += 0; // Purely informational reference to police / government agency
  } else if (hasGovImpersonation) {
    baseScore += 18;
  }

  // Physical Location & Privacy Cluster
  if (hasLocationHarvest) baseScore += 30;

  // Domain & Link Cluster (Avoids double counting insecure link when spoofed domain is already counted)
  if (hasSpoofedDomain) {
    baseScore += 30;
  } else if (hasShortener) {
    baseScore += 14;
  } else if (matchedRuleIds.has('unencrypted_http_link')) {
    baseScore += 10;
  }

  // Urgency & Cancellation Cluster (Deduplicate: do not charge 22 + 20 for the same cancellation countdown)
  if (hasCancellationThreat && hasUrgencyCountdown) {
    baseScore += 26; // Clustered base instead of 22 + 20 = 42
  } else if (hasCancellationThreat) {
    baseScore += 22;
  } else if (hasUrgencyCountdown) {
    baseScore += 20;
  }

  // Payment Channel Cluster
  if (isIsolatedPersonalUpi) {
    baseScore += 14; // Isolated UPI carries modest weight (Low Risk 14/100)
  } else if (hasPersonalPayment) {
    baseScore += 22; // Personal payment under suspicious context
  }

  // Platform Bypass & Offers
  if (hasPlatformBypass) baseScore += 15;
  if (hasUnrealisticOffer) baseScore += 12;
  if (hasAuthorityImpersonation && !hasCoerciveLegalThreat) baseScore += 15;

  // 7. Compound Risk Combinations
  let compoundMultiplier = 0;

  // KEY FIX: Urgent cancellation threat + Personal payment request
  // Coercing payment to personal UPI under imminent room/booking cancellation is a hallmark fraud pattern.
  if ((hasCancellationThreat || hasUrgencyCountdown) && hasPersonalPayment && !isIsolatedPersonalUpi) {
    compoundMultiplier += 22;
  }

  // Platform bypass + Personal payment
  if (hasPlatformBypass && hasPersonalPayment) {
    compoundMultiplier += 18;
  }

  // Credential trap + Urgent deadline, Spoofed domain, or Suspension threat
  if (hasCredentialTrap && (hasUrgencyCountdown || hasCancellationThreat || hasSuspensionThreat || hasSpoofedDomain || hasShortener)) {
    compoundMultiplier += 20;
  }

  // Digital Arrest Multi-indicator Combination
  // Detects combinations of police impersonation, Aadhaar threats, arrest threats, avoid-arrest payments, and call coercion
  const isDigitalArrestScam =
    (hasAvoidArrestPayment && (hasCoerciveLegalThreat || hasGovImpersonation || hasAadhaarThreat)) ||
    (hasCallCoercion && (hasCoerciveLegalThreat || hasGovImpersonation || hasAadhaarThreat || hasAvoidArrestPayment)) ||
    (hasCoerciveLegalThreat && (hasAvoidArrestPayment || hasPersonalPayment || (hasGovImpersonation && hasAadhaarThreat))) ||
    (daIndicatorCount >= 2 && (hasCoerciveLegalThreat || hasAvoidArrestPayment || hasCallCoercion || hasAadhaarThreat));

  if (isDigitalArrestScam) {
    compoundMultiplier += daIndicatorCount >= 3 ? 30 : 25;
  } else if (hasCoerciveLegalThreat && (hasPersonalPayment || hasUrgencyCountdown)) {
    compoundMultiplier += 25;
  }

  // Physical location / room harvesting + Payment demand
  if (hasLocationHarvest && hasPersonalPayment) {
    compoundMultiplier += 18;
  }

  // Calculate final normalized numerical risk score (0 to 100)
  const computedScore = baseScore + compoundMultiplier;
  const riskScore = Math.min(100, Math.max(0, computedScore));

  // 8. Determine categorical risk level using strict score boundaries:
  // Low: 0 - 20 | Medium: 21 - 50 | High: 51 - 79 | Critical: 80 - 100
  let riskLevel = 'Low';
  let riskBadgeVariant = 'sage';
  let summary = '';

  if (riskScore >= 80) {
    riskLevel = 'Critical';
    riskBadgeVariant = 'alert';
    if (isDigitalArrestScam) {
      summary = 'Critical Threat: Digital Arrest & Law Enforcement Extortion Signature. This message exhibits severe digital arrest extortion tactics, combining police/government impersonation, arrest threats, Aadhaar contraband allegations, call coercion, or demands for payments to avoid arrest. Real Indian police and agencies NEVER place citizens under "digital arrest", conduct video interrogations, or ask for money transfers. Disconnect immediately and call 1930 or 112.';
    } else {
      summary = 'Critical Risk: High-Threat Travel Scam Signatures Detected. This communication exhibits severe threat patterns such as credential harvesting, legal extortion, remote-access software traps, or coercive demands. Do not share codes, do not click links, do not transfer funds, and do not disclose your live location.';
    }
  } else if (riskScore >= 51) {
    riskLevel = 'High';
    riskBadgeVariant = 'terracotta';
    if (isDigitalArrestScam) {
      summary = 'High Risk: Digital Arrest & Legal Intimidation Warning. Warning signs of law enforcement impersonation, arrest threats, or coercive demands were detected. Real police and government agencies never demand payment or issue arrest threats over messaging apps. Do not comply and verify independently by calling 112 or 1930.';
    } else {
      summary = 'High Risk: Coercive Travel Fraud Indicators Detected. This message combines suspicious patterns such as urgent booking cancellation threats with personal payment demands, off-platform booking diversion, or unverified driver location demands. Do not send money without direct verification through official booking records.';
    }
  } else if (riskScore >= 21) {
    riskLevel = 'Medium';
    riskBadgeVariant = 'outline';
    summary = 'Caution Advised: Unverified Travel Patterns Detected. Warning indicators such as off-platform payment suggestions, masked URLs, or unrealistic discount claims were identified. Verify all details independently through official channels before proceeding.';
  } else {
    riskLevel = 'Low';
    riskBadgeVariant = 'sage';
    if (isIsolatedGovImpersonation) {
      summary = 'Low Risk: Informational Agency Mention. An official agency or police entity was mentioned in an informational context with no threats, countdowns, call coercion, or payment demands. Routine vigilance is advised.';
    } else if (isIsolatedPersonalUpi) {
      summary = 'Low Risk: Informational Payment Mention. A personal UPI handle was mentioned without urgent cancellation demands or deceptive pressure. Authentic Indian homestays commonly share UPI IDs, but always ensure you verify the recipient before making any payment.';
    } else {
      summary = 'Low Risk: No Common Travel Threat Patterns Identified. The message does not trigger heuristic fraud indicators such as OTP harvesting, urgent countdowns, or unverified payment extortion. Routine travel vigilance is advised.';
    }
  }

  // 9. Generate Tailored Safety Recommendations Corresponding Directly to Detected Indicators
  const recommendedSteps = [];

  if (hasCredentialTrap) {
    recommendedSteps.push('Never share OTPs, UPI PINs, ATM PINs, or card CVVs with anyone claiming to be IRCTC, airline, or hotel staff.');
  }

  if (hasCancellationThreat || hasUrgencyCountdown) {
    recommendedSteps.push('Do NOT panic over urgent cancellation warnings. Confirm your reservation status directly in your official booking portal (Booking.com, MakeMyTrip, IRCTC) or call the hotel front desk using the verified phone number printed on your voucher.');
  }

  if (hasPersonalPayment) {
    recommendedSteps.push('Do NOT transfer money to personal UPI handles or private QR codes under cancellation pressure. Settle payments in person at check-in or via registered merchant gateways.');
  }

  if (hasCallCoercion || hasAvoidArrestPayment || (hasCoerciveLegalThreat && (hasGovImpersonation || hasAadhaarThreat))) {
    recommendedSteps.push('DISCONNECT IMMEDIATELY: "Digital arrest" is a recognized cyber extortion scam. Genuine Indian police, CBI, ED, customs, and courts NEVER place citizens under "digital arrest", conduct video-call trials, or demand money to avoid arrest.');
    recommendedSteps.push('Do NOT transfer any money, "security deposit", or "bail bond". Report the caller and phone number immediately to the National Cyber Crime Portal at 1930 or cybercrime.gov.in.');
  } else if (hasCoerciveLegalThreat) {
    recommendedSteps.push('Do not panic over threats of arrest, police warrants, or airport customs detention. Genuine Indian law enforcement officers never demand money transfers via UPI or conduct interrogations over WhatsApp video calls.');
  }

  if (hasLocationHarvest) {
    recommendedSteps.push('Do NOT share your live GPS location, hotel room number, or government ID copies with unverified WhatsApp contacts. If you feel physically unsafe or followed, dial 112 or 1091 immediately.');
  }

  if (hasPlatformBypass) {
    recommendedSteps.push('Keep all bookings and payments inside trusted platforms (Booking.com, Airbnb, MakeMyTrip). Off-platform bookings forfeit all consumer protection and insurance coverage.');
  }

  if (hasSpoofedDomain || hasShortener) {
    recommendedSteps.push('Do NOT tap on shortened (bit.ly) or lookalike web links. Open your browser and navigate directly to the verified official portal.');
  }

  if (matchedRuleIds.has('remote_access_malware')) {
    recommendedSteps.push('Immediately refuse any request to install AnyDesk, TeamViewer, or third-party APK packages.');
  }

  // Fallback recommendations if list is short or low risk
  if (recommendedSteps.length === 0) {
    recommendedSteps.push('Confirm that sender contact details match the official support phone numbers on your initial booking voucher.');
    recommendedSteps.push('Manage bookings directly via the official airline, railway (IRCTC), or hotel portal.');
    recommendedSteps.push('Never enter your UPI PIN to receive money or refunds.');
  } else {
    recommendedSteps.push('Verify any claims independently by calling the official support line printed on your booking confirmation.');
    if (riskLevel === 'Critical' || riskLevel === 'High') {
      recommendedSteps.push('If you already transferred funds or compromised credentials, report the incident immediately to the National Cyber Crime Helpline at 1930.');
    }
  }

  // 10. Independent Verification Guide
  const verificationChannels = [
    {
      channel: 'Indian Railways (IRCTC / Trains)',
      guidance: 'Verify train status and PNR exclusively via official irctc.co.in, the IRCTC Rail Connect app, or call Railway Passenger Helpline 139.'
    },
    {
      channel: 'Hotels & Accommodation',
      guidance: 'Call the verified telephone number printed on your initial confirmation voucher. Never use alternate numbers sent via unsolicited WhatsApp messages.'
    },
    {
      channel: 'Airlines & Flights',
      guidance: 'Check PNR and schedule directly on the carrier’s official website or official airport arrival/departure display boards.'
    },
    {
      channel: 'National Cyber Crime Helpline (India)',
      guidance: 'For financial fraud, OTP theft, or cyber extortion in India, dial 1930 immediately or lodge an incident report at cybercrime.gov.in.'
    }
  ];

  return {
    success: true,
    riskLevel,
    riskBadgeVariant,
    riskScore, // Normalized score strictly between 0 and 100
    summary,
    warnings: detectedWarnings,
    extractedPhrases: Array.from(extractedPhrases),
    recommendedSteps,
    verificationChannels,
    analyzedAt: new Date().toISOString(),
    characterCount: sanitized.length,
    wordCount: sanitized.split(/\s+/).filter(Boolean).length
  };
};
