import { useEffect, useRef, useState } from 'react'
import { Compass, ZoomIn, ZoomOut, Layers, Navigation } from 'lucide-react'
import { loadGoogleMaps } from '../lib/googleMaps.js'

// ── SVG marker icons ───────────────────────────────────────────────────────
function makePin(fillColor, strokeColor, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
    <path d="M20 2C10.06 2 2 10.06 2 20c0 13 18 30 18 30s18-17 18-30C38 10.06 29.94 2 20 2z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" filter="url(#s)"/>
    <text x="20" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="white" font-family="sans-serif">${label}</text>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(40, 52),
    anchor: new window.google.maps.Point(20, 50),
  }
}

function getUserDotIcon() {
  // Pulsing blue dot for "You are here"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="#3b82f6" fill-opacity="0.15"/>
    <circle cx="24" cy="24" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>
    <circle cx="24" cy="24" r="5" fill="white"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
  }
}

function getHospitalPinIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/></filter>
    <path d="M22 2C10.4 2 1 11.4 1 23c0 14.4 21 31 21 31s21-16.6 21-31C43 11.4 33.6 2 22 2z" fill="#C8102E" filter="url(#sh)"/>
    <circle cx="22" cy="22" r="14" fill="white" opacity="0.95"/>
    <rect x="18" y="14" width="8" height="16" rx="2" fill="#C8102E"/>
    <rect x="14" y="18" width="16" height="8" rx="2" fill="#C8102E"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(44, 56),
    anchor: new window.google.maps.Point(22, 54),
  }
}

function getAmbulanceIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <filter id="amb"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/></filter>
    <rect x="4" y="12" width="44" height="28" rx="6" fill="#fff" stroke="#e5e7eb" stroke-width="1.5" filter="url(#amb)"/>
    <rect x="4" y="10" width="44" height="6" rx="3" fill="#3b82f6" opacity="0.9"/>
    <rect x="6" y="10" width="10" height="6" fill="#60a5fa" opacity="0.8"/>
    <rect x="32" y="10" width="10" height="6" fill="#ef4444" opacity="0.8"/>
    <rect x="18" y="22" width="16" height="4" rx="1" fill="#C8102E"/>
    <rect x="24" y="18" width="4" height="12" rx="1" fill="#C8102E"/>
    <circle cx="12" cy="42" r="5" fill="#1f2937"/>
    <circle cx="40" cy="42" r="5" fill="#1f2937"/>
    <circle cx="12" cy="42" r="2.5" fill="#4b5563"/>
    <circle cx="40" cy="42" r="2.5" fill="#4b5563"/>
    <rect x="40" y="20" width="8" height="12" rx="2" fill="#87ceeb" opacity="0.8"/>
  </svg>`
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(52, 52),
    anchor: new window.google.maps.Point(26, 48),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Light-mode clean map style
const LIGHT_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f8f9fa' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8eaed' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#dadce0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8e6f5' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#eef1ea' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
]

export default function MapView({
  center,           // initial center — only used once on mount
  markers = [],     // [{ position, title, type, bounce, info }] — type: 'user'|'hospital'|'ambulance'
  routes = [],
  activeRoute = null,
  traffic = false,
  height = '100%',
  onMapClick,
  userLocation,     // live user position — for recenter button only
  zoom = 15,
  show3D = false,
  onToggle3D,
  demoMode = false,
  demoPath = [],
  demoAmbulancePos = null,
  demoProgress = 0,
  userAvatar = null,
  onRefreshLocation,
  onHospitalSelect,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)         
  const initializedRef = useRef(false)  
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const routeLinesRef = useRef([])
  const trafficLayerRef = useRef(null)
  const demoPathRef = useRef(null)
  const demoMarkerRef = useRef(null)
  const avatarMarkerRef = useRef(null)
  const infoWindowsRef = useRef([])     // track open info windows
  const autoOpenTimeoutRef = useRef(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState('')

  // ── INIT — runs once ────────────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    let cancelled = false

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || initializedRef.current) return
        initializedRef.current = true

        const initialCenter = center || { lat: 22.5726, lng: 88.3639 }

        const map = new window.google.maps.Map(containerRef.current, {
          center: initialCenter,
          zoom,
          mapTypeId: 'roadmap',
          styles: LIGHT_STYLE,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false,
          gestureHandling: 'greedy',
          clickableIcons: false,
        })

        mapRef.current = map
        setMapLoaded(true)

        if (onMapClick) {
          map.addListener('click', (e) => {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
          })
        }
      })
      .catch(err => {
        if (!cancelled) setMapError(err.message || 'Unable to load Google Maps')
      })

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Only pan to center when it changes meaningfully (user + hospital fit) ─
  const prevCenterRef = useRef(null)
  useEffect(() => {
    if (!mapRef.current || !center) return
    const prev = prevCenterRef.current
    const changed = !prev || Math.abs(prev.lat - center.lat) > 0.0005 || Math.abs(prev.lng - center.lng) > 0.0005
    if (!changed) return
    prevCenterRef.current = center
    // Only auto-pan during initial load phase, not during constant GPS ticks
    if (!mapLoaded) return
    mapRef.current.panTo(center)
  }, [center, mapLoaded])

  // ── Traffic layer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    if (autoOpenTimeoutRef.current) {
      clearTimeout(autoOpenTimeoutRef.current)
      autoOpenTimeoutRef.current = null
    }
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer()
    }
    trafficLayerRef.current.setMap(traffic ? mapRef.current : null)
  }, [traffic, mapLoaded])

  // ── 3D / style toggle ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setOptions({
      mapTypeId: show3D ? 'satellite' : 'roadmap',
      tilt: show3D ? 45 : 0,
      styles: show3D ? [] : LIGHT_STYLE,
    })
  }, [show3D])

  // ── Map click listener update ───────────────────────────────────────────
  const clickListenerRef = useRef(null)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (clickListenerRef.current) clickListenerRef.current.remove()
    if (onMapClick) {
      clickListenerRef.current = mapRef.current.addListener('click', e => {
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      })
    }
    return () => { if (clickListenerRef.current) clickListenerRef.current.remove() }
  }, [onMapClick, mapLoaded])

  // ── Markers ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    // Clear old markers + info windows
    markersRef.current.forEach(m => m.setMap(null))
    infoWindowsRef.current.forEach(w => w.close())
    markersRef.current = []
    infoWindowsRef.current = []

    // User dot
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null }

    // Draw user dot separately (updates without re-creating all markers)
    if (userLocation) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        title: 'Your Location',
        icon: getUserDotIcon(),
        zIndex: 100,
      })
    }

    // Draw passed markers
    const hospitalMarkers = []
    markers.forEach(marker => {
      if (!marker?.position?.lat) return

      let icon
      switch (marker.type) {
        case 'hospital': icon = getHospitalPinIcon(); break
        case 'ambulance': icon = getAmbulanceIcon(); break
        case 'user': return // user dot handled separately above
        default: icon = makePin('#6b7280', '#4b5563', '?')
      }

      const m = new window.google.maps.Marker({
        position: marker.position,
        map: mapRef.current,
        title: marker.title || '',
        icon,
        zIndex: marker.type === 'hospital' ? 200 : 150,
        animation: marker.bounce ? window.google.maps.Animation.BOUNCE : null,
      })

      if (marker.info || (marker.type === 'hospital')) {
        const iw = marker.info ? new window.google.maps.InfoWindow({
          content: marker.info,
          maxWidth: 240,
        }) : null
        m.addListener('click', () => {
          infoWindowsRef.current.forEach(w => w.close())
          if (iw) iw.open(mapRef.current, m)
          // Fire hospital selection callback
          if (marker.type === 'hospital' && onHospitalSelect && marker.hospitalIdx != null) {
            onHospitalSelect(marker.hospitalIdx)
          }
        })
        // Auto-open selected (bouncing) hospital info window
        if (marker.type === 'hospital' && marker.bounce && iw) {
          autoOpenTimeoutRef.current = setTimeout(() => {
            infoWindowsRef.current.forEach(w => w.close())
            iw.open(mapRef.current, m)
          }, 400)
        }
        if (iw) infoWindowsRef.current.push(iw)
      }

      markersRef.current.push(m)
      if (marker.type === 'hospital') hospitalMarkers.push(marker.position)
    })

    // Auto-fit bounds to show both user + hospital on map
    if (userLocation && hospitalMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(userLocation)
      hospitalMarkers.forEach(p => bounds.extend(p))
      mapRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 })
    }
  }, [markers, userLocation, mapLoaded])

  // User dot position update (smooth — no full marker re-create)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (userMarkerRef.current && userLocation) {
      userMarkerRef.current.setPosition(userLocation)
    }
  }, [userLocation, mapLoaded])

  // ── Routes ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    routeLinesRef.current.forEach(r => r.setMap(null))
    routeLinesRef.current = []

    const allRoutes = activeRoute ? [activeRoute, ...routes.filter(r => r.id !== activeRoute.id)] : routes
    allRoutes.forEach((route, idx) => {
      let path
      try {
        if (route.polyline) path = window.google.maps.geometry.encoding.decodePath(route.polyline)
        else if (route.path) path = route.path
        else return
      } catch { return }

      const isActive = route.id === activeRoute?.id
      const line = new window.google.maps.Polyline({
        path,
        map: mapRef.current,
        strokeColor: isActive ? '#C8102E' : (route.fastest ? '#16a34a' : '#9ca3af'),
        strokeOpacity: isActive ? 1 : 0.5,
        strokeWeight: isActive ? 5 : 3,
        zIndex: isActive ? 10 : 5,
      })
      routeLinesRef.current.push(line)
    })

    // Fit to active route
    if (activeRoute) {
      try {
        let path
        if (activeRoute.polyline) path = window.google.maps.geometry.encoding.decodePath(activeRoute.polyline)
        else if (activeRoute.path) path = activeRoute.path
        if (path?.length) {
          const bounds = new window.google.maps.LatLngBounds()
          path.forEach(p => bounds.extend(p))
          mapRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 80, left: 40 })
        }
      } catch {}
    }
  }, [routes, activeRoute, mapLoaded])

  // ── Demo ambulance animation ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    if (!demoMode) {
      if (demoPathRef.current) { demoPathRef.current.setMap(null); demoPathRef.current = null }
      if (demoMarkerRef.current) { demoMarkerRef.current.setMap(null); demoMarkerRef.current = null }
      return
    }

    if (demoPath.length > 1) {
      if (demoPathRef.current) demoPathRef.current.setMap(null)
      demoPathRef.current = new window.google.maps.Polyline({
        path: demoPath, map: mapRef.current,
        strokeColor: '#16a34a', strokeOpacity: 0.85, strokeWeight: 5,
        zIndex: 20,
      })
    }

    if (demoAmbulancePos) {
      if (!demoMarkerRef.current) {
        demoMarkerRef.current = new window.google.maps.Marker({
          position: demoAmbulancePos,
          map: mapRef.current,
          icon: getAmbulanceIcon(),
          zIndex: 500,
        })
      } else {
        demoMarkerRef.current.setPosition(demoAmbulancePos)
      }
    }
  }, [demoMode, demoPath, demoAmbulancePos, mapLoaded])

  // ── User avatar on arrival ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userAvatar?.position) return
    if (avatarMarkerRef.current) avatarMarkerRef.current.setMap(null)
    avatarMarkerRef.current = new window.google.maps.Marker({
      position: userAvatar.position,
      map: mapRef.current,
      icon: makePin('#2563eb', '#1d4ed8', (userAvatar.name || 'You').charAt(0).toUpperCase()),
      zIndex: 600,
      animation: window.google.maps.Animation.DROP,
      title: userAvatar.name || 'You',
    })
  }, [userAvatar, mapLoaded])

  // ── Recenter ─────────────────────────────────────────────────────────────
  const handleRecenter = () => {
    if (onRefreshLocation) onRefreshLocation()
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation)
      mapRef.current.setZoom(16)
    }
  }
  const handleZoom = (delta) => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + delta)
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading / error overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            {mapError ? (
              <p className="max-w-xs text-center text-sm text-red-600">{mapError}</p>
            ) : (
              <>
                <div className="w-10 h-10 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading map...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map controls */}
      {mapLoaded && (
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <button onClick={handleRecenter} title="Recenter" className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all border border-gray-100">
            <Compass size={16} />
          </button>
          <button onClick={() => handleZoom(1)} title="Zoom in" className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all border border-gray-100">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => handleZoom(-1)} title="Zoom out" className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all border border-gray-100">
            <ZoomOut size={16} />
          </button>
        </div>
      )}

      {onToggle3D && mapLoaded && (
        <button
          onClick={onToggle3D}
          className="absolute top-3 right-3 bg-white rounded-lg shadow-md px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all border border-gray-100"
        >
          <Layers size={13} />
          {show3D ? '2D' : '3D'}
        </button>
      )}

      {traffic && mapLoaded && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg shadow-sm px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-medium text-gray-500 border border-gray-100">
          <Navigation size={11} className="text-emerald-500" />
          Live traffic
        </div>
      )}
    </div>
  )
}
