/**
 * Storage Service - Local Persistence Layer for EXIT PLAN AI
 * Ensures vital travel safety data remains accessible when offline or out of cell coverage.
 */

export const STORAGE_KEYS = {
  EXIT_PLANS: 'exitplanai_plans',
  ACTIVE_PLAN_ID: 'exitplanai_active_plan_id',
  EMERGENCY_CONTACTS: 'exitplanai_emergency_contacts',
  PERSONAL_CONTACTS: 'exitplanai_personal_contacts',
  VAULT_CHECKLIST: 'exitplanai_vault_checklist',
  SCANNED_MESSAGES: 'exitplanai_scanned_messages',
  USER_PROFILE: 'exitplanai_user_profile',
  SETTINGS: 'exitplanai_settings'
};

// Default emergency helplines in India for solo female travellers
export const DEFAULT_INDIA_HOTLINES = [
  { name: 'National Emergency Number', number: '112', purpose: 'Police, Fire, Ambulance universal response', priority: 'high' },
  { name: 'Women Helpline (All India)', number: '1091', purpose: 'Immediate police response for women in distress', priority: 'high' },
  { name: 'Women Helpline (Domestic/Distress)', number: '181', purpose: '24/7 National commission crisis support', priority: 'medium' },
  { name: 'Railway Protection Force (RPF)', number: '139', purpose: 'Train travel distress & security assistance', priority: 'medium' },
  { name: 'Tourist Helpline (Incredible India)', number: '1363', purpose: 'Toll-free multi-language tourist support', priority: 'standard' },
  { name: 'Cyber Crime Helpline', number: '1930', purpose: 'Report travel phishing, OTP theft & cyber fraud', priority: 'high' }
];

/**
 * Generate a collision-resistant unique ID for safety plans
 */
export const generatePlanId = () => {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Normalize a plan object to ensure required fields and stable ID
 */
const normalizePlan = (rawPlan, fallbackIndex = 0) => {
  if (!rawPlan || typeof rawPlan !== 'object') return null;

  return {
    id: rawPlan.id || `plan_legacy_${Date.now()}_${fallbackIndex}`,
    startingLocation: rawPlan.startingLocation || '',
    destination: rawPlan.destination || 'Unspecified Trip',
    departureDate: rawPlan.departureDate || '',
    returnDate: rawPlan.returnDate || '',
    transportMethod: rawPlan.transportMethod || 'Train',
    accommodation: rawPlan.accommodation || '',
    emergencyContactName: rawPlan.emergencyContactName || '',
    emergencyContactPhone: rawPlan.emergencyContactPhone || '',
    notes: rawPlan.notes || '',
    checklist: Array.isArray(rawPlan.checklist) ? rawPlan.checklist : [],
    createdAt: rawPlan.createdAt || new Date().toISOString(),
    updatedAt: rawPlan.updatedAt || new Date().toISOString()
  };
};

/**
 * Retrieve all stored safety plans with graceful fallback and auto-repair
 */
export const getStoredPlans = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const data = window.localStorage.getItem(STORAGE_KEYS.EXIT_PLANS);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    let needsRepair = false;
    const normalized = parsed
      .map((item, index) => {
        if (!item?.id) needsRepair = true;
        return normalizePlan(item, index);
      })
      .filter(Boolean);

    // If any plan had missing IDs or malformed structure, auto-repair storage
    if (needsRepair && normalized.length > 0) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.EXIT_PLANS, JSON.stringify(normalized));
      } catch (e) {
        console.warn('Could not auto-repair normalized plans in localStorage:', e);
      }
    }

    return normalized;
  } catch (e) {
    console.error('Failed to read plans from storage:', e);
    return [];
  }
};

/**
 * Retrieve active plan ID from storage
 */
export const getActivePlanId = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Set active plan ID in storage
 */
export const setActivePlanId = (id) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (id) {
      window.localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
    }
  } catch (e) {
    console.warn('Failed to set active plan ID in localStorage:', e);
  }
};

/**
 * Retrieve the active plan object (or fallback to latest saved plan)
 */
export const getActivePlan = () => {
  const plans = getStoredPlans();
  if (plans.length === 0) return null;

  const activeId = getActivePlanId();
  if (activeId) {
    const found = plans.find((p) => p.id === activeId);
    if (found) return found;
  }

  // Fallback to first (most recent) plan and sync active ID
  const defaultPlan = plans[0];
  setActivePlanId(defaultPlan.id);
  return defaultPlan;
};

/**
 * Retrieve a specific plan by its ID
 */
export const getPlanById = (id) => {
  if (!id) return null;
  const plans = getStoredPlans();
  return plans.find((p) => p.id === id) || null;
};

/**
 * Save or update a safety plan
 * Returns { success: boolean, plans: Array, savedPlan: Object, error?: string }
 */
export const savePlan = (plan) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, plans: [], error: 'LocalStorage unavailable in this environment' };
    }

    const plans = getStoredPlans();
    const timestamp = new Date().toISOString();
    const planId = plan.id || generatePlanId();

    const planToSave = normalizePlan({
      ...plan,
      id: planId,
      createdAt: plan.createdAt || timestamp,
      updatedAt: timestamp
    });

    // If existing, update in place; otherwise prepend
    const existingIndex = plans.findIndex((p) => p.id === planId);
    let updatedPlans;
    if (existingIndex >= 0) {
      updatedPlans = [...plans];
      updatedPlans[existingIndex] = planToSave;
    } else {
      updatedPlans = [planToSave, ...plans];
    }

    window.localStorage.setItem(STORAGE_KEYS.EXIT_PLANS, JSON.stringify(updatedPlans));
    setActivePlanId(planId);

    return {
      success: true,
      plans: updatedPlans,
      savedPlan: planToSave
    };
  } catch (e) {
    console.error('Failed to save plan to storage:', e);
    return {
      success: false,
      plans: getStoredPlans(),
      savedPlan: plan,
      error: e.message || 'Storage quota exceeded or storage disabled'
    };
  }
};

/**
 * Update checklist completion status for a given plan
 * Returns { success: boolean, plans: Array, updatedPlan?: Object, error?: string }
 */
export const updatePlanChecklist = (planId, checklist) => {
  try {
    if (!planId) return { success: false, plans: getStoredPlans(), error: 'Missing plan ID' };
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, plans: [], error: 'LocalStorage unavailable' };
    }

    const plans = getStoredPlans();
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) {
      return { success: false, plans, error: `Plan with ID ${planId} not found` };
    }

    const updatedPlan = {
      ...targetPlan,
      checklist,
      updatedAt: new Date().toISOString()
    };

    const updatedPlans = plans.map((p) => (p.id === planId ? updatedPlan : p));
    window.localStorage.setItem(STORAGE_KEYS.EXIT_PLANS, JSON.stringify(updatedPlans));

    return {
      success: true,
      plans: updatedPlans,
      updatedPlan
    };
  } catch (e) {
    console.error('Failed to update plan checklist in storage:', e);
    return {
      success: false,
      plans: getStoredPlans(),
      error: e.message || 'Failed to update checklist in storage'
    };
  }
};

/**
 * Delete a safety plan by ID
 * Returns { success: boolean, plans: Array, nextActivePlan: Object|null, error?: string }
 */
export const deletePlan = (id) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, plans: [], nextActivePlan: null, error: 'LocalStorage unavailable' };
    }

    const plans = getStoredPlans();
    const filtered = plans.filter((p) => p.id !== id);
    window.localStorage.setItem(STORAGE_KEYS.EXIT_PLANS, JSON.stringify(filtered));

    let nextActivePlan = null;
    const currentActiveId = getActivePlanId();

    if (currentActiveId === id) {
      nextActivePlan = filtered.length > 0 ? filtered[0] : null;
      setActivePlanId(nextActivePlan ? nextActivePlan.id : null);
    } else {
      nextActivePlan = filtered.find((p) => p.id === currentActiveId) || (filtered[0] || null);
    }

    return {
      success: true,
      plans: filtered,
      nextActivePlan
    };
  } catch (e) {
    console.error('Failed to delete plan from storage:', e);
    return {
      success: false,
      plans: getStoredPlans(),
      nextActivePlan: null,
      error: e.message || 'Failed to delete plan from storage'
    };
  }
};

export const getEmergencyContacts = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_INDIA_HOTLINES;
    const data = window.localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return data ? JSON.parse(data) : DEFAULT_INDIA_HOTLINES;
  } catch (e) {
    console.error('Failed to read emergency contacts:', e);
    return DEFAULT_INDIA_HOTLINES;
  }
};

/**
 * Default Essential Safety Checklist for Solo Female Travellers
 */
export const DEFAULT_SAFETY_CHECKLIST = [
  { id: 'item_id', label: 'Government Photo ID / Passport (Physical + Digital Copy)', category: 'Identification', checked: false },
  { id: 'item_tickets', label: 'Printed & Digital Transport Tickets / Boarding Passes', category: 'Transit', checked: false },
  { id: 'item_cash', label: 'Emergency Cash in Small Denominations (₹500 / ₹100 / ₹50 stored separately)', category: 'Finance', checked: false },
  { id: 'item_phone', label: 'Fully Charged Mobile Phone with Emergency Numbers Saved in Speed Dial', category: 'Communication', checked: false },
  { id: 'item_powerbank', label: 'High-Capacity Power Bank (Fully Charged) & Charging Cables', category: 'Electronics', checked: false },
  { id: 'item_meds', label: 'Essential Prescription Medication & Personal Travel First-Aid Kit', category: 'Health', checked: false },
  { id: 'item_lock', label: 'Portable Door Lock / Rubber Door Stopper for Hotel or Homestay Room', category: 'Accommodation', checked: false },
  { id: 'item_offline_maps', label: 'Offline Maps Downloaded for Destination & Transit Route', category: 'Navigation', checked: false },
  { id: 'item_shared_itinerary', label: 'Live Travel Itinerary & Backup Plan Shared with Trusted Contact', category: 'Security', checked: false },
  { id: 'item_safety_alarm', label: 'Personal Safety Alarm / Whistle in an Easily Accessible Pocket', category: 'Safety', checked: false }
];

/**
 * Generate a unique ID for personal emergency contacts
 */
export const generateContactId = () => {
  return `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

/**
 * Retrieve personal emergency contacts from storage
 */
export const getPersonalContacts = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const data = window.localStorage.getItem(STORAGE_KEYS.PERSONAL_CONTACTS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read personal contacts from storage:', e);
    return [];
  }
};

/**
 * Save or update a personal emergency contact
 * Returns { success: boolean, contacts: Array, savedContact: Object, error?: string }
 */
export const savePersonalContact = (contact) => {
  try {
    if (!contact || !contact.name || !contact.phone) {
      return { success: false, contacts: getPersonalContacts(), error: 'Name and phone number are required.' };
    }

    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, contacts: [], error: 'LocalStorage unavailable in this environment' };
    }

    const contacts = getPersonalContacts();
    const contactId = contact.id || generateContactId();
    const now = new Date().toISOString();

    const normalizedContact = {
      id: contactId,
      name: contact.name.trim(),
      relationship: (contact.relationship || 'Emergency Contact').trim(),
      phone: contact.phone.trim(),
      notes: (contact.notes || '').trim(),
      createdAt: contact.createdAt || now,
      updatedAt: now
    };

    const existingIndex = contacts.findIndex((c) => c.id === contactId);
    let updatedContacts;
    if (existingIndex >= 0) {
      updatedContacts = [...contacts];
      updatedContacts[existingIndex] = normalizedContact;
    } else {
      updatedContacts = [normalizedContact, ...contacts];
    }

    window.localStorage.setItem(STORAGE_KEYS.PERSONAL_CONTACTS, JSON.stringify(updatedContacts));

    return {
      success: true,
      contacts: updatedContacts,
      savedContact: normalizedContact
    };
  } catch (e) {
    console.error('Failed to save personal contact:', e);
    return {
      success: false,
      contacts: getPersonalContacts(),
      error: e.message || 'Storage error while saving contact.'
    };
  }
};

/**
 * Delete a personal emergency contact by ID
 * Returns { success: boolean, contacts: Array, error?: string }
 */
export const deletePersonalContact = (id) => {
  try {
    if (!id) return { success: false, contacts: getPersonalContacts(), error: 'Missing contact ID' };
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, contacts: [], error: 'LocalStorage unavailable' };
    }

    const contacts = getPersonalContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    window.localStorage.setItem(STORAGE_KEYS.PERSONAL_CONTACTS, JSON.stringify(filtered));

    return {
      success: true,
      contacts: filtered
    };
  } catch (e) {
    console.error('Failed to delete personal contact:', e);
    return {
      success: false,
      contacts: getPersonalContacts(),
      error: e.message || 'Storage error while deleting contact.'
    };
  }
};

/**
 * Retrieve the personal safety checklist from storage with fallback to default items
 */
export const getSafetyChecklist = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SAFETY_CHECKLIST;
    const data = window.localStorage.getItem(STORAGE_KEYS.VAULT_CHECKLIST);
    if (!data) return DEFAULT_SAFETY_CHECKLIST;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SAFETY_CHECKLIST;

    // Merge stored check state with default checklist to prevent schema drift
    return DEFAULT_SAFETY_CHECKLIST.map((defaultItem) => {
      const stored = parsed.find((p) => p.id === defaultItem.id);
      return stored ? { ...defaultItem, checked: Boolean(stored.checked) } : defaultItem;
    });
  } catch (e) {
    console.error('Failed to read safety checklist from storage:', e);
    return DEFAULT_SAFETY_CHECKLIST;
  }
};

/**
 * Save updated personal safety checklist state
 * Returns { success: boolean, checklist: Array, error?: string }
 */
export const saveSafetyChecklist = (checklist) => {
  try {
    if (!Array.isArray(checklist)) {
      return { success: false, checklist: DEFAULT_SAFETY_CHECKLIST, error: 'Invalid checklist format' };
    }
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, checklist, error: 'LocalStorage unavailable' };
    }

    window.localStorage.setItem(STORAGE_KEYS.VAULT_CHECKLIST, JSON.stringify(checklist));
    return { success: true, checklist };
  } catch (e) {
    console.error('Failed to save safety checklist:', e);
    return { success: false, checklist: getSafetyChecklist(), error: e.message || 'Storage error' };
  }
};

/**
 * Reset personal safety checklist (uncheck all items)
 */
export const resetSafetyChecklist = () => {
  const resetList = DEFAULT_SAFETY_CHECKLIST.map((item) => ({ ...item, checked: false }));
  return saveSafetyChecklist(resetList);
};
