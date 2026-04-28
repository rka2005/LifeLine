import { useEffect, useRef, useState, useCallback } from 'react'
import { Map, Layers, Navigation, Compass, ZoomIn, ZoomOut } from 'lucide-react'
import { loadGoogleMaps } from '../lib/googleMaps.js'

const MAP_STYLES = {
  light: [],
  dark: [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
  ]
}

function getAmbulance3DIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
      </filter>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f0f0f0"/>
      </linearGradient>
      <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#87CEEB"/>
        <stop offset="100%" stop-color="#5F9EA0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow)">
      <!-- Shadow ellipse -->
      <ellipse cx="28" cy="48" rx="20" ry="5" fill="#000000" opacity="0.15"/>
      <!-- Vehicle body - 3D perspective -->
      <path d="M14 22 L14 38 Q14 42 18 42 L38 42 Q42 42 42 38 L42 22 Q42 18 38 18 L18 18 Q14 18 14 22Z" fill="url(#bodyGrad)" stroke="#e5e5e5" stroke-width="1"/>
      <!-- Roof -->
      <path d="M16 18 L18 12 L38 12 L40 18Z" fill="#f8f8f8" stroke="#ddd" stroke-width="1"/>
      <!-- Windshield -->
      <path d="M40 20 L42 22 L42 28 L38 28 L38 20Z" fill="url(#windowGrad)" stroke="#4a90a4" stroke-width="0.5"/>
      <!-- Side window -->
      <rect x="20" y="20" width="12" height="8" rx="1" fill="url(#windowGrad)" stroke="#4a90a4" stroke-width="0.5"/>
      <!-- Red cross on side -->
      <g transform="translate(28, 34)">
        <rect x="-6" y="-2" width="12" height="4" rx="1" fill="#ef4444"/>
        <rect x="-2" y="-6" width="4" height="12" rx="1" fill="#ef4444"/>
      </g>
      <!-- Emergency light bar -->
      <rect x="18" y="8" width="20" height="4" rx="2" fill="#3b82f6" opacity="0.9"/>
      <rect x="20" y="8" width="6" height="4" rx="1" fill="#60a5fa" opacity="0.7"/>
      <rect x="30" y="8" width="6" height="4" rx="1" fill="#ef4444" opacity="0.7"/>
      <!-- Wheels -->
      <circle cx="18" cy="44" r="4" fill="#333"/>
      <circle cx="38" cy="44" r="4" fill="#333"/>
      <circle cx="18" cy="44" r="2" fill="#666"/>
      <circle cx="38" cy="44" r="2" fill="#666"/>
      <!-- Headlight -->
      <ellipse cx="41" cy="32" rx="2" ry="3" fill="#fbbf24" opacity="0.8"/>
    </g>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(56, 56),
    anchor: new window.google.maps.Point(28, 48)
  }
}

function getHospitalMarkerIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="hospShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="#fee2e2" stroke="#ef4444" stroke-width="2" filter="url(#hospShadow)"/>
    <rect x="18" y="12" width="12" height="24" rx="2" fill="#ef4444"/>
    <rect x="22" y="16" width="4" height="6" rx="1" fill="white"/>
    <rect x="20" y="18" width="8" height="2" rx="1" fill="white"/>
    <rect x="16" y="28" width="16" height="6" rx="1" fill="white" opacity="0.9"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(48, 48),
    anchor: new window.google.maps.Point(24, 24)
  }
}

function getPoliceMarkerIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="polShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2" filter="url(#polShadow)"/>
    <path d="M24 8 L32 16 L32 28 L16 28 L16 16 Z" fill="#3b82f6"/>
    <rect x="20" y="20" width="8" height="6" rx="1" fill="white" opacity="0.9"/>
    <rect x="22" y="12" width="4" height="2" rx="1" fill="#fbbf24"/>
    <circle cx="14" cy="32" r="3" fill="#1f2937"/>
    <circle cx="34" cy="32" r="3" fill="#1f2937"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(48, 48),
    anchor: new window.google.maps.Point(24, 24)
  }
}

function getDoctorMarkerIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="docShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" filter="url(#docShadow)"/>
    <circle cx="24" cy="16" r="6" fill="#f59e0b"/>
    <rect x="18" y="22" width="12" height="14" rx="3" fill="white" stroke="#f59e0b" stroke-width="2"/>
    <rect x="22" y="26" width="4" height="4" rx="1" fill="#f59e0b"/>
    <path d="M21 34 Q24 36 27 34" stroke="#f59e0b" stroke-width="2" fill="none"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(48, 48),
    anchor: new window.google.maps.Point(24, 24)
  }
}

function getPharmacyMarkerIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="pharmShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="#dcfce7" stroke="#22c55e" stroke-width="2" filter="url(#pharmShadow)"/>
    <rect x="16" y="16" width="16" height="20" rx="2" fill="#22c55e"/>
    <rect x="18" y="18" width="5" height="8" rx="1" fill="white" opacity="0.9"/>
    <rect x="25" y="18" width="5" height="8" rx="1" fill="white" opacity="0.9"/>
    <rect x="20" y="30" width="8" height="3" rx="1" fill="white" opacity="0.9"/>
    <rect x="22" y="8" width="4" height="8" rx="1" fill="#f59e0b"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(48, 48),
    anchor: new window.google.maps.Point(24, 24)
  }
}

function getUserAvatarIcon(name = 'You') {
  const initial = name.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
    <defs>
      <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#2563eb"/>
      </linearGradient>
    </defs>
    <!-- Pin shape -->
    <path d="M24 4C12.95 4 4 12.95 4 24c0 15 20 32 20 32s20-17 20-32C44 12.95 35.05 4 24 4z" fill="url(#avatarGrad)" filter="url(#userShadow)"/>
    <!-- Avatar circle -->
    <circle cx="24" cy="22" r="14" fill="#ffffff"/>
    <!-- User icon -->
    <circle cx="24" cy="18" r="5" fill="#3b82f6"/>
    <path d="M15 30c0-5 4-9 9-9s9 4 9 9" stroke="#3b82f6" stroke-width="2" fill="none"/>
    <!-- Initial text -->
    <text x="24" y="42" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">${initial}</text>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(48, 60),
    anchor: new window.google.maps.Point(24, 52)
  }
}

export default function MapView({
  center,
  markers = [],
  routes = [],
  activeRoute = null,
  traffic = false,
  darkMode = false,
  height = '100%',
  onMapClick,
  userLocation,
  zoom = 14,
  show3D = false,
  onToggle3D,
  demoMode = false,
  demoPath = [],
  demoAmbulancePos = null,
  demoProgress = 0,
  userAvatar = null,
  markerType = 'hospital'
}) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState('')
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const routeLinesRef = useRef([])
  const trafficLayerRef = useRef(null)
  const demoPathRef = useRef(null)
  const demoMarkerRef = useRef(null)
  const demoUserRingRef = useRef(null)
  const avatarMarkerRef = useRef(null)

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.google) return

    if (mapRef.current) {
      if (center) mapRef.current.panTo(center)
      mapRef.current.setZoom(zoom)
      return
    }

    const map = new window.google.maps.Map(containerRef.current, {
      center: center || { lat: 22.5726, lng: 88.3639 },
      zoom,
      mapTypeId: show3D ? 'satellite' : 'roadmap',
      tilt: show3D ? 45 : 0,
      heading: 0,
      styles: darkMode ? MAP_STYLES.dark : MAP_STYLES.light,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false,
      gestureHandling: 'greedy'
    })

    mapRef.current = map
    setMapLoaded(true)

    if (traffic) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer()
      trafficLayerRef.current.setMap(map)
    }

    if (onMapClick) {
      map.addListener('click', (e) => onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() }))
    }
  }, [center, zoom, darkMode, show3D, traffic, onMapClick])

  useEffect(() => {
    let cancelled = false
    loadGoogleMaps()
      .then(() => {
        if (!cancelled) initMap()
      })
      .catch(error => setMapError(error.message || 'Unable to load Google Maps'))

    return () => { cancelled = true }
  }, [initMap])

  useEffect(() => {
    if (mapRef.current && center) mapRef.current.panTo(center)
  }, [center])

  // Get illustrated icon based on marker type
  const getMarkerIcon = (type) => {
    switch(type) {
      case 'hospital': return getHospitalMarkerIcon()
      case 'police': return getPoliceMarkerIcon()
      case 'doctor': return getDoctorMarkerIcon()
      case 'pharmacy': return getPharmacyMarkerIcon()
      default: return getHospitalMarkerIcon()
    }
  }

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    markers.forEach(marker => {
      const m = new window.google.maps.Marker({
        position: marker.position,
        map: mapRef.current,
        title: marker.title || '',
        icon: marker.icon || getMarkerIcon(markerType),
        animation: marker.bounce ? window.google.maps.Animation.BOUNCE : null
      })

      if (marker.info) {
        const info = new window.google.maps.InfoWindow({ content: marker.info })
        m.addListener('click', () => info.open(mapRef.current, m))
      }
      markersRef.current.push(m)
    })

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
      userMarkerRef.current = null
    }

    if (userLocation) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        title: 'You are here',
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>')}`,
          scaledSize: new window.google.maps.Size(24, 24)
        }
      })
    }
  }, [markers, userLocation, mapLoaded])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    routeLinesRef.current.forEach(r => r.setMap(null))
    routeLinesRef.current = []

    routes.forEach((route, idx) => {
      if (!route.polyline) return
      const decoded = window.google.maps.geometry.encoding.decodePath(route.polyline)
      const line = new window.google.maps.Polyline({
        path: decoded,
        map: mapRef.current,
        strokeColor: route.fastest ? '#16a34a' : idx === 0 ? '#3b82f6' : '#6b7280',
        strokeOpacity: route.fastest ? 1 : 0.6,
        strokeWeight: route.fastest ? 5 : 3
      })
      routeLinesRef.current.push(line)
    })

    if (activeRoute && activeRoute.polyline) {
      const decoded = window.google.maps.geometry.encoding.decodePath(activeRoute.polyline)
      const bounds = new window.google.maps.LatLngBounds()
      decoded.forEach(p => bounds.extend(p))
      mapRef.current.fitBounds(bounds)
    }
  }, [routes, activeRoute, mapLoaded])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setOptions({
      styles: darkMode ? MAP_STYLES.dark : MAP_STYLES.light,
      mapTypeId: show3D ? 'satellite' : 'roadmap',
      tilt: show3D ? 45 : 0
    });
  }, [darkMode, show3D]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }

    trafficLayerRef.current.setMap(traffic ? mapRef.current : null);
  }, [traffic, mapLoaded]);

  // Demo mode: animated ambulance path and marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !demoMode) return;

    if (demoPath.length > 1) {
      if (demoPathRef.current) demoPathRef.current.setMap(null);
      demoPathRef.current = new window.google.maps.Polyline({
        path: demoPath,
        map: mapRef.current,
        strokeColor: '#16a34a',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        icons: [{
          icon: { path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 2, strokeColor: '#16a34a' },
          offset: '0%',
          repeat: '40px'
        }]
      });
    }

    if (demoAmbulancePos) {
      if (demoMarkerRef.current) demoMarkerRef.current.setMap(null);
      demoMarkerRef.current = new window.google.maps.Marker({
        position: demoAmbulancePos,
        map: mapRef.current,
        icon: getAmbulance3DIcon(),
        zIndex: 1000
      });
    }

    if (userLocation && demoMode) {
      if (demoUserRingRef.current) demoUserRingRef.current.setMap(null);
      demoUserRingRef.current = new window.google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        map: mapRef.current,
        center: userLocation,
        radius: 50 + Math.sin(demoProgress * Math.PI * 2) * 20
      });
    }
  }, [demoMode, demoPath, demoAmbulancePos, demoProgress, mapLoaded, userLocation]);

  // User Avatar marker (shown when ambulance arrives)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userAvatar) return;

    if (avatarMarkerRef.current) avatarMarkerRef.current.setMap(null);
    
    avatarMarkerRef.current = new window.google.maps.Marker({
      position: userAvatar.position,
      map: mapRef.current,
      icon: getUserAvatarIcon(userAvatar.name),
      zIndex: 1001,
      title: userAvatar.name,
      animation: window.google.maps.Animation.DROP
    });

    // Add info window for user
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding: 8px; font-weight: bold; color: #2563eb;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #3b82f6; border-radius: 50%; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span>${userAvatar.name} - Waiting for ambulance</span>
        </div>
      </div>`
    });

    avatarMarkerRef.current.addListener('click', () => {
      infoWindow.open(mapRef.current, avatarMarkerRef.current);
    });

    return () => {
      if (avatarMarkerRef.current) avatarMarkerRef.current.setMap(null);
    };
  }, [userAvatar, mapLoaded]);

  const handleZoom = (delta) => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + delta);
    }
  };

  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation)
    }
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            {mapError ? (
              <p className="max-w-xs text-center text-sm text-red-600 dark:text-red-300">{mapError}</p>
            ) : (
              <>
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading map...</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button onClick={handleRecenter} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <Compass size={18} />
        </button>
        <button onClick={() => handleZoom(1)} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <ZoomIn size={18} />
        </button>
        <button onClick={() => handleZoom(-1)} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <ZoomOut size={18} />
        </button>
      </div>

      {onToggle3D && (
        <button
          onClick={onToggle3D}
          className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Layers size={16} />
          {show3D ? '2D' : '3D'}
        </button>
      )}

      {traffic && mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow-md px-3 py-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <Navigation size={14} className="text-green-500" />
          Traffic ON
        </div>
      )}
    </div>
  )
}
