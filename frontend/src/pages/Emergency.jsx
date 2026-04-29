import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import MapView from '../components/MapView.jsx'
import LoginModal from '../components/LoginModal.jsx'
import { useSocket } from '../hooks/useSocket.js'
import {
  Ambulance, Phone, MapPin, Clock, Navigation, AlertTriangle, ChevronLeft,
  Shield, Car, X, CheckCircle, Siren, Route, User, Activity, MessageSquare,
  Timer, ArrowRight, Loader2, Building2
} from 'lucide-react'

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')

const lucideSvg = (inner, size, stroke) => (
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
)

const LUCIDE = {
  mapPinBlue: lucideSvg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 12, '#2563eb'),
  mapPinRed: lucideSvg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 18, '#C8102E'),
  phoneGreen: lucideSvg('<path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h4.09a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.03 9.91a16 16 0 0 0 6 6l1.27-1.42a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>', 14, '#059669'),
  clockOrange: lucideSvg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', 12, '#c2410c'),
  starAmber: lucideSvg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 12, '#d97706'),
}

const buildHospitalInfoHtml = ({ name, address, phone, rating, openNow, distText, etaText }) => {
  const safeName = name || 'Hospital'
  const safeAddress = address || ''
  const canCall = phone && phone !== 'N/A'
  const ratingNum = Number(rating)
  const ratingText = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : null
  const openText = openNow === true ? 'Open now' : openNow === false ? 'Closed' : null
  const openBg = openNow === true ? '#ecfdf3' : '#fef2f2'
  const openFg = openNow === true ? '#059669' : '#dc2626'

  return `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:240px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 30px rgba(15,23,42,0.12);overflow:hidden;">
        <div style="height:4px;background:linear-gradient(90deg,#C8102E,#ef4444);"></div>
        <div style="padding:10px 12px;">
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#fee2e2;border:1px solid #fecaca;display:flex;align-items:center;justify-content:center;">
              ${LUCIDE.mapPinRed}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:#111827;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeName}</div>
              <div style="font-size:10px;color:#6b7280;line-height:1.3;margin-top:2px;">${safeAddress}</div>
            </div>
            ${canCall ? `<a href="tel:${phone}" style="width:32px;height:32px;border-radius:10px;background:#ecfdf3;border:1px solid #d1fae5;display:flex;align-items:center;justify-content:center;text-decoration:none;" title="Call">${LUCIDE.phoneGreen}</a>` : ''}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
            ${distText ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:600;">${LUCIDE.mapPinBlue}${distText}</span>` : ''}
            ${etaText ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:8px;background:#fff7ed;color:#c2410c;font-size:10px;font-weight:600;">${LUCIDE.clockOrange}${etaText}</span>` : ''}
            ${ratingText ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:8px;background:#fef3c7;color:#92400e;font-size:10px;font-weight:600;">${LUCIDE.starAmber}${ratingText}</span>` : ''}
            ${openText ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:8px;background:${openBg};color:${openFg};font-size:10px;font-weight:600;">${openText}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `
}

export default function Emergency() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  // ── Location state — only update marker, not used for hospital search ──
  const [userLocation, setUserLocation] = useState(null)         // live dot on map
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // ── Stable GPS ref — locked once we have a good fix, used by all fetches ──
  const stableGpsRef = useRef(null)   // { lat, lng } — never changes after first fix
  const hospitalFetchedRef = useRef(false)  // prevent double-fetch

  const [destination, setDestination] = useState(null)
  const [nearestHospital, setNearestHospital] = useState(null) // { name, address, distance, location }
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [routes, setRoutes] = useState([])
  const [activeRoute, setActiveRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('init')   // init | fetching_hospital | ambulance_list | route_calc | searching | tracking | civilian_direct | civilian_active | civilian_prompt | error
  const [ambulances, setAmbulances] = useState([])
  const [requestStatus, setRequestStatus] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [civilianForm, setCivilianForm] = useState({ vehicleNumber: '', purpose: '', contact: '' })
  const [civilianResult, setCivilianResult] = useState(null)
  const [show3D, setShow3D] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am LifeLine+ AI. How can I help you in this emergency?' }])
  const [inputMsg, setInputMsg] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [demoPath, setDemoPath] = useState([])
  const [demoAmbulancePos, setDemoAmbulancePos] = useState(null)
  const [demoProgress, setDemoProgress] = useState(0)
  const [demoCountdown, setDemoCountdown] = useState(60)
  const [selectedAmbulance, setSelectedAmbulance] = useState(null)
  const [showArrivalNotification, setShowArrivalNotification] = useState(false)
  const [userAvatar, setUserAvatar] = useState(null)
  const [selectedHospitalIdx, setSelectedHospitalIdx] = useState(0)

  const demoIntervalRef = useRef(null)
  const watchIdRef = useRef(null)
  const { emit, on } = useSocket(user?.id)

  // ─────────────────────────────────────────────────────────────────────────
  // GPS: one-shot + watch. Lock stableGpsRef on first fix, then fetch hospital.
  // Watch only updates the blue "you are here" dot.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setShowLogin(true); return }

    const onFirstFix = (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setUserLocation(coords)
      setLocationAccuracy(Math.round(pos.coords.accuracy))
      setLocationError(null)

      // Lock the stable ref — only used for API calls, never changes
      if (!stableGpsRef.current) {
        stableGpsRef.current = coords
        // Trigger hospital fetch now that we have real GPS
        fetchNearestHospital(coords)
      }
    }

    const onError = () => {
      if (!stableGpsRef.current) setUserLocation(null)
      setLocationAccuracy(null)
      setLocationError('Location access denied. Please enable location services to continue.')
      setPhase('init')
    }

    // One-shot for immediate first fix
    navigator.geolocation.getCurrentPosition(onFirstFix, onError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    })

    // Watch only updates the dot — stableGpsRef stays locked
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationAccuracy(Math.round(pos.coords.accuracy))
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    )

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Force a fresh GPS fix and restart hospital fetch
  // ─────────────────────────────────────────────────────────────────────────
  const refreshLocation = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(coords)
        setLocationAccuracy(Math.round(pos.coords.accuracy))
        setLocationError(null)
        stableGpsRef.current = coords
        hospitalFetchedRef.current = false
        setNearestHospital(null)
        setDestination(null)
        setRoutes([])
        setActiveRoute(null)
        fetchNearestHospital(coords)
      },
      () => {
        setLocationAccuracy(null)
        setLocationError('Location access denied. Please enable location services to continue.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch nearest hospital — called ONCE with the stable GPS coords
  // ─────────────────────────────────────────────────────────────────────────
  const fetchNearestHospital = async (coords) => {
    if (hospitalFetchedRef.current) return
    hospitalFetchedRef.current = true

    setPhase('fetching_hospital')
    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
        type: 'hospital',
        radius: '14000',
      })
      const res = await fetch(`${BACKEND_URL}/api/nearest-services?${params}`)
      const data = await res.json()

      // Pick top 4 hospitals with valid locations
      const results = (data.results || []).filter(r => r.location?.lat && r.location?.lng)
      if (results.length === 0) {
        setPhase('init')
        setLoading(false)
        return
      }

      const topHospitals = results.slice(0, 6)
      const topHospitalsWithDetails = await Promise.all(
        topHospitals.map(async (h) => {
          try {
            const detailRes = await fetch(`${BACKEND_URL}/api/nearest-services/details/${h.id}`);
            if (!detailRes.ok) throw new Error('Details fetch failed');
            const detailData = await detailRes.json();
            return {
              ...h,
              phone: detailData.formatted_phone_number || detailData.international_phone_number || 'N/A'
            };
          } catch (e) {
            return { ...h, phone: 'N/A' };
          }
        })
      );

      setNearbyHospitals(topHospitalsWithDetails)

      const nearest = topHospitalsWithDetails[0]  // already sorted by distance from backend
      const dist = nearest.distance != null ? `${nearest.distance.toFixed(1)} km` : null

      setNearestHospital({
        name: nearest.name || 'Nearest Hospital',
        address: nearest.address || '',
        distance: dist,
        rating: nearest.rating,
        openNow: nearest.openNow,
        location: nearest.location,
        placeId: nearest.id,
        phone: nearest.phone
      })
      setDestination(nearest.location)
      setPhase('route_calc')
    } catch (err) {
      console.error('Hospital fetch error:', err)
      setPhase('init')
    }
    setLoading(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Select a hospital from the nearby list (updates destination + nearest)
  // ─────────────────────────────────────────────────────────────────────────
  const handleHospitalSelect = (h, idx) => {
    setSelectedHospitalIdx(idx)
    const dist = h.distance != null ? `${h.distance.toFixed(1)} km` : null
    setNearestHospital({
      name: h.name || 'Hospital',
      address: h.address || '',
      distance: dist,
      rating: h.rating,
      openNow: h.openNow,
      location: h.location,
      placeId: h.id,
      phone: h.phone
    })
    setDestination(h.location)
    setRoutes([])
    setActiveRoute(null)
    setPhase('route_calc')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Manual refetch (user taps "Change")
  // ─────────────────────────────────────────────────────────────────────────
  const retryHospitalFetch = () => {
    if (!stableGpsRef.current) return
    hospitalFetchedRef.current = false
    setNearestHospital(null)
    setNearbyHospitals([])
    setDestination(null)
    setRoutes([])
    setActiveRoute(null)
    fetchNearestHospital(stableGpsRef.current)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Socket events
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!on) return
    const off1 = on('ambulance_assigned', data => { setRequestStatus({ ...data, status: 'accepted' }); setTracking(data.ambulance); setPhase('tracking') })
    const off2 = on('ambulance_not_found', data => { setRequestStatus({ ...data, status: 'no_ambulance' }); setPhase('civilian_prompt') })
    const off3 = on('location_update', data => { setTracking(prev => prev ? { ...prev, location: data.location } : null) })
    const off4 = on('ambulance_arrived', data => { setRequestStatus(prev => prev ? { ...prev, status: 'arrived', ...data } : prev) })
    return () => { off1(); off2(); off3(); off4() }
  }, [on])

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch routes — uses stableGpsRef, not live location
  // ─────────────────────────────────────────────────────────────────────────
  const fetchRoutes = useCallback(async () => {
    const origin = stableGpsRef.current
    if (!origin || !destination) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/routes/emergency?originLat=${origin.lat}&originLng=${origin.lng}&destLat=${destination.lat}&destLng=${destination.lng}`)
      const data = await res.json()
      setRoutes(data.routes || [])
      setActiveRoute(data.fastestRoute || data.routes?.[0] || null)
    } catch (e) {}
    setLoading(false)
  }, [destination])

  useEffect(() => {
    if (phase === 'route_calc' && destination) fetchRoutes()
  }, [phase, destination, fetchRoutes])

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch ambulances
  // ─────────────────────────────────────────────────────────────────────────
  const fetchAmbulances = useCallback(async () => {
    const origin = stableGpsRef.current
    if (!origin) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/ambulance-request/nearby?lat=${origin.lat}&lng=${origin.lng}`)
      const data = await res.json()
      setAmbulances(data.ambulances || [])
      setPhase('ambulance_list')
    } catch (e) { setAmbulances([]) }
    setLoading(false)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Book ambulance
  // ─────────────────────────────────────────────────────────────────────────
  const bookAmbulance = async (ambulance) => {
    const origin = stableGpsRef.current
    if (!origin) return
    setLoading(true)
    setSelectedAmbulance(ambulance)
    try {
      const res = await fetch(`${BACKEND_URL}/api/ambulance-request/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pickupLat: origin.lat, pickupLng: origin.lng,
          destinationLat: destination?.lat, destinationLng: destination?.lng,
          preferredAmbulanceId: ambulance?.id,
          emergencyType: 'medical',
          patientName: user.name,
          contact: user.phone || civilianForm.contact,
          notes: ''
        })
      })
      const data = await res.json()
      if (data.requestId) emit('join_request', data.requestId)
      setRequestStatus({ ...data, status: 'searching' })
      setPhase('searching')
      if (ambulance?.location) startDemoAnimation(ambulance.location, origin)
    } catch (e) { setPhase('error') }
    setLoading(false)
  }

  const startDemoAnimation = (ambulanceLoc, userLoc) => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    const steps = 60
    const path = Array.from({ length: steps + 1 }, (_, i) => ({
      lat: ambulanceLoc.lat + (userLoc.lat - ambulanceLoc.lat) * (i / steps),
      lng: ambulanceLoc.lng + (userLoc.lng - ambulanceLoc.lng) * (i / steps),
    }))
    setDemoPath(path); setDemoMode(true); setDemoAmbulancePos(ambulanceLoc); setDemoProgress(0); setDemoCountdown(60)
    let step = 0
    demoIntervalRef.current = setInterval(() => {
      step++
      if (step > steps) {
        clearInterval(demoIntervalRef.current)
        setDemoMode(false)
        setShowArrivalNotification(true)
        setUserAvatar({ position: userLoc, name: user?.name || 'You' })
        setTimeout(() => setShowArrivalNotification(false), 10000)
        return
      }
      setDemoProgress(step / steps)
      setDemoAmbulancePos(path[step])
      setDemoCountdown(60 - step)
    }, 1000)
  }

  useEffect(() => () => { if (demoIntervalRef.current) clearInterval(demoIntervalRef.current) }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Civilian verify
  // ─────────────────────────────────────────────────────────────────────────
  const verifyCivilian = async () => {
    const origin = stableGpsRef.current
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify/civilian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...civilianForm, location: origin, destination })
      })
      const data = await res.json()
      setCivilianResult(data)
      if (data.verified) {
        setPhase('civilian_active')
        await fetch(`${BACKEND_URL}/api/police/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: data.tempVehicleId, vehicleType: 'civilian_emergency',
            route: activeRoute?.steps || [], eta: activeRoute?.duration,
            location: origin, requestType: 'civilian_emergency', contact: civilianForm.contact
          })
        })
      }
    } catch (e) { setCivilianResult({ verified: false, message: 'Verification failed' }) }
    setLoading(false)
  }

  useEffect(() => {
    if (phase !== 'civilian_active' || !civilianResult?.tempVehicleId) return
    emit('join_civilian', civilianResult.tempVehicleId)
    const publishLocation = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        emit('track_civilian', { vehicleId: civilianResult.tempVehicleId, lat: pos.coords.latitude, lng: pos.coords.longitude, route: activeRoute?.steps || [] })
      })
    }
    publishLocation()
    const iv = setInterval(publishLocation, 5000)
    return () => clearInterval(iv)
  }, [phase, civilianResult?.tempVehicleId, activeRoute, emit])

  const sendMessage = async () => {
    if (!inputMsg.trim()) return
    const txt = inputMsg.trim()
    setMessages(prev => [...prev, { role: 'user', text: txt }])
    setInputMsg('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: txt, context: { phase, location: stableGpsRef.current, destination } })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data?.text || 'Stay calm. Help is on the way.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Unable to connect. Please call 108.' }])
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build map markers — all hospitals shown, selected one bounces
  // ─────────────────────────────────────────────────────────────────────────
  const mapMarkers = []
  if (userLocation) mapMarkers.push({ position: userLocation, title: 'Your Location', type: 'user' })
  
  if (nearbyHospitals.length > 0) {
    nearbyHospitals.forEach((h, idx) => {
      if (h.location) {
        const distString = h.distance != null ? `${h.distance.toFixed(1)} km` : null
        const isSelected = idx === selectedHospitalIdx
        const roughEta = h.distance != null ? Math.ceil(h.distance / 30 * 60) : null
        const eta = isSelected && activeRoute ? activeRoute.duration : (roughEta ? `~${roughEta} min` : null)
        mapMarkers.push({
          position: h.location,
          title: h.name || 'Hospital',
          type: 'hospital',
          bounce: isSelected,
          hospitalIdx: idx,
          info: buildHospitalInfoHtml({
            name: h.name,
            address: h.address,
            phone: h.phone,
            rating: h.rating,
            openNow: h.openNow,
            distText: distString,
            etaText: eta,
          })
        })
      }
    })
  } else if (nearestHospital?.location) {
    mapMarkers.push({
      position: nearestHospital.location,
      title: nearestHospital.name || 'Hospital',
      type: 'hospital',
      bounce: true,
      info: buildHospitalInfoHtml({
        name: nearestHospital.name,
        address: nearestHospital.address,
        phone: nearestHospital.phone,
        rating: nearestHospital.rating,
        openNow: nearestHospital.openNow,
        distText: nearestHospital.distance || null,
        etaText: activeRoute?.duration || null,
      })
    })
  }
  if (tracking?.location) mapMarkers.push({ position: tracking.location, title: 'Ambulance', type: 'ambulance' })

  const routePoly = activeRoute ? [activeRoute] : routes

  // Map center: only use a real user location
  const mapCenter = userLocation || stableGpsRef.current

  if (!user) return showLogin ? <LoginModal onClose={() => navigate('/')} /> : null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3.5 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/')} className="flex items-center justify-center text-gray-600 transition-all w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl active:scale-95 shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#C8102E] tracking-widest uppercase mb-0.5 truncate">
             {phase === 'tracking' ? 'Live Tracking' : phase === 'civilian_active' ? 'Civilian Mode' : 'Emergency Assistance'}
          </p>
          <h1 className="font-bold text-lg text-gray-900 flex items-center gap-1.5 leading-none truncate">
            <Siren size={18} className="text-[#C8102E] shrink-0" />
            LifeLine+ SOS
          </h1>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
           {locationAccuracy && (
            <div className="text-right border-r border-gray-100 pr-2.5 hidden sm:block">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Accuracy</p>
              <p className="text-xs font-bold text-gray-900">±{locationAccuracy}m</p>
            </div>
          )}
          <button onClick={refreshLocation} title="Refresh GPS" className="w-9 h-9 bg-red-50 hover:bg-red-100 text-[#C8102E] rounded-xl flex items-center justify-center transition-all active:scale-95">
             <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* ── Location error banner ───────────────────────────────────────── */}
      {locationError && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-amber-700">
          <AlertTriangle size={14} className="shrink-0" />
          {locationError}
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="overflow-hidden border border-gray-100 shadow-md rounded-2xl">
          {mapCenter ? (
            <MapView
              center={mapCenter}
              markers={mapMarkers}
              routes={routePoly}
              activeRoute={activeRoute}
              userLocation={userLocation}
              height="340px"
              traffic={true}
              show3D={show3D}
              onToggle3D={() => setShow3D(v => !v)}
              onMapClick={undefined}
              onHospitalSelect={(idx) => nearbyHospitals[idx] && handleHospitalSelect(nearbyHospitals[idx], idx)}
              onRefreshLocation={refreshLocation}
              zoom={14}
              demoMode={demoMode}
              demoPath={demoPath}
              demoAmbulancePos={demoAmbulancePos}
              demoProgress={demoProgress}
              userAvatar={userAvatar}
            />
          ) : (
            <div className="h-[340px] bg-white flex flex-col items-center justify-center text-center px-6">
              <AlertTriangle size={20} className="mb-2 text-amber-500" />
              <p className="text-sm font-semibold text-gray-800">Location not available</p>
              <p className="mt-1 text-xs text-gray-500">Enable location services to load nearby hospitals.</p>
            </div>
          )}
        </div>
      </div>



      {/* ── Nearby Hospitals + Actions ──────────────────────────────── */}
      {nearbyHospitals.length > 0 && (
        <div className="px-4 mt-4 space-y-2">

          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospitals Nearby</p>
            <button onClick={retryHospitalFetch} className="text-[10px] text-[#C8102E] font-semibold hover:underline">Refresh</button>
          </div>

          {nearbyHospitals.map((h, idx) => {
            const isSelected = idx === selectedHospitalIdx
            const dist = h.distance != null ? h.distance.toFixed(1) : null
            const roughEta = h.distance != null ? Math.ceil(h.distance / 30 * 60) : null
            const eta = isSelected && activeRoute ? activeRoute.duration : (roughEta ? `~${roughEta} min` : null)
            return (
              <div
                key={h.id || idx}
                onClick={() => handleHospitalSelect(h, idx)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-red-50 border-[#C8102E]/30 ring-1 ring-[#C8102E]/10'
                    : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isSelected ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-500'
                }`}>{idx + 1}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-[#C8102E]' : 'text-gray-800'}`}>{h.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {dist && <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MapPin size={8}/>{dist} km</span>}
                    {eta && <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${isSelected && activeRoute ? 'text-[#C8102E]' : 'text-gray-400'}`}><Clock size={8}/>{eta}</span>}
                    {h.openNow === true && <span className="text-[10px] font-semibold text-emerald-500">● Open</span>}
                    {h.openNow === false && <span className="text-[10px] text-red-400">○ Closed</span>}
                  </div>
                </div>

                {/* Call */}
                {h.phone && h.phone !== 'N/A' ? (
                  <a href={`tel:${h.phone}`} onClick={e => e.stopPropagation()}
                    className="flex items-center justify-center transition-all border w-9 h-9 bg-emerald-50 hover:bg-emerald-100 border-emerald-100 rounded-xl shrink-0 active:scale-95">
                    <Phone size={14} className="text-emerald-600" />
                  </a>
                ) : (
                  <div className="flex items-center justify-center border border-gray-100 w-9 h-9 bg-gray-50 rounded-xl shrink-0">
                    <Phone size={14} className="text-gray-300" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Action buttons */}
          {nearestHospital && (
            <div className="pt-1 space-y-2">
              <button
                onClick={fetchAmbulances}
                disabled={!stableGpsRef.current || loading}
                className="w-full bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-[#C8102E]/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : <Ambulance size={22} />}
                {loading ? 'Finding ambulances...' : 'Find Nearby Ambulances'}
              </button>
              <button onClick={() => setPhase('civilian_direct')}
                className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-gray-600 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 active:scale-95">
                <Car size={16} /> Self-Drive / Civilian Mode
              </button>
            </div>
          )}
        </div>
      )}

      {/* No hospitals found */}
      {!nearbyHospitals.length && phase === 'init' && stableGpsRef.current && (
        <div className="px-4 mt-4 space-y-2">
          <button onClick={fetchAmbulances} className="w-full bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#C8102E]/20 transition-all active:scale-95">
            <Ambulance size={22} /> Find Nearby Ambulances
          </button>
          <button onClick={retryHospitalFetch} className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:bg-gray-50 active:scale-95">
            <Route size={16} /> Retry: Find Nearest Hospital
          </button>
        </div>
      )}

      {/* Map click hint — only shown when no hospitals loaded yet */}
      {phase === 'init' && !nearestHospital && !nearbyHospitals.length && (
        <p className="mt-3 text-xs text-center text-gray-400">Detecting your location...</p>
      )}

      {/* ── Phase: fetching_hospital ──────────────────────────────────── */}
      {phase === 'fetching_hospital' && (
        <div className="px-4 mt-6 text-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Locating nearest hospital...</p>
          <p className="mt-1 text-xs text-gray-400">Using your GPS coordinates</p>
        </div>
      )}

      {/* ── Phase: init (GPS found, hospital found, ready to book) ────── */}
      {(phase === 'init' || phase === 'route_calc') && nearestHospital && (
        <div className="px-4 mt-4 space-y-3">
          <button
            onClick={fetchAmbulances}
            disabled={!stableGpsRef.current || loading}
            className="w-full bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-[#C8102E]/20 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={22} className="animate-spin" /> : <Ambulance size={22} />}
            {loading ? 'Finding ambulances...' : 'Find Nearby Ambulances'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={retryHospitalFetch}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:border-gray-300 hover:bg-gray-50 active:scale-95"
            >
              <Route size={16} /> Change Hospital
            </button>
            <button
              onClick={() => setPhase('civilian_direct')}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 active:scale-95"
            >
              <Car size={16} /> Civilian Mode
            </button>
          </div>
        </div>
      )}

      {/* No hospital found fallback */}
      {phase === 'init' && !nearestHospital && stableGpsRef.current && (
        <div className="px-4 mt-4 space-y-3">
          <button
            onClick={fetchAmbulances}
            className="w-full bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-[#C8102E]/20 transition-all active:scale-95"
          >
            <Ambulance size={22} /> Find Nearby Ambulances
          </button>
          <button
            onClick={retryHospitalFetch}
            className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:bg-gray-50 active:scale-95"
          >
            <Route size={16} /> Retry: Find Nearest Hospital
          </button>
        </div>
      )}

      {/* ── Phase: routes loading ─────────────────────────────────────── */}
      {phase === 'route_calc' && routes.length === 0 && loading && (
        <div className="px-4 mt-6 text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Calculating traffic-aware routes...</p>
        </div>
      )}

      {/* ── Phase: Route Selection ────────────────────────────────────── */}
      {phase === 'route_calc' && routes.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
            <Route size={18} className="text-blue-500" /> Emergency Routes
          </h2>
          <div className="space-y-2">
            {routes.map(route => (
              <button
                key={route.id}
                onClick={() => setActiveRoute(route)}
                className={`w-full bg-white rounded-2xl border text-left flex items-center gap-3 p-4 transition-all shadow-sm ${activeRoute?.id === route.id ? 'border-[#C8102E] ring-1 ring-[#C8102E]/20' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${route.fastest ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Navigation size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{route.distance} · {route.duration}</p>
                  <p className="text-xs text-gray-400">{route.trafficStatus === 'heavy' ? 'Heavy traffic' : route.trafficStatus === 'moderate' ? 'Moderate traffic' : 'Clear route'}</p>
                </div>
                {route.fastest && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Fastest</span>}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAmbulances}
            className="w-full mt-4 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#C8102E]/15 transition-all active:scale-95"
          >
            <Ambulance size={20} /> Book Ambulance on This Route
          </button>
        </div>
      )}

      {/* ── Phase: Ambulance List ─────────────────────────────────────── */}
      {phase === 'ambulance_list' && (
        <div className="px-4 mt-5">
          {/* Highlight destination hospital */}
          {nearestHospital && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 mb-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#C8102E] tracking-widest uppercase mb-0.5">Destination Hospital</p>
                <p className="text-sm font-bold leading-tight text-gray-900">{nearestHospital.name}</p>
                <div className="flex items-center gap-2 mt-1">
                   <Clock size={11} className="text-[#C8102E]" />
                   <span className="text-[11px] font-semibold text-gray-700">{activeRoute ? activeRoute.duration : nearestHospital.distance} to arrival</span>
                </div>
              </div>
            </div>
          )}

          <h2 className="flex items-center gap-2 mb-3 text-base font-bold text-gray-900">
            <Ambulance size={18} className="text-[#C8102E]" /> Nearby Ambulances
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-72 no-scrollbar">
            {ambulances.map(amb => (
              <div key={amb.id} className="flex items-center gap-3 p-4 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl shrink-0">
                  <Ambulance size={22} className="text-[#C8102E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{amb.type} Ambulance</p>
                  <p className="text-xs text-gray-400">{amb.vehicleNumber} · {amb.driver?.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><Clock size={11} /> {amb.eta}m ETA</span>
                    <span className="text-xs text-gray-400">{amb.distance} km</span>
                  </div>
                </div>
                <button onClick={() => bookAmbulance(amb)} className="shrink-0 bg-[#C8102E] hover:bg-[#a50d26] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
                  Book
                </button>
              </div>
            ))}
            {ambulances.length === 0 && (
              <div className="py-10 text-center bg-white border border-gray-100 rounded-2xl">
                <p className="text-sm text-gray-400">No ambulances available nearby</p>
                <button onClick={() => setPhase('civilian_direct')} className="mt-3 text-[#C8102E] text-sm font-semibold hover:underline">
                  Try Civilian Mode
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Phase: Searching ─────────────────────────────────────────── */}
      {phase === 'searching' && (
        <div className="px-4 mt-8 space-y-4">
          <div className="text-center">
            {!demoMode && <div className="w-16 h-16 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />}
            <h2 className="text-lg font-bold text-gray-900">{demoMode ? 'Ambulance En Route' : 'Finding Driver...'}</h2>
            <p className="mt-1 text-sm text-gray-400">Request ID: {requestStatus?.requestId}</p>
            {!demoMode && <p className="mt-2 text-xs text-gray-400">Drivers have 5 minutes to accept</p>}
          </div>
          {demoMode && (
            <div className="p-4 border bg-emerald-50 border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl">
                  <Timer size={22} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Arriving in {Math.floor(demoCountdown / 60)}:{String(demoCountdown % 60).padStart(2, '0')}</p>
                  <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-2">
                    <div className="h-full transition-all duration-1000 rounded-full bg-emerald-500" style={{ width: `${(demoCountdown / 60) * 100}%` }} />
                  </div>
                </div>
                <p className="text-xs font-bold text-emerald-600">{Math.round(demoProgress * 100)}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Arrival Notification ──────────────────────────────────────── */}
      {showArrivalNotification && (
        <div className="fixed z-50 top-20 left-4 right-4">
          <div className="flex items-center gap-4 p-4 text-white shadow-2xl bg-emerald-500 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shrink-0">
              <Ambulance size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-bold">Ambulance Arrived! <CheckCircle size={18} /></h3>
              <p className="text-xs text-emerald-100">Your ambulance has reached your location</p>
            </div>
            <button onClick={() => setShowArrivalNotification(false)} className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* ── Phase: Tracking ──────────────────────────────────────────── */}
      {phase === 'tracking' && requestStatus?.status === 'accepted' && (
        <div className="px-4 mt-5">
          <div className="p-4 border bg-emerald-50 border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={22} className="text-emerald-600" />
              <div>
                <h2 className="font-bold text-gray-900">Ambulance Assigned!</h2>
                <p className="text-xs text-emerald-700">ETA: {requestStatus.eta} minutes</p>
              </div>
            </div>
            <div className="p-3 space-y-2 bg-white rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-gray-100 rounded-full w-9 h-9"><User size={16} className="text-gray-500" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{requestStatus.ambulance?.driver?.name}</p>
                  <p className="text-xs text-gray-400">{requestStatus.ambulance?.vehicleNumber}</p>
                </div>
                <a href={`tel:${requestStatus.ambulance?.driver?.phone}`} className="flex items-center justify-center ml-auto rounded-full w-9 h-9 bg-emerald-100 text-emerald-600"><Phone size={15} /></a>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600"><Activity size={13} className="animate-pulse" /> Live tracking active</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => setPhase('init')} className="py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:bg-gray-50 active:scale-95">New Request</button>
            <button onClick={() => navigate('/')} className="bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-3 rounded-2xl transition-all active:scale-95 text-sm shadow-sm shadow-[#C8102E]/15">Done</button>
          </div>
        </div>
      )}

      {/* ── Phase: No Ambulance ─────────────────────────────────────── */}
      {phase === 'civilian_prompt' && (
        <div className="px-4 mt-5 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-2xl">
            <AlertTriangle size={30} className="text-amber-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900">No Ambulance Available</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">Try Civilian Mode to use your own vehicle as an emergency vehicle.</p>
          <button onClick={() => setPhase('civilian_direct')} className="w-full bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#C8102E]/15 transition-all active:scale-95">
            <Car size={20} /> Activate Civilian Mode
          </button>
          <button onClick={() => setPhase('ambulance_list')} className="mt-3 text-sm text-gray-400 hover:text-gray-600">Back to list</button>
        </div>
      )}

      {/* ── Phase: Civilian Form ─────────────────────────────────────── */}
      {(phase === 'civilian_direct' || (phase === 'civilian_prompt' && !civilianResult)) && (
        <div className="px-4 mt-5">
          <h2 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
            <Shield size={18} className="text-amber-500" /> Civilian Emergency Mode
          </h2>
          <div className="p-4 space-y-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
            {[
              { key: 'vehicleNumber', label: 'Vehicle Number', ph: 'WB-02-A-1234' },
              { key: 'purpose', label: 'Emergency Purpose', ph: 'Taking patient to hospital' },
              { key: 'contact', label: 'Contact Number', ph: '+91 ...' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">{f.label}</label>
                <input className="text-sm input-field" placeholder={f.ph} value={civilianForm[f.key]} onChange={e => setCivilianForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button
              onClick={verifyCivilian}
              disabled={loading || !civilianForm.vehicleNumber || !civilianForm.purpose || !civilianForm.contact}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              {loading ? 'Verifying with AI...' : 'Verify & Activate'}
            </button>
          </div>
        </div>
      )}

      {/* ── Phase: Civilian Active ───────────────────────────────────── */}
      {phase === 'civilian_active' && civilianResult?.verified && (
        <div className="px-4 mt-5">
          <div className="p-4 border bg-amber-50 border-amber-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={22} className="text-amber-600" />
              <div>
                <h2 className="font-bold text-gray-900">Civilian Mode Active</h2>
                <p className="text-xs text-amber-700">ID: {civilianResult.tempVehicleId}</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Route Priority Enabled', 'Police Alert Sent', 'Live Tracking On'].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle size={15} /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => setPhase('init')} className="py-3 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95">Deactivate</button>
            <button onClick={() => navigate('/')} className="bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-3 rounded-2xl transition-all active:scale-95 text-sm shadow-sm shadow-[#C8102E]/15">Done</button>
          </div>
        </div>
      )}

      <div className="pb-28" />

      {/* ── AI Chat FAB ──────────────────────────────────────────────── */}
      <button
        onClick={() => setChatOpen(v => !v)}
        className="fixed z-50 flex items-center justify-center w-12 h-12 text-white transition-all bg-blue-600 rounded-full shadow-lg bottom-6 right-4 hover:bg-blue-700 shadow-blue-500/25 hover:scale-110 active:scale-90"
      >
        <MessageSquare size={20} />
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[60vh]">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Siren size={14} className="text-[#C8102E]" /> LifeLine+ AI
            </h3>
            <button onClick={() => setChatOpen(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="flex-1 p-3 space-y-3 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'ml-auto bg-red-50 text-gray-900' : 'bg-gray-100 text-gray-700'} rounded-xl px-3 py-2 max-w-[85%] w-fit`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-gray-100">
            <input
              className="flex-1 py-2 text-sm input-field"
              placeholder="Ask for help..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="shrink-0 bg-[#C8102E] text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#a50d26]">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
