import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  ShieldIcon,
  PhoneIcon,
  MapPinIcon,
  AlertIcon,
  InfoIcon,
  SearchIcon,
  CrosshairIcon,
  HospitalIcon,
  TrainIcon,
  BusIcon,
  BedIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  CheckIcon,
  MoonIcon,
  CompassIcon,
  ArrowRightIcon,
  LockIcon
} from '../components/common/Icons';

import {
  HAVEN_CATEGORIES,
  POPULAR_LOCATIONS,
  AVAILABLE_SEARCH_RADII,
  geocodeLocation,
  reverseGeocode,
  fetchLiveSafeHavens,
  getCachedSafeHavens
} from '../services/safeHavensService';

import { getActivePlan } from '../services/storage';

// Default initial map viewpoint: Bengaluru Central
const DEFAULT_CENTER = {
  lat: 12.9767,
  lon: 77.5713,
  label: 'Bengaluru (Central), Karnataka'
};

// Situation-Based Emergency Shortcuts definitions
export const SITUATION_PRESETS = [
  {
    id: 'unsafe',
    label: 'Need Police / Feeling Unsafe',
    category: 'police',
    icon: ShieldIcon,
    activeClass: 'active-unsafe',
    filter247: false,
    filterWomen: false,
    helplines: [
      { number: '112', name: 'Police / Emergency' },
      { number: '1091', name: 'Women Helpline' }
    ],
    advisory:
      'Showing nearby police stations and Mahila helpdesks. For immediate physical pursuit or danger, dial 112 or 1091 directly. OpenStreetMap records physical facility presence and does not guarantee live staffing on site.'
  },
  {
    id: 'medical',
    label: 'Medical Emergency',
    category: 'medical',
    icon: HospitalIcon,
    activeClass: 'active-medical',
    filter247: false,
    filterWomen: false,
    helplines: [
      { number: '108', name: 'Ambulance' },
      { number: '112', name: 'Emergency' }
    ],
    advisory:
      'Showing hospitals, clinics, and pharmacies. For urgent ambulance dispatch, call 108 immediately. Facilities without confirmed 24/7 records may have closed entrance gates.'
  },
  {
    id: 'night',
    label: 'Stranded at Night',
    category: 'all',
    icon: MoonIcon,
    activeClass: 'active-night',
    filter247: true,
    filterWomen: false,
    helplines: [
      { number: '112', name: 'Police' },
      { number: '139', name: 'Railway Security' }
    ],
    advisory:
      'Filtered for facilities with confirmed 24/7 hours (major 24-hour transit stations, police stations, and 24-hour reception accommodations). Physical records do not guarantee open gates.'
  },
  {
    id: 'transit',
    label: 'Transit Disrupted',
    category: 'railway',
    icon: TrainIcon,
    activeClass: 'active-transit',
    filter247: false,
    filterWomen: false,
    helplines: [
      { number: '139', name: 'Railway Security' },
      { number: '1363', name: 'Tourist Helpline' }
    ],
    advisory:
      'Showing railway stations and transit hubs. Call 139 for train security or 1363 for traveller transit assistance.'
  }
];

export const AssistanceMap = () => {
  const [searchInput, setSearchInput] = useState('');
  const [currentLocationName, setCurrentLocationName] = useState(DEFAULT_CENTER.label);
  const [activeCategory, setActiveCategory] = useState('all');
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);

  // Active Situation Preset state: null | 'unsafe' | 'medical' | 'night' | 'transit'
  const [activeSituation, setActiveSituation] = useState(null);

  // Active Trip Plan retrieved from storage
  const [activePlan, setActivePlan] = useState(null);

  // Search Radius and Quick Filter states
  const [searchRadius, setSearchRadius] = useState(6000); // 6 km default (preserves existing behaviour)
  const [filter24x7, setFilter24x7] = useState(false);
  const [filterWomenDesk, setFilterWomenDesk] = useState(false);

  // Geographic and async states
  const [centerCoords, setCenterCoords] = useState({ lat: DEFAULT_CENTER.lat, lon: DEFAULT_CENTER.lon });
  const [userCoords, setUserCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Network connectivity and offline recovery state
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [justReconnected, setJustReconnected] = useState(false);
  const [tileErrorOccurred, setTileErrorOccurred] = useState(false);

  // Monotonically increasing request sequence counter to prevent race conditions
  const activeRequestIdRef = useRef(0);

  // DOM and Leaflet instance references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markerMapRef = useRef(new Map());
  const cardListRef = useRef(null);
  const facilityCardsRef = useRef({});

  // ---------------------------------------------------------------------------
  // Online / Offline Connectivity Event Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTileErrorOccurred(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
      setErrorMessage(
        "You're currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault."
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Leaflet Map Initialization, Stability & Cleanup
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lon],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Standard OpenStreetMap Tiles with required attribution
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      tileLayer.on('tileerror', () => {
        setTileErrorOccurred(true);
      });

      tileLayer.addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // Call invalidateSize after initial render layout settles
    const layoutTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 350);

    // Debounced resize & orientation change listener
    let resizeTimer = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(layoutTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        userMarkerRef.current = null;
        markerMapRef.current.clear();
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Initial Load: Fetch safe havens for default city & Retrieve Active Trip Plan
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const cached = getCachedSafeHavens(DEFAULT_CENTER.lat, DEFAULT_CENTER.lon, 'all', 6000);
    if (cached) {
      loadHavensForCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lon, DEFAULT_CENTER.label, 'all', null, 6000);
    } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setErrorMessage(
        "You're currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault."
      );
      setHasSearched(true);
    } else {
      loadHavensForCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lon, DEFAULT_CENTER.label, 'all', null, 6000);
    }

    // Read active travel plan destination from Safety Vault if present
    try {
      const plan = getActivePlan();
      if (plan && plan.destination && plan.destination.trim()) {
        setActivePlan(plan);
      } else {
        setActivePlan(null);
      }
    } catch (e) {
      console.warn('Could not read active travel plan from storage:', e);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch POIs for a specific coordinate and category
  // CRITICAL: Map center and coordinates update IMMEDIATELY, decoupled from POI fetching
  // ---------------------------------------------------------------------------
  const loadHavensForCoordinates = async (
    lat,
    lon,
    label,
    category = activeCategory,
    explicitRequestId,
    radius = searchRadius
  ) => {
    const currentReqId = explicitRequestId || ++activeRequestIdRef.current;

    // 1. Immediately update coordinates, label, and map view
    setCenterCoords({ lat, lon });
    if (label) setCurrentLocationName(label);
    setHasSearched(true);
    setSelectedFacilityId(null);

    if (mapInstanceRef.current) {
      const zoomLevel = radius <= 2500 ? 15 : radius >= 10000 ? 13 : 14;
      mapInstanceRef.current.setView([lat, lon], zoomLevel, { animate: true });
      // Ensure tiles render completely
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }

    setIsLoading(true);
    setLoadingMessage(
      `Querying OpenStreetMap for ${
        category === 'all'
          ? 'verified public safe havens'
          : category === 'railway'
          ? 'railway stations'
          : category === 'police'
          ? 'police stations'
          : category === 'medical'
          ? 'hospitals and clinics'
          : category === 'bus'
          ? 'bus terminals'
          : 'hotels and accommodations'
      } (within ${radius / 1000} km)...`
    );
    setErrorMessage(null);

    try {
      const result = await fetchLiveSafeHavens(lat, lon, category, radius);

      // Check if a newer request has started while this was in-flight
      if (currentReqId !== activeRequestIdRef.current) return;

      setFacilities(result.facilities || []);
      setErrorMessage(null);
      setIsOnline(true);
    } catch (err) {
      if (currentReqId !== activeRequestIdRef.current) return;
      const isOff =
        (typeof navigator !== 'undefined' && !navigator.onLine) ||
        err.isOffline ||
        err.code === 'OFFLINE' ||
        err.message?.includes('offline') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');

      if (isOff) {
        setIsOnline(false);
        setErrorMessage(
          "You're currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault."
        );
      } else {
        setErrorMessage(err.message || 'Unable to retrieve facilities for this location.');
      }
      // Requirement 3: Preserve any already-loaded facility information where safe and practical.
      // Do not erase valid cached data merely because a request fails.
    } finally {
      if (currentReqId === activeRequestIdRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Situation-Based Emergency Quick-Action Preset Toggler
  // ---------------------------------------------------------------------------
  const handleToggleSituation = (situationId) => {
    if (activeSituation === situationId) {
      // Toggle off preset and restore all categories
      setActiveSituation(null);
      setFilter24x7(false);
      setFilterWomenDesk(false);
      setActiveCategory('all');
      setSelectedFacilityId(null);
      loadHavensForCoordinates(centerCoords.lat, centerCoords.lon, currentLocationName, 'all', null, searchRadius);
    } else {
      const preset = SITUATION_PRESETS.find((s) => s.id === situationId);
      if (!preset) return;
      setActiveSituation(situationId);
      setFilter24x7(preset.filter247);
      setFilterWomenDesk(preset.filterWomen);
      setActiveCategory(preset.category);
      setSelectedFacilityId(null);
      loadHavensForCoordinates(centerCoords.lat, centerCoords.lon, currentLocationName, preset.category, null, searchRadius);
    }
  };

  // ---------------------------------------------------------------------------
  // Category Filter Pill Click
  // ---------------------------------------------------------------------------
  const handleCategoryChange = (newCatId) => {
    setActiveCategory(newCatId);
    if (activeSituation) setActiveSituation(null);
    setSelectedFacilityId(null);
    loadHavensForCoordinates(centerCoords.lat, centerCoords.lon, currentLocationName, newCatId, null, searchRadius);
  };

  // ---------------------------------------------------------------------------
  // Search Destination Shortcut from Active Trip Plan
  // ---------------------------------------------------------------------------
  const handleSearchDestination = async (destQuery) => {
    if (!destQuery || !destQuery.trim()) return;
    setSearchInput(destQuery.trim());
    const currentReqId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setLoadingMessage(`Locating trip destination "${destQuery.trim()}" in India...`);
    setErrorMessage(null);

    try {
      const geocoded = await geocodeLocation(destQuery.trim());
      if (currentReqId !== activeRequestIdRef.current) return;

      const bestMatch = geocoded[0];
      const cleanLabel = bestMatch.displayName.split(',').slice(0, 3).join(', ').trim();

      setCurrentLocationName(cleanLabel);
      setCenterCoords({ lat: bestMatch.lat, lon: bestMatch.lon });

      if (mapInstanceRef.current) {
        const zoomLevel = searchRadius <= 2500 ? 15 : searchRadius >= 10000 ? 13 : 14;
        mapInstanceRef.current.setView([bestMatch.lat, bestMatch.lon], zoomLevel, { animate: true });
      }

      await loadHavensForCoordinates(bestMatch.lat, bestMatch.lon, cleanLabel, activeCategory, currentReqId, searchRadius);
    } catch (err) {
      if (currentReqId !== activeRequestIdRef.current) return;
      setErrorMessage(`Could not locate trip destination "${destQuery}". Please check the spelling or search manually.`);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // ---------------------------------------------------------------------------
  // Radius Selector Click
  // ---------------------------------------------------------------------------
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    setSelectedFacilityId(null);
    loadHavensForCoordinates(centerCoords.lat, centerCoords.lon, currentLocationName, activeCategory, null, newRadius);
  };

  // ---------------------------------------------------------------------------
  // Search Submission via Nominatim Geocoding
  // ---------------------------------------------------------------------------
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (!query || query.length < 2) {
      setErrorMessage('Please enter a city, neighbourhood, or landmark name to search.');
      return;
    }

    const currentReqId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setLoadingMessage(`Finding "${query}" in India...`);
    setErrorMessage(null);

    try {
      const geocoded = await geocodeLocation(query);

      // Discard if user submitted a newer search in the meantime
      if (currentReqId !== activeRequestIdRef.current) return;

      const bestMatch = geocoded[0];
      const cleanLabel = bestMatch.displayName.split(',').slice(0, 3).join(', ').trim();

      // Recenter map immediately upon successful geocode
      setCurrentLocationName(cleanLabel);
      setCenterCoords({ lat: bestMatch.lat, lon: bestMatch.lon });

      if (mapInstanceRef.current) {
        const zoomLevel = searchRadius <= 2500 ? 15 : searchRadius >= 10000 ? 13 : 14;
        mapInstanceRef.current.setView([bestMatch.lat, bestMatch.lon], zoomLevel, { animate: true });
      }

      // Fetch facilities for this location
      await loadHavensForCoordinates(bestMatch.lat, bestMatch.lon, cleanLabel, activeCategory, currentReqId, searchRadius);
    } catch (err) {
      if (currentReqId !== activeRequestIdRef.current) return;
      setErrorMessage(err.message);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // ---------------------------------------------------------------------------
  // Browser Geolocation ("Use My Location")
  // ---------------------------------------------------------------------------
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setPermissionError('Geolocation is not supported by your current browser.');
      return;
    }

    const currentReqId = ++activeRequestIdRef.current;
    setIsLocating(true);
    setPermissionError(null);
    setLoadingMessage('Acquiring your location from device GPS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (currentReqId !== activeRequestIdRef.current) return;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Coordinates kept strictly in React component memory
        setUserCoords({ lat, lon });
        setCenterCoords({ lat, lon });

        if (mapInstanceRef.current) {
          const zoomLevel = searchRadius <= 2500 ? 15 : searchRadius >= 10000 ? 13 : 14;
          mapInstanceRef.current.setView([lat, lon], zoomLevel, { animate: true });
        }
        setIsLocating(false);

        try {
          const areaName = await reverseGeocode(lat, lon);
          if (currentReqId !== activeRequestIdRef.current) return;
          const label = `Current Location: ${areaName}`;
          setCurrentLocationName(label);
          await loadHavensForCoordinates(lat, lon, label, activeCategory, currentReqId, searchRadius);
        } catch {
          if (currentReqId !== activeRequestIdRef.current) return;
          const label = `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          setCurrentLocationName(label);
          await loadHavensForCoordinates(lat, lon, label, activeCategory, currentReqId, searchRadius);
        }
      },
      (err) => {
        if (currentReqId !== activeRequestIdRef.current) return;
        setIsLocating(false);
        setIsLoading(false);
        setLoadingMessage('');

        if (err.code === 1) {
          setPermissionError(
            'Location permission was denied. You can still search for any Indian city or railway station in the search field above.'
          );
        } else if (err.code === 2) {
          setPermissionError('Position unavailable. Please check your device location services or search manually.');
        } else if (err.code === 3) {
          setPermissionError('Location request timed out. Please retry or enter your location manually.');
        } else {
          setPermissionError('Unable to access device location. Please search manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ---------------------------------------------------------------------------
  // Client-Side Quick Filtering (Applied Instantly to Retrieved Facilities)
  // ---------------------------------------------------------------------------
  const displayedFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // 24/7 filter requires verified open hours
      if (filter24x7 && !facility.is24_7) {
        return false;
      }
      // Women desk filter requires verified police women desk tag
      if (filterWomenDesk && !facility.isWomenDesk) {
        return false;
      }
      return true;
    });
  }, [facilities, filter24x7, filterWomenDesk]);

  // ---------------------------------------------------------------------------
  // Sync Leaflet Markers with Current Facilities & Center Waypoint
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerMapRef.current.clear();

    // 1. Search Center Waypoint Pin (Visual marker of searched locality)
    if (centerCoords) {
      const centerPin = L.divIcon({
        className: 'search-center-pin',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: var(--color-forest); border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.35); color: #FFFFFF;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const centerMarker = L.marker([centerCoords.lat, centerCoords.lon], { icon: centerPin })
        .bindPopup(`
          <div style="font-size: 0.82rem; font-weight: 700; color: #183D32;">
            Search Center
          </div>
          <div style="font-size: 0.72rem; color: #575D57; margin-top: 0.2rem;">
            ${currentLocationName}
          </div>
        `);
      layerGroup.addLayer(centerMarker);
    }

    // 2. User Location Marker if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-loc-div-icon',
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div class="user-location-marker-pulse"></div>
            <div class="user-location-marker-dot"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lon], { icon: userIcon })
        .bindPopup(`
          <div style="font-size: 0.82rem; font-weight: 600; color: #0284C7;">
            Your Current Location
          </div>
          <div style="font-size: 0.72rem; color: #575D57; margin-top: 0.2rem;">
            Held in memory &bull; Not persisted
          </div>
        `);
      layerGroup.addLayer(userMarker);
      userMarkerRef.current = userMarker;
    }

    // 3. Facility Markers (Filtered by active quick filters)
    displayedFacilities.forEach((facility) => {
      const isSelected = facility.id === selectedFacilityId;

      let iconSnippet = '';
      if (facility.category === 'medical') {
        iconSnippet = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M10 9h4"/><path d="M12 7v4"/></svg>';
      } else if (facility.category === 'police') {
        iconSnippet = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
      } else if (facility.category === 'railway') {
        iconSnippet = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/></svg>';
      } else if (facility.category === 'bus') {
        iconSnippet = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 10h16"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>';
      } else {
        iconSnippet = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/></svg>';
      }

      const customIcon = L.divIcon({
        className: 'haven-marker-container',
        html: `
          <div class="haven-marker-pin ${facility.category} ${isSelected ? 'is-active' : ''}">
            ${iconSnippet}
          </div>
        `,
        iconSize: [34, 40],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36]
      });

      // Context-appropriate emergency helpline fallback if local phone is unlisted
      const emergencyHelpline =
        facility.category === 'police'
          ? { number: '112', label: '112 (Police / Emergency)' }
          : facility.category === 'medical'
          ? { number: '108', label: '108 (Ambulance Helpline)' }
          : facility.category === 'railway'
          ? { number: '139', label: '139 (Railway Security)' }
          : { number: '112', label: '112 (Emergency)' };

      const popupHtml = `
        <div class="custom-leaflet-popup-inner">
          <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${
            facility.category === 'medical'
              ? '#C9785B'
              : facility.category === 'police'
              ? '#183D32'
              : '#575D57'
          }; margin-bottom: 0.25rem;">
            ${facility.subcategory} ${facility.isWomenDesk ? '&bull; Mahila Desk' : ''}
          </div>
          <strong style="font-size: 0.92rem; color: #183D32; display: block; line-height: 1.25; margin-bottom: 0.35rem;">
            ${facility.name}
          </strong>

          <!-- Facility Quality Indicators -->
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
            <span style="font-size: 0.64rem; padding: 0.12rem 0.4rem; border-radius: 4px; ${
              facility.phone
                ? 'background-color: rgba(82, 110, 89, 0.15); color: #183D32; font-weight: 600;'
                : 'background-color: #F7F5EF; color: #575D57; border: 1px solid #EFECE1;'
            }">
              ${facility.phone ? 'Phone Listed in OSM' : 'Phone Unlisted in OSM'}
            </span>
            <span style="font-size: 0.64rem; padding: 0.12rem 0.4rem; border-radius: 4px; ${
              facility.is24_7
                ? 'background-color: #DEF7EC; color: #03543F; font-weight: 700;'
                : facility.hasOpeningHours
                ? 'background-color: #F7F5EF; color: #183D32; border: 1px solid #EFECE1;'
                : 'background-color: #F7F5EF; color: #575D57; border: 1px solid #EFECE1;'
            }">
              ${facility.is24_7 ? '24/7 Confirmed' : facility.hasOpeningHours ? `Hours: ${facility.openingHours}` : 'Hours Unconfirmed'}
            </span>
          </div>

          ${
            facility.address
              ? `<p style="font-size: 0.76rem; color: #575D57; margin-bottom: 0.45rem;">${facility.address}</p>`
              : ''
          }
          <div style="margin-bottom: 0.45rem; font-size: 0.75rem;">
            ${
              facility.phone
                ? `<a href="tel:${facility.phone}" style="color: #183D32; font-weight: 600; text-decoration: underline;">Call: ${facility.phone}</a>`
                : `<span style="color: #575D57; font-size: 0.7rem;">Phone unlisted in OSM &bull; </span><a href="tel:${emergencyHelpline.number}" style="color: #C9785B; font-weight: 700; text-decoration: underline;">Call ${emergencyHelpline.label}</a>`
            }
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.4rem; border-top: 1px solid #EFECE1;">
            <span style="font-size: 0.72rem; font-weight: 600; color: #183D32;">
              ${facility.distanceKm != null ? `${facility.distanceKm} km away` : ''}
            </span>
            <a href="${facility.directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; font-weight: 700; color: #C9785B; text-decoration: underline;">
              Get Directions &rarr;
            </a>
          </div>
          <div style="font-size: 0.62rem; color: #8C938C; margin-top: 0.35rem; font-style: italic;">
            * Physical record from OSM; presence does not guarantee live staffing.
          </div>
        </div>
      `;

      const marker = L.marker([facility.lat, facility.lon], { icon: customIcon })
        .bindPopup(popupHtml, { className: 'custom-leaflet-popup', closeButton: true })
        .on('click', () => {
          setSelectedFacilityId(facility.id);
          if (facilityCardsRef.current[facility.id]) {
            facilityCardsRef.current[facility.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });

      layerGroup.addLayer(marker);
      markerMapRef.current.set(facility.id, marker);
    });
  }, [displayedFacilities, selectedFacilityId, userCoords, centerCoords, currentLocationName]);

  // ---------------------------------------------------------------------------
  // Select Facility from Card List
  // ---------------------------------------------------------------------------
  const handleSelectFacility = (facility) => {
    setSelectedFacilityId(facility.id);
    const map = mapInstanceRef.current;
    const marker = markerMapRef.current.get(facility.id);

    if (map) {
      map.flyTo([facility.lat, facility.lon], 16, { animate: true, duration: 0.8 });
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Helper to render Category Icon component
  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'medical':
        return <HospitalIcon size={16} />;
      case 'police':
        return <ShieldIcon size={16} />;
      case 'railway':
        return <TrainIcon size={16} />;
      case 'bus':
        return <BusIcon size={16} />;
      case 'hotel':
        return <BedIcon size={16} />;
      default:
        return <MapPinIcon size={16} />;
    }
  };

  return (
    <div>
      {/* Editorial Header Introduction */}
      <div className="section-intro">
        <div className="kicker">Stage 2 &bull; Verified Safe Zones</div>
        <h1>Safe Havens & Assistance Map</h1>
        <p>
          Locate verified emergency hospitals, police stations, Mahila helpdesks, and major transit hubs
          across India using live OpenStreetMap data.
        </p>
      </div>

      {/* Offline Status & Recovery Banner */}
      {!isOnline && (
        <div className="safe-havens-offline-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ color: '#B45309', flexShrink: 0, marginTop: '2px' }}>
              <AlertIcon size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <strong style={{ fontSize: 'var(--text-sm)', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Offline Mode Active
                </strong>
                <Badge variant="outline">No Internet Connection</Badge>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', margin: 0, lineHeight: 1.55 }}>
                You&apos;re currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault.
              </p>
            </div>
          </div>

          {/* Offline Actions & Safety Vault Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid rgba(180, 83, 9, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="#/vault"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <LockIcon size={14} />
                <span>Open Offline Safety Vault</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.onLine) {
                    setIsOnline(true);
                    setJustReconnected(true);
                    loadHavensForCoordinates(centerCoords.lat, centerCoords.lon, currentLocationName, activeCategory, null, searchRadius);
                  } else {
                    setErrorMessage("You're currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault.");
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCwIcon size={14} />
                <span>Check Connection &amp; Retry</span>
              </button>
            </div>

            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', fontStyle: 'italic' }}>
              Emergency calls are placed through your mobile carrier. Services are never dialed automatically.
            </span>
          </div>

          {/* Direct Emergency Helplines (Carrier-based phone dialer) */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(180, 83, 9, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
              Direct Indian Helplines:
            </span>
            <a href="tel:112" className="emergency-helpline-link" title="National Emergency Helpline">
              <PhoneIcon size={11} />
              <span>Police / Emergency: 112</span>
            </a>
            <a href="tel:1091" className="emergency-helpline-link" title="24/7 Women Helpline">
              <PhoneIcon size={11} />
              <span>Women Helpline: 1091</span>
            </a>
            <a href="tel:108" className="emergency-helpline-link" title="National Ambulance Service">
              <PhoneIcon size={11} />
              <span>Ambulance: 108</span>
            </a>
            <a href="tel:139" className="emergency-helpline-link" title="Railway Security Helpline">
              <PhoneIcon size={11} />
              <span>Railways: 139</span>
            </a>
          </div>
        </div>
      )}

      {/* Connection Restored Notice */}
      {isOnline && justReconnected && (
        <div className="safe-havens-reconnected-banner" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: 'var(--color-forest)' }}>
              <CheckIcon size={18} />
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-forest)' }}>
              Internet connection restored. Live OpenStreetMap facility queries are available.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setJustReconnected(false);
                loadHavensForCoordinates(
                  centerCoords.lat,
                  centerCoords.lon,
                  currentLocationName,
                  activeCategory,
                  null,
                  searchRadius
                );
              }}
              className="btn btn-primary btn-sm"
            >
              <RefreshCwIcon size={13} />
              <span>Retry Search Now</span>
            </button>

            <button
              type="button"
              onClick={() => setJustReconnected(false)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.5rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Emergency Hotline Advisory Card */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--color-alert-bg)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ color: 'var(--color-terracotta)', marginTop: '0.15rem', flexShrink: 0 }}>
          <AlertIcon size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-terracotta-dark)' }}>
              IMMEDIATE DANGER? DIAL 112 DIRECTLY
            </strong>
            <span
              style={{
                fontSize: 'var(--text-2xs)',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'var(--color-terracotta)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase'
              }}
            >
              All-India Emergency
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              margin: '0.35rem 0 0 0',
              color: 'var(--color-charcoal)',
              lineHeight: 1.5
            }}
          >
            Searching for a facility is <strong>not</strong> a substitute for official emergency response. If you are
            facing harassment or imminent danger, call <strong>112</strong> (National Emergency),{' '}
            <strong>1091</strong> (Women Helpline), or <strong>139</strong> (Railway Security) immediately.
            OpenStreetMap listings indicate physical presence; they do not guarantee staffing, bed availability, or open
            gates.
          </p>
        </div>
      </div>

      {/* Search & Location Bar */}
      <Card variant="default" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'stretch'
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-charcoal-subtle)',
                  display: 'flex'
                }}
              >
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Indian city, railway station, or locality (e.g. Udupi, Majestic Bengaluru, Jaipur)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              <SearchIcon size={16} />
              <span>Search Location</span>
            </button>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating || isLoading}
              className="btn btn-secondary"
              style={{ flexShrink: 0 }}
              title="Locate via browser GPS"
            >
              <CrosshairIcon size={16} />
              <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
            </button>
          </div>
        </form>

        {/* Location Privacy Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.65rem',
            fontSize: 'var(--text-2xs)',
            color: 'var(--color-charcoal-muted)'
          }}
        >
          <InfoIcon size={14} />
          <span>
            <strong>Location Privacy:</strong> GPS coordinates are held strictly in temporary browser memory to calculate
            distances and query OpenStreetMap. Coordinates are never tracked, shared, or saved to disk.
          </span>
        </div>

        {/* Popular / Quick Test Location Chips */}
        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-charcoal-muted)' }}>
            Quick Indian Hubs:
          </span>
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc.label}
              type="button"
              onClick={() => {
                setSearchInput(loc.label);
                loadHavensForCoordinates(loc.lat, loc.lon, loc.label, activeCategory, null, searchRadius);
              }}
              style={{
                fontSize: 'var(--text-2xs)',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-forest)',
                cursor: 'pointer',
                transition: 'all var(--transition-smooth)'
              }}
            >
              {loc.label}
            </button>
          ))}
        </div>

        {/* Active Trip Destination Shortcut (from Exit Plans) */}
        {activePlan && activePlan.destination && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(82, 110, 89, 0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(82, 110, 89, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ color: 'var(--color-forest)', display: 'flex' }}>
                <CompassIcon size={16} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-forest)', fontWeight: 600 }}>
                Active Trip Itinerary Destination: <strong>{activePlan.destination}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSearchDestination(activePlan.destination)}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: 'var(--text-2xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Search Havens in {activePlan.destination}</span>
              <ArrowRightIcon size={12} />
            </button>
          </div>
        )}
      </Card>

      {/* Geolocation Permission Error Banner */}
      {permissionError && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid rgba(180, 83, 9, 0.3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-charcoal)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <AlertIcon size={18} />
          <span>{permissionError}</span>
        </div>
      )}

      {/* 1. Situation-Based Emergency Shortcuts Bar */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.45rem',
            flexWrap: 'wrap',
            gap: '0.4rem'
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-forest)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Emergency Situation Shortcuts:
          </span>
          {activeSituation && (
            <button
              type="button"
              onClick={() => handleToggleSituation(activeSituation)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-charcoal-muted)',
                fontSize: 'var(--text-2xs)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Reset to Standard Browsing
            </button>
          )}
        </div>

        <div className="situation-shortcuts-bar">
          {SITUATION_PRESETS.map((sit) => {
            const isSelected = activeSituation === sit.id;
            const Icon = sit.icon;
            return (
              <button
                key={sit.id}
                type="button"
                onClick={() => handleToggleSituation(sit.id)}
                className={`situation-action-btn ${isSelected ? sit.activeClass : ''}`}
                aria-pressed={isSelected}
              >
                <Icon size={14} />
                <span>{sit.label}</span>
                {isSelected && <CheckIcon size={12} />}
              </button>
            );
          })}
        </div>

        {/* Active Situation Guidance Banner */}
        {activeSituation && (() => {
          const preset = SITUATION_PRESETS.find((s) => s.id === activeSituation);
          if (!preset) return null;

          return (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor:
                  activeSituation === 'unsafe'
                    ? 'var(--color-alert-bg)'
                    : activeSituation === 'medical'
                    ? '#FEF3C7'
                    : activeSituation === 'night'
                    ? '#F1F5F9'
                    : '#EEF2FF',
                border: `1px solid ${
                  activeSituation === 'unsafe'
                    ? 'var(--border-accent)'
                    : activeSituation === 'medical'
                    ? '#FCD34D'
                    : activeSituation === 'night'
                    ? '#CBD5E1'
                    : '#C7D2FE'
                }`,
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.45rem'
                }}
              >
                <strong
                  style={{
                    fontSize: 'var(--text-xs)',
                    color:
                      activeSituation === 'unsafe'
                        ? 'var(--color-terracotta-dark)'
                        : activeSituation === 'medical'
                        ? '#92400E'
                        : activeSituation === 'night'
                        ? '#0F172A'
                        : '#3730A3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Active Emergency Protocol: {preset.label}
                </strong>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {preset.helplines.map((hl) => (
                    <a
                      key={hl.number}
                      href={`tel:${hl.number}`}
                      className="emergency-helpline-link"
                      style={{ fontSize: 'var(--text-2xs)' }}
                    >
                      <PhoneIcon size={11} />
                      <span>Call {hl.name}: {hl.number}</span>
                    </a>
                  ))}
                </div>
              </div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  margin: 0,
                  color: 'var(--color-charcoal)',
                  lineHeight: 1.45
                }}
              >
                {preset.advisory}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: 'var(--space-4)'
        }}
      >
        {HAVEN_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`category-filter-btn ${isActive ? 'active' : ''}`}
            >
              {renderCategoryIcon(cat.id)}
              <span>{cat.label}</span>
              {isActive && (
                <span className="category-count-badge">
                  {displayedFacilities.length}
                  {displayedFacilities.length !== facilities.length ? ` / ${facilities.length}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Radius & Quick Filter Subcontrols Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--color-ivory-light)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-4)'
        }}
      >
        {/* Left: Radius Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-charcoal-muted)' }}>
            Search Radius:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {AVAILABLE_SEARCH_RADII.map((rad) => {
              const isSelected = searchRadius === rad.value;
              return (
                <button
                  key={rad.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRadiusChange(rad.value)}
                  className={`radius-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  {rad.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Filters (In-Memory client filtering) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-charcoal-muted)' }}>
            Quick Filters:
          </span>
          <button
            type="button"
            onClick={() => setFilter24x7((prev) => !prev)}
            className={`quick-toggle-btn ${filter24x7 ? 'active-247' : ''}`}
            title="Show only facilities verified with 24/7 opening hours in OpenStreetMap"
          >
            <span>Open 24/7</span>
            {filter24x7 && <CheckIcon size={12} />}
          </button>

          <button
            type="button"
            onClick={() => setFilterWomenDesk((prev) => !prev)}
            className={`quick-toggle-btn ${filterWomenDesk ? 'active-women' : ''}`}
            title="Show only police stations verified with Mahila / Women Helpdesks"
          >
            <span>Women Desk Only</span>
            {filterWomenDesk && <CheckIcon size={12} />}
          </button>

          {(filter24x7 || filterWomenDesk) && (
            <button
              type="button"
              onClick={() => {
                setFilter24x7(false);
                setFilterWomenDesk(false);
              }}
              className="quick-toggle-clear-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Search Context Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: 'var(--space-4)',
          padding: '0.5rem 0',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPinIcon size={16} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-charcoal)' }}>
            Showing Safe Havens within {searchRadius / 1000} km of: <strong>{currentLocationName}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)' }}>
            {displayedFacilities.length !== facilities.length
              ? `Showing ${displayedFacilities.length} of ${facilities.length} facilities`
              : `${facilities.length} facilities found`}
          </span>
          <button
            onClick={() =>
              loadHavensForCoordinates(
                centerCoords.lat,
                centerCoords.lon,
                currentLocationName,
                activeCategory,
                null,
                searchRadius
              )
            }
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: 'var(--text-2xs)',
              color: 'var(--color-forest)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCwIcon size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Split Layout: Leaflet Interactive Map + Verifiable Facility Cards */}
      <div className="havens-split-layout">
        {/* Left Column: Interactive Leaflet Map */}
        <div className="map-sticky-container">
          <div className="map-card-wrapper">
            {/* Loading Overlay */}
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(247, 245, 239, 0.85)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid var(--color-forest)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '0.75rem'
                  }}
                />
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)' }}>
                  Loading Real-World Map Data
                </strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', marginTop: '0.25rem' }}>
                  {loadingMessage || 'Querying OpenStreetMap community nodes...'}
                </p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Leaflet DOM Anchor with Floating Map Offline Badge */}
            <div style={{ position: 'relative' }}>
              {(!isOnline || tileErrorOccurred) && (
                <div className="map-offline-badge" role="status">
                  <InfoIcon size={13} />
                  <span>Map tiles unavailable offline. Pins &amp; coordinates remain accessible.</span>
                </div>
              )}
              <div ref={mapContainerRef} className="leaflet-map-root" />
            </div>

            {/* Map Card Footer / Attribution */}
            <div
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-charcoal-muted)'
              }}
            >
              <span>
                Data: OpenStreetMap contributors (ODbL) &bull; Overpass API
              </span>
              <span>Click any marker to view verified details</span>
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Facility Cards List */}
        <div ref={cardListRef}>
          {/* Error / Offline State */}
          {errorMessage && (
            <Card
              variant="default"
              style={{
                borderColor: !isOnline || errorMessage.includes('offline') ? '#B45309' : 'var(--color-terracotta)',
                backgroundColor: !isOnline || errorMessage.includes('offline') ? '#FEF3C7' : 'var(--color-alert-bg)',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ color: !isOnline || errorMessage.includes('offline') ? '#B45309' : 'var(--color-terracotta)' }}>
                  <AlertIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', color: !isOnline || errorMessage.includes('offline') ? '#92400E' : 'var(--color-terracotta-dark)', marginBottom: '0.35rem' }}>
                    {!isOnline || errorMessage.includes('offline')
                      ? 'Offline: Live Facility Query Paused'
                      : 'Live Facility Query Failed (Overpass API Server)'}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                    {errorMessage}
                  </p>
                  <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-charcoal-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {!isOnline || errorMessage.includes('offline')
                      ? 'Your device is disconnected from the internet. Emergency hotlines and your saved offline Safety Vault records remain fully accessible below.'
                      : `Important: An API connectivity failure does not mean no facilities exist in ${currentLocationName}. Public OpenStreetMap community servers may be temporarily busy. Your map above has recentred to your searched coordinates. You can retry the query or call the verified emergency numbers below immediately.`}
                  </p>

                  {/* Immediate Emergency Helplines Available During Outage */}
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-accent)',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--color-terracotta-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                      Immediate Direct Helplines (Active 24/7 Across India):
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <a href="tel:112" className="emergency-helpline-link" title="National Emergency & Police">
                        <PhoneIcon size={12} />
                        <span>Police & Emergency: Call 112</span>
                      </a>
                      <a href="tel:1091" className="emergency-helpline-link" title="Women Helpline">
                        <PhoneIcon size={12} />
                        <span>Women Helpline: Call 1091</span>
                      </a>
                      <a href="tel:108" className="emergency-helpline-link" title="Ambulance & Medical Emergency">
                        <PhoneIcon size={12} />
                        <span>Ambulance: Call 108</span>
                      </a>
                      <a href="tel:139" className="emergency-helpline-link" title="Railway Security Helpline">
                        <PhoneIcon size={12} />
                        <span>Railway Security: Call 139</span>
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!isOnline || errorMessage.includes('offline') ? (
                      <>
                        <a
                          href="#/vault"
                          className="btn btn-primary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          <LockIcon size={14} />
                          <span>Open Offline Safety Vault</span>
                        </a>

                        <button
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.onLine) {
                              setIsOnline(true);
                              setJustReconnected(true);
                              loadHavensForCoordinates(
                                centerCoords.lat,
                                centerCoords.lon,
                                currentLocationName,
                                activeCategory,
                                null,
                                searchRadius
                              );
                            } else {
                              setErrorMessage(
                                "You're currently offline. Live Safe Havens searches require an internet connection. Your saved emergency information remains available in Safety Vault."
                              );
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <RefreshCwIcon size={14} />
                          <span>Check Connection &amp; Retry</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            loadHavensForCoordinates(
                              centerCoords.lat,
                              centerCoords.lon,
                              currentLocationName,
                              activeCategory,
                              null,
                              searchRadius
                            )
                          }
                          className="btn btn-primary btn-sm"
                        >
                          <RefreshCwIcon size={14} />
                          <span>Retry Live Query</span>
                        </button>
                        {activeCategory !== 'all' && (
                          <button
                            onClick={() => {
                              if (activeSituation) setActiveSituation(null);
                              handleCategoryChange('all');
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <span>Reset to All Categories</span>
                          </button>
                        )}
                        {searchRadius < 10000 && (
                          <button
                            onClick={() => handleRadiusChange(10000)}
                            className="btn btn-secondary btn-sm"
                          >
                            <span>Expand Radius to 10 km</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSearchInput('Kempegowda Bus Station, Majestic, Bengaluru');
                            loadHavensForCoordinates(12.9767, 77.5713, 'Bengaluru (Majestic)', 'all', null, searchRadius);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <span>Try Bengaluru Central</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Empty State: 0 Facilities in OSM for this category/radius (Shown strictly when Online with 0 results) */}
          {!isLoading && !errorMessage && isOnline && facilities.length === 0 && (
            <Card
              variant="default"
              style={{
                textAlign: 'center',
                padding: 'var(--space-8) var(--space-4)',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ color: 'var(--color-charcoal-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <MapPinIcon size={32} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                No facilities found in this category
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', maxWidth: '460px', margin: '0 auto 1rem auto', lineHeight: 1.5 }}>
                There are no facilities tagged as &ldquo;{activeCategory}&rdquo; within {searchRadius / 1000} km of {currentLocationName} in the OpenStreetMap database.
                Physical services in smaller towns may not be mapped on OSM. Please use the direct emergency hotlines below if urgent.
              </p>

              {/* Immediate Direct Helplines accessible during empty state */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <a href="tel:112" className="emergency-helpline-link" title="National Emergency & Police">
                  <PhoneIcon size={11} />
                  <span>Police / Emergency: Call 112</span>
                </a>
                <a href="tel:108" className="emergency-helpline-link" title="Ambulance & Medical Emergency">
                  <PhoneIcon size={11} />
                  <span>Ambulance: Call 108</span>
                </a>
                <a href="tel:1091" className="emergency-helpline-link" title="Women Helpline">
                  <PhoneIcon size={11} />
                  <span>Women Helpline: Call 1091</span>
                </a>
                <a href="tel:139" className="emergency-helpline-link" title="Railway Security">
                  <PhoneIcon size={11} />
                  <span>Railway Security: Call 139</span>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => {
                      if (activeSituation) setActiveSituation(null);
                      handleCategoryChange('all');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Search All Categories Nearby</span>
                  </button>
                )}
                {searchRadius < 10000 && (
                  <button
                    onClick={() => handleRadiusChange(10000)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Expand Radius to 10 km</span>
                  </button>
                )}
                {(filter24x7 || filterWomenDesk) && (
                  <button
                    onClick={() => {
                      setFilter24x7(false);
                      setFilterWomenDesk(false);
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <span>Clear Quick Filters</span>
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Empty State: Facilities exist, but filtered out by active Quick Filters */}
          {!isLoading && !errorMessage && isOnline && facilities.length > 0 && displayedFacilities.length === 0 && (
            <Card
              variant="default"
              style={{
                textAlign: 'center',
                padding: 'var(--space-8) var(--space-4)',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ color: 'var(--color-charcoal-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <MapPinIcon size={32} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest)', marginBottom: '0.35rem' }}>
                No facilities match your active quick filters
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal-muted)', maxWidth: '460px', margin: '0 auto 1rem auto', lineHeight: 1.5 }}>
                We found <strong>{facilities.length}</strong> facilities within {searchRadius / 1000} km of {currentLocationName}, but none currently have verified {filter24x7 && filterWomenDesk ? '24/7 hours and Women Helpdesk' : filter24x7 ? '24/7 hours' : 'Women Helpdesk'} tags in OpenStreetMap.
              </p>

              {/* Direct Helplines accessible in filtered empty state */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <a href="tel:112" className="emergency-helpline-link">
                  <PhoneIcon size={11} />
                  <span>Police / Emergency: 112</span>
                </a>
                <a href="tel:108" className="emergency-helpline-link">
                  <PhoneIcon size={11} />
                  <span>Ambulance: 108</span>
                </a>
                <a href="tel:1091" className="emergency-helpline-link">
                  <PhoneIcon size={11} />
                  <span>Women Helpline: 1091</span>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setFilter24x7(false);
                    setFilterWomenDesk(false);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <span>Clear Quick Filters (Show all {facilities.length})</span>
                </button>
                {searchRadius < 10000 && (
                  <button
                    onClick={() => handleRadiusChange(10000)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Expand Radius to 10 km</span>
                  </button>
                )}
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => {
                      if (activeSituation) setActiveSituation(null);
                      handleCategoryChange('all');
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <span>Reset to All Categories</span>
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Offline Preserved Facilities Notice */}
          {!isOnline && displayedFacilities.length > 0 && (
            <div
              style={{
                padding: '0.55rem 0.85rem',
                backgroundColor: 'var(--color-ivory-light)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-charcoal)',
                marginBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              role="status"
            >
              <InfoIcon size={14} />
              <span>
                Displaying <strong>{displayedFacilities.length}</strong> previously loaded safe havens for {currentLocationName} (Offline Mode). Direct phone numbers can be reached via cellular voice calls.
              </span>
            </div>
          )}

          {/* Facility Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {displayedFacilities.map((facility) => {
              const isSelected = facility.id === selectedFacilityId;

              return (
                <div
                  key={facility.id}
                  ref={(el) => (facilityCardsRef.current[facility.id] = el)}
                  onClick={() => handleSelectFacility(facility)}
                  className={`facility-card-item ${isSelected ? 'is-selected' : ''}`}
                >
                  {/* Top Metadata Row: Category Badge + Distance */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.45rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <Badge
                        variant={
                          facility.category === 'medical'
                            ? 'terracotta'
                            : facility.category === 'police'
                            ? 'forest'
                            : 'sage'
                        }
                      >
                        {renderCategoryIcon(facility.category)}
                        <span style={{ marginLeft: '0.25rem' }}>{facility.subcategory}</span>
                      </Badge>

                      {/* Truthful Quality Badges: Hours & Phone */}
                      {facility.is24_7 ? (
                        <span className="quality-badge quality-badge-hours-247" title="OpenStreetMap record confirmed 24/7 hours">
                          24/7 Confirmed
                        </span>
                      ) : facility.hasOpeningHours ? (
                        <span className="quality-badge quality-badge-hours-listed" title={`Opening hours tagged in OSM: ${facility.openingHours}`}>
                          Hours Listed
                        </span>
                      ) : (
                        <span className="quality-badge quality-badge-hours-unconfirmed" title="Opening hours are not tagged in OpenStreetMap. Does not necessarily mean the facility is closed.">
                          Hours Unconfirmed
                        </span>
                      )}

                      {facility.hasPhone ? (
                        <span className="quality-badge quality-badge-phone-listed" title="Direct telephone number is tagged in OpenStreetMap">
                          Phone Listed
                        </span>
                      ) : (
                        <span className="quality-badge quality-badge-phone-unlisted" title="No direct telephone number in OpenStreetMap. Use national emergency helpline if urgently needed.">
                          Phone Unlisted
                        </span>
                      )}

                      {facility.isWomenDesk && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--color-terracotta-surface)',
                            color: 'var(--color-terracotta-dark)',
                            border: '1px solid var(--border-accent)'
                          }}
                        >
                          Women Helpdesk
                        </span>
                      )}
                    </div>

                    {facility.distanceKm != null && (
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          color: 'var(--color-forest)'
                        }}
                      >
                        {facility.distanceKm} km away
                      </span>
                    )}
                  </div>

                  {/* Facility Name & OSM Link */}
                  <div style={{ marginBottom: '0.35rem' }}>
                    <h3
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 600,
                        color: 'var(--color-forest)',
                        lineHeight: 1.3
                      }}
                    >
                      {facility.name}
                    </h3>
                  </div>

                  {/* Address */}
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: facility.address ? 'var(--color-charcoal)' : 'var(--color-charcoal-subtle)',
                      marginBottom: '0.45rem',
                      fontStyle: facility.address ? 'normal' : 'italic'
                    }}
                  >
                    {facility.address || 'Street address not tagged in OpenStreetMap'}
                  </p>

                  {/* Verified Phone Contact or Emergency Helpline Fallback */}
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-charcoal-muted)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.45rem'
                    }}
                  >
                    <PhoneIcon size={14} />
                    {facility.phone ? (
                      <a
                        href={`tel:${facility.phone}`}
                        style={{
                          color: 'var(--color-forest)',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {facility.phone}
                      </a>
                    ) : (
                      <>
                        <span style={{ color: 'var(--color-charcoal-subtle)', fontStyle: 'italic' }}>
                          Phone unlisted &bull;
                        </span>
                        {facility.category === 'police' ? (
                          <a
                            href="tel:112"
                            className="emergency-helpline-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Direct emergency helpline for police"
                          >
                            <PhoneIcon size={11} />
                            <span>Police Helpline: Call 112</span>
                          </a>
                        ) : facility.category === 'medical' ? (
                          <a
                            href="tel:108"
                            className="emergency-helpline-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Direct emergency helpline for ambulance"
                          >
                            <PhoneIcon size={11} />
                            <span>Ambulance: Call 108</span>
                          </a>
                        ) : facility.category === 'railway' ? (
                          <a
                            href="tel:139"
                            className="emergency-helpline-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Indian Railways Security Helpline"
                          >
                            <PhoneIcon size={11} />
                            <span>Railway Helpline: Call 139</span>
                          </a>
                        ) : (
                          <a
                            href="tel:112"
                            className="emergency-helpline-link"
                            onClick={(e) => e.stopPropagation()}
                            title="All-India Emergency Number"
                          >
                            <PhoneIcon size={11} />
                            <span>Emergency: Call 112</span>
                          </a>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFacility(facility);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.65rem' }}
                    >
                      <MapPinIcon size={14} />
                      <span>Focus on Map</span>
                    </button>

                    <a
                      href={facility.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.35rem 0.65rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLinkIcon size={14} />
                      <span>Get Directions</span>
                    </a>

                    <a
                      href={facility.osmLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--text-2xs)',
                        color: 'var(--color-charcoal-subtle)',
                        textDecoration: 'underline'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      OSM Node #{facility.osmId}
                    </a>
                  </div>

                  {/* Truthful Data Quality Footnote */}
                  <div
                    style={{
                      marginTop: '0.45rem',
                      fontSize: '0.66rem',
                      lineHeight: 1.35,
                      color: 'var(--color-charcoal-subtle)'
                    }}
                  >
                    * Physical record from OpenStreetMap. Unlisted contact or unconfirmed hours indicate missing records in OSM, not necessarily absence of service at the physical facility.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
