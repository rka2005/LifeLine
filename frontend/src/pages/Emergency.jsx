import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import MapView from '../components/MapView.jsx'
import LoginModal from '../components/LoginModal.jsx'
import { useSocket } from '../hooks/useSocket.js'
import {
  Ambulance, Phone, MapPin, Clock, Navigation, AlertTriangle, ChevronRight,
  Shield, Car, X, CheckCircle, Siren, Route, User, Activity, MessageSquare,
  Timer
} from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function Emergency() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [location, setLocation] = useState(null)
  const [destination, setDestination] = useState(null)
  const [routes, setRoutes] = useState([])
  const [activeRoute, setActiveRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('init')
  const [ambulances, setAmbulances] = useState([])
  const [requestStatus, setRequestStatus] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [civilianForm, setCivilianForm] = useState({ vehicleNumber: '', purpose: '', contact: '' })
  const [civilianResult, setCivilianResult] = useState(null)
  const [dark, setDark] = useState(false)
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
  const autoRouteAttemptedRef = useRef(false)
  const demoIntervalRef = useRef(null)
  const { emit, on } = useSocket(user?.id)

  useEffect(() => {
    if (!user) { setShowLogin(true); return }
    const saved = localStorage.getItem('lifeline_dark') === 'true'
    setDark(saved)
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 22.5726, lng: 88.3639 }),
      { enableHighAccuracy: true }
    )
  }, [user])

  useEffect(() => {
    if (!on) return
    const off1 = on('ambulance_assigned', data => {
      setRequestStatus({ ...data, status: 'accepted' })
      setTracking(data.ambulance)
      setPhase('tracking')
    })
    const off2 = on('ambulance_not_found', data => {
      setRequestStatus({ ...data, status: 'no_ambulance' })
      setPhase('civilian_prompt')
    })
    const off3 = on('location_update', data => {
      setTracking(prev => prev ? { ...prev, location: data.location } : null)
    })
    const off4 = on('ambulance_arrived', data => {
      setRequestStatus(prev => prev ? { ...prev, status: 'arrived', ...data } : prev)
    })
    return () => { off1(); off2(); off3(); off4() }
  }, [on])

  const fetchAmbulances = useCallback(async () => {
    if (!location) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/ambulance-request/nearby?lat=${location.lat}&lng=${location.lng}`)
      const data = await res.json()
      setAmbulances(data.ambulances || [])
      setPhase('ambulance_list')
    } catch (e) { setAmbulances([]) }
    setLoading(false)
  }, [location])

  const fetchRoutes = useCallback(async () => {
    if (!location || !destination) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/routes/emergency?originLat=${location.lat}&originLng=${location.lng}&destLat=${destination.lat}&destLng=${destination.lng}`)
      const data = await res.json()
      setRoutes(data.routes || [])
      setActiveRoute(data.fastestRoute)
    } catch (e) {}
    setLoading(false)
  }, [location, destination])

  const autoSelectNearestHospital = useCallback(async () => {
    if (!location) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lng: String(location.lng),
        type: 'hospital',
        radius: '7000',
        openNow: 'true'
      })
      const res = await fetch(`${BACKEND_URL}/api/nearest-services?${params.toString()}`)
      const data = await res.json()
      const nearest = data.results?.find(item => item.location)
      if (nearest?.location) {
        setDestination(nearest.location)
        setPhase('route_calc')
      }
    } catch (e) {
      setPhase('init')
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    if (!location || destination || phase !== 'init' || autoRouteAttemptedRef.current) return
    autoRouteAttemptedRef.current = true
    autoSelectNearestHospital()
  }, [location, destination, phase, autoSelectNearestHospital])

  const bookAmbulance = async (ambulance) => {
    setLoading(true)
    setSelectedAmbulance(ambulance)
    try {
      const res = await fetch(`${BACKEND_URL}/api/ambulance-request/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pickupLat: location.lat,
          pickupLng: location.lng,
          destinationLat: destination?.lat,
          destinationLng: destination?.lng,
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
      
      // Start demo animation
      if (ambulance?.location && location) {
        startDemoAnimation(ambulance.location, location)
      }
    } catch (e) { setPhase('error') }
    setLoading(false)
  }

  const startDemoAnimation = (ambulanceLoc, userLoc) => {
    // Clear any existing demo
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    
    // Generate path points (simple interpolation with some curve)
    const steps = 60 // 60 seconds for demo
    const path = []
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps
      // Linear interpolation with slight curve
      const lat = ambulanceLoc.lat + (userLoc.lat - ambulanceLoc.lat) * ratio
      const lng = ambulanceLoc.lng + (userLoc.lng - ambulanceLoc.lng) * ratio
      path.push({ lat, lng })
    }
    
    setDemoPath(path)
    setDemoMode(true)
    setDemoAmbulancePos(ambulanceLoc)
    setDemoProgress(0)
    setDemoCountdown(60)
    
    // Animation loop
    let step = 0
    demoIntervalRef.current = setInterval(() => {
      step++
      if (step > steps) {
        clearInterval(demoIntervalRef.current)
        setDemoMode(false)
        setShowArrivalNotification(true)
        // Set user avatar at current location
        if (location) {
          setUserAvatar({
            position: location,
            name: user?.name || 'You',
            image: user?.photoURL || null
          })
        }
        // Auto-hide notification after 10 seconds
        setTimeout(() => setShowArrivalNotification(false), 10000)
        return
      }
      
      setDemoProgress(step / steps)
      setDemoAmbulancePos(path[step])
      setDemoCountdown(60 - step)
    }, 1000) // Update every second for 1 minute total
  }

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    }
  }, [])

  const verifyCivilian = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify/civilian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: civilianForm.vehicleNumber,
          purpose: civilianForm.purpose,
          contact: civilianForm.contact,
          location,
          destination
        })
      })
      const data = await res.json()
      setCivilianResult(data)
      if (data.verified) {
        setPhase('civilian_active')
        await fetch(`${BACKEND_URL}/api/police/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: data.tempVehicleId,
            vehicleType: 'civilian_emergency',
            route: activeRoute?.steps || [],
            eta: activeRoute?.duration,
            location,
            requestType: 'civilian_emergency',
            contact: civilianForm.contact
          })
        })
      }
    } catch (e) { setCivilianResult({ verified: false, message: 'Verification failed' }) }
    setLoading(false)
  }

  const setDestFromMap = (loc) => {
    setDestination(loc)
    setPhase('route_calc')
  }

  useEffect(() => { if (phase === 'route_calc' && location && destination) fetchRoutes() }, [phase, location, destination, fetchRoutes])

  useEffect(() => {
    if (phase !== 'civilian_active' || !civilianResult?.tempVehicleId) return
    emit('join_civilian', civilianResult.tempVehicleId)

    const publishLocation = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(pos => {
        emit('track_civilian', {
          vehicleId: civilianResult.tempVehicleId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          route: activeRoute?.steps || []
        })
      })
    }

    publishLocation()
    const intervalId = window.setInterval(publishLocation, 5000)
    return () => window.clearInterval(intervalId)
  }, [phase, civilianResult?.tempVehicleId, activeRoute, emit])

  const markers = []
  if (location) markers.push({ position: location, title: 'Pickup', color: '#3b82f6', bounce: true })
  if (destination) markers.push({ position: destination, title: 'Destination', color: '#ef4444', bounce: true })
  if (tracking?.location) markers.push({ position: tracking.location, title: 'Ambulance', color: '#16a34a' })

  const routePoly = activeRoute ? [activeRoute] : routes

  const sendMessage = async () => {
    if (!inputMsg.trim()) return
    const userMsg = inputMsg.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInputMsg('')

    try {
      const res = await fetch(`${BACKEND_URL}/api/verify/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: { phase, location, destination, route: activeRoute?.summary }
        })
      })
      const data = await res.json()
      const text = data?.text || 'Stay calm. Help is on the way.'
      setMessages(prev => [...prev, { role: 'ai', text }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'I apologize, but I am unable to connect right now. Please stay on the line and wait for emergency services.' }])
    }
  }

  if (!user) return showLogin ? <LoginModal onClose={() => navigate('/')} /> : null

  return (
    <div className="pb-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronRight size={24} className="rotate-180" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <Siren size={20} /> Emergency Mode
          </h1>
          <p className="text-red-100 text-xs">{phase === 'tracking' ? 'Live Tracking Active' : phase === 'civilian_active' ? 'Civilian Mode Active' : 'Request Emergency Assistance'}</p>
        </div>
      </div>

      {/* Map */}
      <div className="px-4 mt-4">
        <div className="card overflow-hidden p-0 rounded-2xl shadow-md">
          <MapView
            center={location || { lat: 22.5726, lng: 88.3639 }}
            markers={markers}
            routes={routePoly}
            activeRoute={activeRoute}
            userLocation={location}
            height="280px"
            darkMode={dark}
            traffic={true}
            show3D={show3D}
            onToggle3D={() => setShow3D(!show3D)}
            onMapClick={phase === 'init' || phase === 'ambulance_list' ? setDestFromMap : undefined}
            zoom={14}
            demoMode={demoMode}
            demoPath={demoPath}
            demoAmbulancePos={demoAmbulancePos}
            demoProgress={demoProgress}
            userAvatar={userAvatar}
          />
        </div>
        {phase === 'init' && !destination && (
          <p className="text-xs text-center text-gray-500 mt-2">Tap on the map to select destination hospital</p>
        )}
        {destination && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 shadow-sm">
            <MapPin size={14} className="text-red-500" />
            Destination: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            <button onClick={() => { setDestination(null); setRoutes([]); setActiveRoute(null); setPhase('init') }} className="ml-auto text-red-500 hover:underline">Clear</button>
          </div>
        )}
      </div>

      {/* Phase: Init */}
      {phase === 'init' && (
        <div className="px-4 mt-4 space-y-3">
          <button onClick={fetchAmbulances} disabled={!location} className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4">
            <Ambulance size={24} />
            {loading ? 'Finding ambulances...' : 'Find Nearby Ambulances'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={autoSelectNearestHospital} className="btn-secondary flex items-center justify-center gap-2">
              <Route size={18} /> Nearest Hospital
            </button>
            <button onClick={() => setPhase('civilian_direct')} className="btn-secondary flex items-center justify-center gap-2">
              <Car size={18} /> Civilian Mode
            </button>
          </div>
        </div>
      )}

      {/* Phase: Ambulance List */}
      {phase === 'ambulance_list' && (
        <div className="px-4 mt-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Ambulance size={18} className="text-red-500" /> Nearby Ambulances
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
            {ambulances.map(amb => (
              <div key={amb.id} className="card flex gap-3 items-center">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <Ambulance size={22} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{amb.type} Ambulance</p>
                  <p className="text-xs text-gray-500">{amb.vehicleNumber} • Driver {amb.driver.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs flex items-center gap-1 text-green-600 font-medium"><Clock size={12} /> {amb.eta}m ETA</span>
                    <span className="text-xs text-gray-500">{amb.distance} km</span>
                  </div>
                </div>
                <button onClick={() => bookAmbulance(amb)} className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all active:scale-95">
                  Book
                </button>
              </div>
            ))}
          </div>
          {ambulances.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No ambulances available</p>
              <button onClick={() => setPhase('civilian_direct')} className="mt-3 text-red-600 text-sm font-medium">Try Civilian Mode</button>
            </div>
          )}
        </div>
      )}

      {/* Phase: Route Selection */}
      {phase === 'route_calc' && routes.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Route size={18} className="text-blue-500" /> Emergency Routes
          </h2>
          <div className="space-y-2">
            {routes.map(route => (
              <button
                key={route.id}
                onClick={() => setActiveRoute(route)}
                className={`w-full card text-left flex items-center gap-3 transition-all ${activeRoute?.id === route.id ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${route.fastest ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                  <Navigation size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{route.distance} • {route.duration}</p>
                  <p className="text-xs text-gray-500">{route.trafficStatus === 'heavy' ? 'Heavy traffic' : route.trafficStatus === 'moderate' ? 'Moderate traffic' : 'Clear route'}</p>
                </div>
                {route.fastest && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">Fastest</span>}
              </button>
            ))}
          </div>
          <button onClick={fetchAmbulances} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            <Ambulance size={20} /> Book Ambulance on This Route
          </button>
        </div>
      )}

      {phase === 'route_calc' && routes.length === 0 && loading && (
        <div className="px-4 mt-6 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Calculating live traffic-aware routes...</p>
        </div>
      )}

      {/* Phase: Searching */}
      {phase === 'searching' && (
        <div className="px-4 mt-6 space-y-4">
          <div className="text-center">
            {!demoMode && <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />}
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {demoMode ? 'Ambulance En Route' : 'Finding Driver...'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Request ID: {requestStatus?.requestId}</p>
            {!demoMode && <p className="text-gray-400 text-xs mt-2">Drivers have 5 minutes to accept</p>}
          </div>
          
          {/* Demo Animation Banner */}
          {demoMode && (
            <div className="card bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Timer size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Ambulance arriving in {Math.floor(demoCountdown / 60)}:{String(demoCountdown % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    Watch the 3D ambulance on the map driving to your location!
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(demoCountdown / 60) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{Math.round(demoProgress * 100)}% complete</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arrival Notification */}
      {showArrivalNotification && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-bounce">
          <div className="bg-green-500 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0">
              <Ambulance size={28} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Ambulance Arrived! 🎉</h3>
              <p className="text-green-100 text-sm">Your ambulance has reached your location</p>
            </div>
            <button 
              onClick={() => setShowArrivalNotification(false)}
              className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Phase: Tracking */}
      {phase === 'tracking' && requestStatus?.status === 'accepted' && (
        <div className="px-4 mt-4">
          <div className="card bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Ambulance Assigned!</h2>
                <p className="text-xs text-green-700 dark:text-green-400">ETA: {requestStatus.eta} minutes</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <User size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{requestStatus.ambulance?.driver?.name}</p>
                  <p className="text-xs text-gray-500">{requestStatus.ambulance?.vehicleNumber}</p>
                </div>
                <a href={`tel:${requestStatus.ambulance?.driver?.phone}`} className="ml-auto w-9 h-9 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                  <Phone size={16} />
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Activity size={14} className="text-green-500 animate-pulse" />
                Live tracking active
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setPhase('init')} className="btn-secondary">New Request</button>
            <button onClick={() => navigate('/')} className="btn-primary">Done</button>
          </div>
        </div>
      )}

      {/* Phase: No Ambulance / Civilian Prompt */}
      {phase === 'civilian_prompt' && (
        <div className="px-4 mt-4 text-center">
          <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
          <h2 className="font-bold text-gray-900 dark:text-white">No Ambulance Available</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Try Civilian Mode to convert your vehicle into a temporary emergency vehicle.</p>
          <button onClick={() => setPhase('civilian_direct')} className="btn-primary w-full flex items-center justify-center gap-2">
            <Car size={20} /> Activate Civilian Mode
          </button>
          <button onClick={() => setPhase('ambulance_list')} className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline">Back to Ambulance List</button>
        </div>
      )}

      {/* Phase: Civilian Form */}
      {(phase === 'civilian_direct' || (phase === 'civilian_prompt' && !civilianResult)) && (
        <div className="px-4 mt-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield size={18} className="text-amber-500" /> Civilian Emergency Mode
          </h2>
          <div className="card space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Vehicle Number</label>
              <input className="input-field" placeholder="e.g., WB-02-A-1234" value={civilianForm.vehicleNumber} onChange={e => setCivilianForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Emergency Purpose</label>
              <input className="input-field" placeholder="e.g., Taking patient to hospital for heart attack" value={civilianForm.purpose} onChange={e => setCivilianForm(f => ({ ...f, purpose: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Contact Number</label>
              <input className="input-field" placeholder="+91 ..." value={civilianForm.contact} onChange={e => setCivilianForm(f => ({ ...f, contact: e.target.value }))} />
            </div>
            <button onClick={verifyCivilian} disabled={loading || !civilianForm.vehicleNumber || !civilianForm.purpose || !civilianForm.contact} className="btn-primary w-full flex items-center justify-center gap-2">
              <Shield size={18} />
              {loading ? 'Verifying with AI...' : 'Verify & Activate'}
            </button>
          </div>
        </div>
      )}

      {/* Phase: Civilian Active */}
      {phase === 'civilian_active' && civilianResult?.verified && (
        <div className="px-4 mt-4">
          <div className="card bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={24} className="text-amber-600" />
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Civilian Mode Active</h2>
                <p className="text-xs text-amber-700 dark:text-amber-400">Temp Vehicle ID: {civilianResult.tempVehicleId}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={16} /> Route Priority Enabled
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={16} /> Police Alert Sent
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={16} /> Live Tracking On
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setPhase('init')} className="btn-secondary">Deactivate</button>
            <button onClick={() => navigate('/')} className="btn-primary">Done</button>
          </div>
        </div>
      )}

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-24 left-4 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all">
        <MessageSquare size={20} />
      </button>

      {chatOpen && (
        <div className="fixed bottom-40 left-4 right-4 sm:right-auto sm:w-80 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[60vh]">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Siren size={16} className="text-red-500" /> LifeLine+ AI</h3>
            <button onClick={() => setChatOpen(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'ml-auto bg-red-100 dark:bg-red-900/30 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} rounded-xl px-3 py-2 max-w-[85%] w-fit`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input className="input-field text-sm py-2" placeholder="Ask for help..." value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} className="shrink-0 bg-red-600 text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-700"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
