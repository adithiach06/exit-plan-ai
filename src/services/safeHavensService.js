/**
 * Safe Havens Service
 * Queries OpenStreetMap (OSM) Nominatim for geocoding and OSM Overpass API
 * for live, real-world public safety and transit facilities across India.
 *
 * Attribution:
 * - Map tiles and data: (c) OpenStreetMap contributors (ODbL)
 * - Geocoding: Nominatim (OpenStreetMap)
 * - Facility queries: Overpass API
 *
 * Privacy:
 * - Coordinates are strictly used in-flight for querying public POIs.
 * - No user location data is persisted or sent to third-party ad networks.
 */

export const HAVEN_CATEGORIES = [
  { id: 'all', label: 'All Havens', icon: 'all' },
  { id: 'medical', label: 'Hospitals & Medical', icon: 'medical' },
  { id: 'police', label: 'Police Stations', icon: 'police' },
  { id: 'railway', label: 'Railway Stations', icon: 'railway' },
  { id: 'bus', label: 'Bus Terminals', icon: 'bus' },
  { id: 'hotel', label: 'Hotels & Accommodation', icon: 'hotel' }
];

export const AVAILABLE_SEARCH_RADII = [
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 6000, label: '6 km (Default)' },
  { value: 10000, label: '10 km' }
];

export const POPULAR_LOCATIONS = [
  { label: 'Bengaluru (Majestic)', query: 'Majestic, Bengaluru, Karnataka', lat: 12.9767, lon: 77.5713 },
  { label: 'Mumbai (CSMT Area)', query: 'Chhatrapati Shivaji Maharaj Terminus, Mumbai', lat: 18.9401, lon: 72.8354 },
  { label: 'New Delhi (Connaught Place)', query: 'Connaught Place, New Delhi', lat: 28.6315, lon: 77.2167 },
  { label: 'Udupi (City Center)', query: 'City Bus Stand, Udupi, Karnataka', lat: 13.3409, lon: 74.7421 },
  { label: 'Jaipur (Station Road)', query: 'Railway Station Road, Jaipur, Rajasthan', lat: 26.9212, lon: 75.7873 }
];

// Bounded in-memory session cache for query results
// Strictly held in browser memory: no localStorage, no cookies, no tracking.
const MAX_CACHE_ENTRIES = 30;
const facilityCache = new Map();

// In-flight query deduplication map to prevent multiple identical requests simultaneously
const inFlightQueries = new Map();

// Helper for exponential backoff delay between retry attempts
const waitDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCacheKey(lat, lon, category, radiusMeters) {
  const rLat = Number(lat).toFixed(3);
  const rLon = Number(lon).toFixed(3);
  return `${rLat}_${rLon}_${category}_${radiusMeters}`;
}

export function getCachedSafeHavens(lat, lon, category, radiusMeters) {
  const key = getCacheKey(lat, lon, category, radiusMeters);
  return facilityCache.get(key) || null;
}

export function setCachedSafeHavens(lat, lon, category, radiusMeters, data) {
  if (!data || !Array.isArray(data.facilities)) return;
  const key = getCacheKey(lat, lon, category, radiusMeters);

  if (facilityCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = facilityCache.keys().next().value;
    facilityCache.delete(oldestKey);
  }
  facilityCache.set(key, data);
}

export function clearSafeHavensCache() {
  facilityCache.clear();
}

// Public Overpass API mirrors in priority order
// Tested French OSM community mirror responds reliably in 1-5s; fallbacks provide multi-region resilience
export const OVERPASS_ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

/**
 * Calculates Haversine distance in kilometers between two lat/lon coordinates.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Geocode a location search string via OpenStreetMap Nominatim.
 */
export async function geocodeLocation(query) {
  if (!query || query.trim().length < 2) {
    throw new Error('Please enter a city, neighbourhood, or landmark name to search.');
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query.trim()
  )}&countrycodes=in&limit=5&addressdetails=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Location lookup returned HTTP status ${res.status}.`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No locations found in India matching "${query}". Please check the spelling or try a nearby city.`);
    }

    return data.map((item) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Location lookup request timed out. Please check your internet connection and try again.');
    }
    throw err;
  }
}

/**
 * Reverse geocode a latitude and longitude coordinate to human-readable place.
 */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    }

    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      return parts.slice(0, 3).join(',').trim();
    }
    return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  } catch {
    clearTimeout(timeoutId);
    return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }
}

/**
 * Builds an optimized, category-specific Overpass QL query string.
 * Uses node-way-relation (nwr) unions and bounded radius to dramatically reduce
 * execution latency on OpenStreetMap community infrastructure.
 */
function buildOverpassQuery(lat, lon, category = 'all', radiusMeters = 6000) {
  let clauses = '';

  if (category === 'railway') {
    clauses = `
      nwr["railway"~"^(station|halt)$"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'police') {
    clauses = `
      nwr["amenity"="police"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'medical') {
    clauses = `
      nwr["amenity"~"^(hospital|clinic|pharmacy)$"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'bus') {
    clauses = `
      nwr["amenity"="bus_station"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'hotel') {
    clauses = `
      nwr["tourism"~"^(hotel|hostel|guest_house)$"](around:${radiusMeters},${lat},${lon});
    `;
  } else {
    // 'all': Target high-priority safety & major transit hubs
    clauses = `
      nwr["amenity"~"^(hospital|police|bus_station)$"](around:${radiusMeters},${lat},${lon});
      nwr["railway"~"^(station|halt)$"](around:${radiusMeters},${lat},${lon});
      nwr["tourism"~"^(hotel|hostel|guest_house)$"](around:${radiusMeters},${lat},${lon});
    `;
  }

  return `[out:json][timeout:15];(${clauses});out center tags 50;`.trim();
}

/**
 * Categorizes an OSM element and normalizes verified attributes.
 */
function normalizeOsmFacility(element, centerLat, centerLon) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (lat == null || lon == null) return null;

  let category = 'other';
  let subcategory = 'Facility';

  if (tags.amenity === 'hospital') {
    category = 'medical';
    subcategory = 'Hospital';
  } else if (tags.amenity === 'clinic') {
    category = 'medical';
    subcategory = 'Medical Clinic';
  } else if (tags.amenity === 'pharmacy') {
    category = 'medical';
    subcategory = 'Pharmacy';
  } else if (tags.amenity === 'police') {
    category = 'police';
    const isWomenDesk =
      tags.female === 'yes' ||
      tags.women === 'yes' ||
      /mahila|women/i.test(tags.name || '') ||
      /mahila|women/i.test(tags.operator || '');
    subcategory = isWomenDesk ? 'Mahila / Women Police Desk' : 'Police Station';
  } else if (tags.railway === 'station' || tags.railway === 'halt') {
    category = 'railway';
    subcategory = 'Railway Station';
  } else if (tags.amenity === 'bus_station') {
    category = 'bus';
    subcategory = 'Bus Terminal';
  } else if (['hotel', 'hostel', 'guest_house'].includes(tags.tourism)) {
    category = 'hotel';
    subcategory =
      tags.tourism === 'hotel'
        ? 'Hotel'
        : tags.tourism === 'hostel'
        ? 'Youth Hostel'
        : 'Guest House';
  }

  // Derive human-readable name or fallback to category-specific title
  let name = tags.name || tags['name:en'] || tags.operator || tags.brand;
  if (!name) {
    if (category === 'police') name = 'Police Station (Name unlisted in OSM)';
    else if (category === 'medical') name = subcategory === 'Pharmacy' ? 'Pharmacy' : 'Medical Center';
    else if (category === 'railway') name = 'Railway Station';
    else if (category === 'bus') name = 'Bus Terminal';
    else if (category === 'hotel') name = 'Accommodation Facility';
    else name = 'Safety Facility';
  }

  // Format real street address if tags are present
  const addressParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:district'],
    tags['addr:city'],
    tags['addr:postcode']
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(', ') : null;

  // Extract authentic contact information if available
  const phone =
    tags.phone ||
    tags['contact:phone'] ||
    tags['emergency:phone'] ||
    tags['operator:phone'] ||
    null;

  const website = tags.website || tags['contact:website'] || null;

  // 24/7 or emergency indicator
  const is24_7 = tags.opening_hours === '24/7' || tags['emergency'] === 'yes';
  const openingHours = tags.opening_hours || (is24_7 ? '24/7' : null);

  const distanceKm = calculateDistanceKm(centerLat, centerLon, lat, lon);

  return {
    id: `${element.type}-${element.id}`,
    osmId: element.id,
    osmType: element.type,
    name,
    category,
    subcategory,
    lat,
    lon,
    distanceKm,
    address,
    phone,
    website,
    is24_7,
    openingHours,
    isWomenDesk:
      category === 'police' &&
      (tags.female === 'yes' ||
        tags.women === 'yes' ||
        /mahila|women/i.test(name) ||
        /mahila|women/i.test(tags.operator || '')),
    osmLink: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
  };
}

/**
 * Fetch live public safety facilities within radius from OpenStreetMap Overpass API.
 * Uses:
 * 1. Bounded in-memory session cache (returns instantly if query was already retrieved)
 * 2. In-flight query deduplication (prevents duplicate simultaneous network requests)
 * 3. Priority list of reliable public Overpass mirrors
 * 4. Bounded retry strategy with backoff delays
 * 5. Multi-endpoint failover on timeout / HTTP 5xx / rate limits
 */
export async function fetchLiveSafeHavens(lat, lon, category = 'all', radiusMeters = 6000) {
  if (lat == null || lon == null) {
    throw new Error('Valid coordinates are required to query safe havens.');
  }

  // 1. Check bounded in-memory cache first to eliminate duplicate network queries
  const cached = getCachedSafeHavens(lat, lon, category, radiusMeters);
  if (cached) {
    return {
      ...cached,
      fromCache: true
    };
  }

  // 2. In-flight request deduplication: reuse existing promise if identical query is currently in progress
  const cacheKey = getCacheKey(lat, lon, category, radiusMeters);
  if (inFlightQueries.has(cacheKey)) {
    return inFlightQueries.get(cacheKey);
  }

  const queryPromise = (async () => {
    const query = buildOverpassQuery(lat, lon, category, radiusMeters);
    let lastError = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      // Small number of bounded retry attempts per endpoint (2 attempts max) with backoff
      const maxAttempts = 2;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (attempt > 1) {
          // Exponential backoff with small random jitter: ~600-800ms
          await waitDelay(600 * attempt + Math.floor(Math.random() * 200));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
          const params = new URLSearchParams();
          params.append('data', query);

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ExitPlanAI-SafetyApp/1.0 (https://exitplan.ai; contact@exitplan.ai)'
            },
            body: params,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (res.status === 429) {
            throw new Error('OpenStreetMap Overpass servers are rate-limited due to high community traffic (HTTP 429).');
          }

          if (res.status === 502 || res.status === 503 || res.status === 504) {
            throw new Error(`OpenStreetMap Overpass service temporarily unavailable (HTTP ${res.status}).`);
          }

          if (res.status === 406 || res.status === 400) {
            throw new Error(`OpenStreetMap Overpass service rejected the query (HTTP ${res.status}).`);
          }

          if (!res.ok) {
            throw new Error(`Overpass service returned HTTP ${res.status}.`);
          }

          const json = await res.json();
          if (!json || !Array.isArray(json.elements)) {
            throw new Error('Invalid response structure received from OpenStreetMap Overpass.');
          }

          const facilities = json.elements
            .map((el) => normalizeOsmFacility(el, lat, lon))
            .filter(Boolean)
            .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

          const result = {
            facilities,
            total: facilities.length,
            center: { lat, lon },
            category,
            radiusMeters,
            source: 'OpenStreetMap Overpass API',
            endpointUsed: endpoint,
            fetchedAt: new Date().toISOString()
          };

          // Cache only successfully retrieved real-world facilities in session memory
          setCachedSafeHavens(lat, lon, category, radiusMeters, result);

          return result;
        } catch (err) {
          clearTimeout(timeoutId);
          lastError = err;
          // Loop will retry on next attempt or advance to the next endpoint mirror
        }
      }
    }

    if (lastError?.name === 'AbortError') {
      throw new Error(
        'Live facility query timed out. The OpenStreetMap community service is currently experiencing heavy global load. Please retry or search another location.'
      );
    }

    throw new Error(
      lastError?.message ||
        'Unable to connect to OpenStreetMap Overpass servers. Please verify your internet connection and retry.'
    );
  })();

  inFlightQueries.set(cacheKey, queryPromise);

  try {
    return await queryPromise;
  } finally {
    inFlightQueries.delete(cacheKey);
  }
}
