import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import LoginModal from '../components/LoginModal.jsx'
import { Stethoscope, Star, Phone, Calendar, X, CheckCircle, MapPin, Clock, Search, Loader2, Crosshair, RefreshCw } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const specialties = ['All', 'Cardiologist', 'Orthopedic', 'General Physician', 'Pediatrician', 'Neurologist', 'Emergency Medicine']

const SPECIALTY_COLORS = {
  'Cardiologist': { bg: 'bg-red-50', text: 'text-[#C8102E]', dot: 'bg-[#C8102E]' },
  'Orthopedic': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-600' },
  'General Physician': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600' },
  'Pediatrician': { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-600' },
  'Neurologist': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600' },
  'Emergency Medicine': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-600' },
}

const AVATAR_COLORS = [
  'bg-[#C8102E]', 'bg-blue-600', 'bg-emerald-600',
  'bg-violet-600', 'bg-amber-600', 'bg-rose-700',
]

export default function Doctors() {
  const { user } = useAuth()
  const { location: geoLocation, loading: geoLoading, error: geoError, accuracy, accuracyColor, refreshLocation } = useGeolocation()
  const [showLogin, setShowLogin] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [patientForm, setPatientForm] = useState({ name: '', contact: '', reason: '' })
  const [searchQuery, setSearchQuery] = useState('')

  // Stable location ref - only changes on significant updates or manual refresh
  const stableLocationRef = useRef(null)
  const hasFetchedRef = useRef(false)

  // Lock location once we have a good fix
  useEffect(() => {
    if (geoLocation && !stableLocationRef.current) {
      stableLocationRef.current = geoLocation
    }
  }, [geoLocation])

  // Use stable location for API calls
  const location = stableLocationRef.current

  useEffect(() => {
    if (!user) { setShowLogin(true); return }
  }, [user])

  const fetchDoctors = useCallback(async () => {
    if (!location) return
    setLoading(true)
    try {
      const url = `${BACKEND_URL}/api/booking/doctors?lat=${location.lat}&lng=${location.lng}${specialty ? `&specialty=${encodeURIComponent(specialty)}` : ''}&available=true`
      const res = await fetch(url)
      const data = await res.json()
      setDoctors(data.doctors || [])
    } catch (e) {}
    setLoading(false)
  }, [location, specialty])

  // Only fetch once when location is first locked or specialty changes
  useEffect(() => {
    if (location && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchDoctors()
    }
  }, [location, fetchDoctors])

  // Refetch when specialty changes (but not when location updates)
  useEffect(() => {
    if (location && hasFetchedRef.current) {
      fetchDoctors()
    }
  }, [specialty, fetchDoctors])

  const fetchSlots = async (doctorId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/booking/slots/${doctorId}?date=${new Date().toISOString().split('T')[0]}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (e) {}
  }

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/booking/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          slot: selectedSlot,
          date: new Date().toISOString().split('T')[0],
          patientName: patientForm.name || user.name,
          contact: patientForm.contact || user.phone || '',
          reason: patientForm.reason
        })
      })
      const data = await res.json()
      if (data.status === 'confirmed') {
        setBookingSuccess(true)
        setTimeout(() => {
          setBookingSuccess(false); setSelectedDoctor(null); setSelectedSlot(null)
          setPatientForm({ name: '', contact: '', reason: '' })
        }, 3000)
      }
    } catch (e) {}
    setLoading(false)
  }

  const filteredDoctors = doctors.filter(d =>
    !searchQuery ||
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null

  return (
    <div className="bg-gray-50 min-h-screen pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 pt-8 pb-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-medium text-[#C8102E] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SPECIALISTS</p>
              <h1 className="text-2xl font-extrabold text-gray-900">Find a Doctor</h1>
              <p className="text-sm text-gray-400 mt-0.5">Book appointments with verified specialists near you</p>
            </div>
            <Stethoscope size={28} className="text-gray-200 mb-1" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E]/40 transition-all"
            />
          </div>

          {/* Location indicator with accuracy */}
          <div className="flex items-center gap-2 mt-3 bg-gray-50 rounded-lg px-3 py-2">
            <Crosshair size={14} className={`${geoLoading ? 'animate-spin' : ''} ${accuracyColor}`} />
            <span className="text-xs text-gray-500 flex-1">
              {geoLoading ? 'Getting accurate location...' : location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Detecting location...'}
            </span>
            {!geoLoading && accuracy && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white ${accuracyColor}`}>
                ±{Math.round(accuracy)}m
              </span>
            )}
            <button 
              onClick={refreshLocation}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Refresh location"
            >
              <RefreshCw size={12} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Specialty filter pills */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 sticky top-14 z-10">
        <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {specialties.map(s => {
            const active = (s === 'All' && !specialty) || specialty === s
            return (
              <button
                key={s}
                onClick={() => setSpecialty(s === 'All' ? '' : s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  active
                    ? 'bg-[#C8102E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="px-4 sm:px-8 pt-5 max-w-4xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-[#C8102E]" />
            <p className="text-sm text-gray-400">Finding specialists near you...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDoctors.map((doc, idx) => {
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              const specStyle = SPECIALTY_COLORS[doc.specialty] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
              const initials = doc.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DR'

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-xl ${avatarColor} flex items-center justify-center text-white font-black text-xl shrink-0 shadow-sm`}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{doc.name}</h3>
                          <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md ${specStyle.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${specStyle.dot}`} />
                            <span className={`text-[10px] font-semibold ${specStyle.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{doc.specialty}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md ${doc.availableToday ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                          {doc.availableToday ? '● Today' : '○ Busy'}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1.5">{doc.hospital}</p>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-0.5">
                          <Star size={10} fill="#f59e0b" className="text-amber-400" />
                          <span className="text-xs font-bold text-gray-700 ml-0.5">{doc.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={9} />
                          {doc.experience}
                        </div>
                        {doc.distance && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <MapPin size={9} />
                            {typeof doc.distance === 'number' ? `${doc.distance.toFixed(1)}km` : doc.distance}
                          </div>
                        )}
                        <span className="text-xs font-extrabold text-gray-900 ml-auto">{doc.fee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    {doc.phone && (
                      <a
                        href={`tel:${doc.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg text-xs transition-all hover:bg-gray-100 active:scale-95"
                      >
                        <Phone size={13} /> Call
                      </a>
                    )}
                    <button
                      onClick={() => { setSelectedDoctor(doc); fetchSlots(doc.id) }}
                      className="flex-[2] flex items-center justify-center gap-1.5 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-2.5 rounded-lg text-xs transition-all active:scale-95 shadow-sm"
                    >
                      <Calendar size={13} /> Book Appointment
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredDoctors.length === 0 && !loading && (
              <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Stethoscope size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm font-medium">No doctors found</p>
                <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full sm:w-[420px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[88vh] overflow-y-auto border border-gray-100">
            {bookingSuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="font-extrabold text-xl text-gray-900 mb-1">Confirmed!</h2>
                <p className="text-sm text-gray-400">Appointment booked successfully.</p>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-extrabold text-gray-900">Book Appointment</h2>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedDoctor.name} · {selectedDoctor.specialty}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedDoctor(null); setSelectedSlot(null) }}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <X size={15} className="text-gray-600" />
                  </button>
                </div>

                {/* Slot picker */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Available Slots</p>
                  {slots.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-300">Loading slots...</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map(s => (
                        <button
                          key={s.time}
                          onClick={() => s.available && setSelectedSlot(s.time)}
                          disabled={!s.available}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                            selectedSlot === s.time
                              ? 'bg-[#C8102E] text-white shadow-sm'
                              : s.available
                              ? 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#C8102E]/30'
                              : 'bg-gray-50 text-gray-200 line-through cursor-not-allowed'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient details */}
                <div className="space-y-3 mb-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Patient Details</p>
                  <input className="input-field text-sm" placeholder="Patient Name" value={patientForm.name} onChange={e => setPatientForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="input-field text-sm" placeholder="Contact Number" value={patientForm.contact} onChange={e => setPatientForm(f => ({ ...f, contact: e.target.value }))} />
                  <input className="input-field text-sm" placeholder="Reason for visit" value={patientForm.reason} onChange={e => setPatientForm(f => ({ ...f, reason: e.target.value }))} />
                </div>

                <button
                  onClick={bookAppointment}
                  disabled={!selectedSlot || loading}
                  className="w-full bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  {loading ? 'Booking...' : selectedSlot ? `Confirm at ${selectedSlot}` : 'Select a slot'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
