/**
 * Scam Shield - Deterministic Threat Analysis Engine for EXIT PLAN AI
 * Evaluates suspicious travel communications locally in the browser without remote uploads.
 */

// Sample travel messages for interactive testing
export const SAMPLE_MESSAGES = [
  {
    id: 'sample-otp-phishing',
    title: 'IRCTC Train Cancellation Phishing',
    category: 'High Risk Alert',
    tag: 'Phishing Scam',
    text: 'URGENT IRCTC UPDATE: Train #12952 has been cancelled due to track maintenance. To claim your full refund or re-book guaranteed berth immediately, visit http://irctc-refund-portal.xyz/claim and share the 6-digit OTP sent to your mobile. If OTP is not submitted within 10 minutes, refund will be forfeited.'
  },
  {
    id: 'sample-hotel-upi',
    title: 'Hotel Booking Advance UPI Demands',
    category: 'High Risk Alert',
    tag: 'Payment Extortion',
    text: 'Dear Guest, this is manager from Grand Heritage Resort Manali regarding your reservation tomorrow. Our hotel system is undergoing audit. Please pay 50% advance (Rs 3,500) within 15 minutes to our accountant personal UPI ID hotelmanager.manali@okaxis to confirm your check-in. Otherwise your room will be automatically cancelled and given to waiting guests.'
  },
  {
    id: 'sample-discount-bypass',
    title: 'Suspicious 85% Luxury Stay & Platform Bypass',
    category: 'Medium Risk Alert',
    tag: 'Platform Bypass',
    text: 'Exclusive Holiday Offer! Congratulations, you have been selected for an unbelievable 85% discount at 5-star Goa Luxury Beach Villas for 4 nights. Don’t book on Booking.com or Airbnb to save heavy platform commission tax. Message us directly on WhatsApp to pay offline via Google Pay and claim your VIP holiday voucher: https://bit.ly/goa-vip-offer-deal'
  },
  {
    id: 'sample-normal-booking',
    title: 'Standard Flight / Rail Confirmation',
    category: 'Low Risk Indicator',
    tag: 'Normal Confirmation',
    text: 'Booking Confirmed: PNR 425-8910245. Flight AI-803 from New Delhi (DEL) T3 to Bengaluru (BLR) T2 on 15 Nov 2026. Departure: 06:15 AM. Check-in baggage: 15kg. Manage your booking or web check-in via official website https://www.airindia.com or call 24x7 customer support at 1860-233-1407. Have a pleasant journey.'
  }
];

/**
 * Threat detection rules with targeted regex patterns, category labels, risk weights,
 * and contextual explanations.
 */
const THREAT_RULES = [
  // 1. Critical Credential & Sensitive Information Traps (Highest Severity)
  {
    id: 'credential_otp_trap',
    category: 'Credential & Verification Theft',
    severity: 'critical',
    weight: 35,
    title: 'Request for One-Time Password (OTP) or Verification Code',
    description: 'Legitimate travel operators, banks, and IRCTC never ask passengers to share OTPs over text, phone, or forms. Sharing an OTP allows scammers to authorize transactions or take over accounts.',
    pattern: /\b(?:share|send|enter|provide|submit|give|verify)\b.{0,35}\b(?:otp|one[- ]time password|verification code|security code|auth code|6[- ]digit code|4[- ]digit code)\b|\b(?:otp|code)\b.{0,25}\b(?:will be forfeited|required to process|for refund|to confirm)\b/i,
    extractRegex: /\b(?:(?:share|send|enter|provide|submit|give|verify)\s+[^.,\n]{0,35}\b(?:otp|one[- ]time password|verification code|security code|6[- ]digit code|4[- ]digit code)|(?:otp|verification code)\s+[^.,\n]{0,25}\b(?:forfeited|required|refund|confirm))\b/i
  },
  {
    id: 'credential_pin_cvv',
    category: 'Financial Credential Harvest',
    severity: 'critical',
    weight: 35,
    title: 'Request for UPI PIN, ATM PIN, or Card CVV',
    description: 'You NEVER need to enter a UPI PIN to receive money or refunds. Entering a UPI PIN always authorizes money leaving your account.',
    pattern: /\b(?:upi pin|mpin|atm pin|cvv|card expiry|net banking password|debit card pin|credit card pin)\b/i,
    extractRegex: /\b(?:upi pin|mpin|atm pin|cvv|card expiry|net banking password|debit card pin|credit card pin)\b/i
  },
  {
    id: 'remote_access_software',
    category: 'Device Compromise Risk',
    severity: 'critical',
    weight: 35,
    title: 'Request to Install Remote-Access Software',
    description: 'Fraudsters frequently impersonate support agents and ask travellers to install remote screen-sharing tools to drain bank accounts.',
    pattern: /\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen[- ]?share|remote desktop|ultraviewer)\b/i,
    extractRegex: /\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen[- ]?share|remote desktop|ultraviewer)\b/i
  },

  // 2. Urgent Demands & Coercive Pressure
  {
    id: 'urgency_deadline',
    category: 'Artificial Urgency & Pressure',
    severity: 'high',
    weight: 20,
    title: 'Urgent Payment Deadline or Imminent Cancellation Threat',
    description: 'Scammers create artificial time limits (e.g., 10–15 minutes) to induce panic and prevent travellers from verifying claims through official channels.',
    pattern: /\b(?:within\s+(?:\d{1,2}|ten|fifteen|thirty)\s+(?:minutes?|mins?|hours?)|pay immediately|act now|immediate(?:ly)? pay(?:ment)?|before midnight|urgent action required|pay now or|cancel(?:led)? immediately unless|auto(?:matically)? cancel(?:led)? within|forfeited within)\b/i,
    extractRegex: /\b(?:within\s+(?:\d{1,2}|ten|fifteen|thirty)\s+(?:minutes?|mins?|hours?)|pay immediately|immediate(?:ly)? pay(?:ment)?|cancel(?:led)? immediately unless|auto(?:matically)? cancel(?:led)? within|pay now or|forfeited within)\b/i
  },
  {
    id: 'coercive_threats',
    category: 'Coercive Threats & Impersonation',
    severity: 'critical',
    weight: 30,
    title: 'Legal Threats, Arrest Warrants, or Police Impersonation',
    description: 'Threatening messages claiming customs detention, police warrants, or narcotics investigations are common intimidation tactics designed to extort money.',
    pattern: /\b(?:police warrant|arrest warrant|customs detention|narcotics department|enforcement directorate|legal action will be taken|fir registered|court notice|immigration penalty|detained at airport)\b/i,
    extractRegex: /\b(?:police warrant|arrest warrant|customs detention|narcotics department|enforcement directorate|legal action will be taken|fir registered|court notice|immigration penalty|detained at airport)\b/i
  },

  // 3. Unverified / Personal Payment Accounts
  {
    id: 'personal_upi_handle',
    category: 'Unverified Payment Channel',
    severity: 'medium',
    weight: 15,
    title: 'Personal UPI ID or QR Code Payment Request',
    description: 'While some authentic small guesthouses in India accept UPI, unsolicited WhatsApp or SMS messages directing payment to personal accounts (e.g. @okaxis, @ybl) require caution. Official hotel reservations should be billed through registered merchant portals or settled at check-in.',
    pattern: /\b[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl)\b|\b(?:personal upi|send to upi|scan qr code|pay to accountant|gpay to personal|phonepe to personal)\b/i,
    extractRegex: /\b(?:[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl)|personal upi|scan qr code|pay to accountant|gpay to personal|phonepe to personal)\b/i
  },

  // 4. Off-Platform Booking Bypass
  {
    id: 'platform_bypass',
    category: 'Booking Platform Bypass',
    severity: 'medium',
    weight: 15,
    title: 'Request to Bypass Official Booking Platforms',
    description: 'Requests to cancel reservations on trusted platforms (MakeMyTrip, Booking.com, Airbnb) to "save commission" strip all consumer safety protections, insurance, and dispute recourse.',
    pattern: /\b(?:cancel on (?:booking\.com|airbnb|makemytrip|agoda|goibibo|oyo)|pay(?:ing)? (?:me )?directly|pay offline|avoid (?:platform|service) (?:fee|commission|tax)|save (?:heavy )?(?:commission|tax)|direct whatsapp deal)\b/i,
    extractRegex: /\b(?:cancel on (?:booking\.com|airbnb|makemytrip|agoda|goibibo|oyo)|pay(?:ing)? (?:me )?directly|pay offline|avoid (?:platform|service) (?:fee|commission|tax)|save (?:heavy )?(?:commission|tax)|direct whatsapp deal)\b/i
  },

  // 5. Suspicious Domains & URL Shorteners
  {
    id: 'url_shortener',
    category: 'Masked Destination Link',
    severity: 'medium',
    weight: 12,
    title: 'Shortened or Obfuscated Web Link',
    description: 'URL shorteners hide the real destination address. Legitimate transport operators and banks direct users to their verified top-level domains, not masked short links.',
    pattern: /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy|ow\.ly|shorturl\.at)\/[a-zA-Z0-9_\-]+\b/i,
    extractRegex: /\b(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy|ow\.ly|shorturl\.at)\/[a-zA-Z0-9_\-]+\b/i
  },
  {
    id: 'lookalike_spoofed_domain',
    category: 'Spoofed Travel Domain',
    severity: 'critical',
    weight: 30,
    title: 'Suspicious Lookalike Travel Domain',
    description: 'Domain names that combine official brand names with hyphens or unusual suffixes (e.g. irctc-refund, booking-verify) are created to impersonate trusted platforms.',
    pattern: /\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc|railway|makemytrip|booking|airbnb|oyo|airindia)[a-zA-Z0-9_\-]*\.(?:xyz|top|site|club|buzz|info|online|icu|ru|tk)\b|\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc-|railway-|booking-)[a-zA-Z0-9_\-]*\.[a-z]{2,}\b/i,
    extractRegex: /\bhttps?:\/\/[a-zA-Z0-9_\-]*(?:irctc|railway|makemytrip|booking|airbnb|oyo|airindia)[a-zA-Z0-9_\-]*\.[a-zA-Z0-9_\-\.]+\b/i
  },
  {
    id: 'unencrypted_http_link',
    category: 'Insecure Link Protocol',
    severity: 'medium',
    weight: 10,
    title: 'Insecure Unencrypted HTTP Link',
    description: 'Links beginning with "http://" lack modern SSL/TLS encryption. Legitimate payment and travel portals use secure "https://" connections exclusively.',
    pattern: /\bhttp:\/\/(?![a-zA-Z0-9.\-_]*localhost)[a-zA-Z0-9.\-_]+\.[a-z]{2,}/i,
    extractRegex: /\bhttp:\/\/[a-zA-Z0-9.\-_]+\.[a-z]{2,}[^\s]*/i
  },

  // 6. Unrealistic Discounts & Lottery Lures
  {
    id: 'unrealistic_discount_lottery',
    category: 'Unrealistic Travel Incentive',
    severity: 'medium',
    weight: 12,
    title: 'Unusually Large Discount or Free Vacation Claim',
    description: 'Claims of 80–90% luxury hotel discounts, winning unentered vacation lotteries, or "free VIP vouchers" are standard lure mechanisms used to initiate off-platform scams.',
    pattern: /\b(?:(?:8[0-9]|9[0-9])%\s*discount|congratulations,? you have been selected|won a free (?:vacation|trip|holiday|stay)|complimentary stay lottery|unbelievable (?:8[0-9]|9[0-9])%|claim (?:your )?vip (?:holiday )?voucher)\b/i,
    extractRegex: /\b(?:(?:8[0-9]|9[0-9])%\s*discount|congratulations[^\n,.]{0,30}selected|won a free (?:vacation|trip|holiday|stay)|complimentary stay lottery|claim (?:your )?vip (?:holiday )?voucher)\b/i
  }
];

/**
 * Perform transparent, deterministic heuristic analysis on travel message text.
 * Runs completely locally in the user's browser.
 *
 * @param {string} text
 * @returns {Object} Comprehensive analysis breakdown
 */
export const analyzeMessageLocally = (text) => {
  const sanitized = (text || '').trim();

  if (!sanitized) {
    return {
      success: false,
      error: 'Message text cannot be empty'
    };
  }

  const detectedWarnings = [];
  const extractedPhrases = new Set();
  let totalScore = 0;

  // Evaluate message against rule matrix
  THREAT_RULES.forEach((rule) => {
    if (rule.pattern.test(sanitized)) {
      totalScore += rule.weight;

      // Extract matching phrase snippet
      let snippet = '';
      if (rule.extractRegex) {
        const match = sanitized.match(rule.extractRegex);
        if (match && match[0]) {
          snippet = match[0].trim();
          extractedPhrases.add(snippet);
        }
      }

      // Also specifically extract UPI handle if present in rule
      if (rule.id === 'personal_upi_handle') {
        const upiMatch = sanitized.match(/[a-zA-Z0-9._-]{2,35}@(okaxis|okhdfcbank|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl)/i);
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
        snippet: snippet || null
      });
    }
  });

  // Calculate overall heuristic risk level
  let riskLevel = 'Low';
  let riskBadgeVariant = 'sage';
  let summary = '';

  const hasCriticalWarning = detectedWarnings.some((w) => w.severity === 'critical');
  const hasUrgentPaymentWithUpi =
    detectedWarnings.some((w) => w.id === 'urgency_deadline') &&
    detectedWarnings.some((w) => w.id === 'personal_upi_handle');
  const hasBypassWithPersonalUpi =
    detectedWarnings.some((w) => w.id === 'platform_bypass') &&
    detectedWarnings.some((w) => w.id === 'personal_upi_handle');

  if (hasCriticalWarning || hasUrgentPaymentWithUpi || hasBypassWithPersonalUpi || totalScore >= 45) {
    riskLevel = 'High';
    riskBadgeVariant = 'terracotta';
    summary = 'High Risk Indicators Detected. This message exhibits strong hallmarks of travel phishing, credential theft, or extortion. Do not share codes, do not click links, and do not make payments.';
  } else if (totalScore >= 10 || detectedWarnings.length >= 1) {
    riskLevel = 'Medium';
    riskBadgeVariant = 'outline';
    summary = 'Caution Advised. Warning signs such as urgency, off-platform payment suggestions, or unverified accounts were detected. Verify all details independently through official platforms before proceeding.';
  } else {
    riskLevel = 'Low';
    riskBadgeVariant = 'forest';
    summary = 'Low Risk Indicators. No common travel scam signatures were identified in this text. However, automated analysis cannot verify whether the sender is authentic. Always maintain standard vigilance.';
  }

  // Generate recommended next steps based on detected threats
  const recommendedSteps = [];
  if (riskLevel === 'High') {
    recommendedSteps.push('Do NOT share any OTP, UPI PIN, password, or credit card details.');
    recommendedSteps.push('Do NOT click on any links or download attached files or remote-support apps.');
    recommendedSteps.push('Do NOT send money to personal UPI IDs or off-platform payment links.');
    recommendedSteps.push('Block the sender immediately and report phishing to your mobile carrier or WhatsApp.');
    recommendedSteps.push('If financial fraud or unauthorized transactions occurred, immediately call the National Cyber Crime Helpline at 1930.');
  } else if (riskLevel === 'Medium') {
    recommendedSteps.push('Do not follow instructions in this message without independent verification.');
    recommendedSteps.push('Open the official travel booking app or website directly (type the URL manually).');
    recommendedSteps.push('Contact the hotel or operator using the verified phone number from your original confirmation voucher.');
    recommendedSteps.push('If asked to pay outside the booking platform, contact the platform’s customer support immediately.');
  } else {
    recommendedSteps.push('Confirm that the sender’s address or phone number matches official contact channels.');
    recommendedSteps.push('Manage bookings directly via the official airline, railway (IRCTC), or hotel portal.');
    recommendedSteps.push('Never enter your UPI PIN to receive money or refunds.');
  }

  // Independent verification guidance
  const verificationChannels = [
    {
      channel: 'Indian Railways (IRCTC / Trains)',
      guidance: 'Verify train status and PNR exclusively via official irctc.co.in, the IRCTC Rail Connect app, or call Railway Protection Force / Passenger Helpline 139.'
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
      channel: 'Cyber Crime Reporting in India',
      guidance: 'For travel phishing, OTP theft, or UPI extortion, report directly to 1930 or file an incident at cybercrime.gov.in.'
    }
  ];

  return {
    success: true,
    riskLevel,
    riskBadgeVariant,
    totalScore,
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
