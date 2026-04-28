import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import LoginModal from '../components/LoginModal.jsx'
import { Stethoscope, Star, Phone, Filter, Calendar, ChevronRight, X, CheckCircle } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function Doctors() {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [location, setLocation] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [patientForm, setPatientForm] = useState({ name: '', contact: '', reason: '' })

  useEffect(() => {
    if (!user) { setShowLogin(true); return }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 22.5726, lng: 88.3639 }),
      { enableHighAccuracy: true }
    )
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

  useEffect(() => { if (location) fetchDoctors() }, [location, specialty, fetchDoctors])

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
        setTimeout(() => { setBookingSuccess(false); setSelectedDoctor(null); setSelectedSlot(null) }, 3000)
      }
    } catch (e) {}
    setLoading(false)
  }

  const specialties = ['All', 'Cardiologist', 'Orthopedic', 'General Physician', 'Pediatrician', 'Neurologist', 'Emergency Medicine']

  if (!user) return showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null

  return (
    <div className="pb-24">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Stethoscope size={22} className="text-red-500" /> Doctors
        </h1>
        <p className="text-sm text-gray-500 mt-1">Book appointments with nearby specialists</p>
      </div>

      <div className="px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {specialties.map(s => (
            <button key={s} onClick={() => setSpecialty(s === 'All' ? '' : s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                (s === 'All' && !specialty) || specialty === s ? 'bg-red-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {doctors.map(doc => (
          <div key={doc.id} className="card hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                <Stethoscope size={26} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{doc.name}</h3>
                <p className="text-xs text-red-600 font-medium">{doc.specialty}</p>
                <p className="text-xs text-gray-500 mt-0.5">{doc.hospital} - {doc.experience}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <Star size={12} fill="currentColor" /> {doc.rating}
                  </span>
                  <span className="text-xs text-gray-500">{doc.fee}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${doc.availableToday ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {doc.availableToday ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a href={doc.phone ? `tel:${doc.phone}` : undefined} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                <Phone size={16} /> Call
              </a>
              <button onClick={() => { setSelectedDoctor(doc); fetchSlots(doc.id) }} className="btn-primary flex-[2] flex items-center justify-center gap-2 text-sm py-2.5">
                <Calendar size={16} /> Book
              </button>
            </div>
          </div>
        ))}

        {doctors.length === 0 && !loading && (
          <div className="text-center py-12">
            <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No doctors found. Try adjusting filters.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full sm:w-[420px] sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            {bookingSuccess ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Confirmed!</h2>
                <p className="text-sm text-gray-500 mt-1">See you on time.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">Book: {selectedDoctor.name}</h2>
                  <button onClick={() => setSelectedDoctor(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Select Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(s => (
                      <button key={s.time} onClick={() => s.available && setSelectedSlot(s.time)} disabled={!s.available}
                        className={`py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedSlot === s.time ? 'bg-red-600 text-white shadow-md' : s.available ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 line-through cursor-not-allowed'
                        }`}>
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <input className="input-field" placeholder="Patient Name" value={patientForm.name} onChange={e => setPatientForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="input-field" placeholder="Contact" value={patientForm.contact} onChange={e => setPatientForm(f => ({ ...f, contact: e.target.value }))} />
                  <input className="input-field" placeholder="Reason for visit" value={patientForm.reason} onChange={e => setPatientForm(f => ({ ...f, reason: e.target.value }))} />
                </div>

                <button onClick={bookAppointment} disabled={!selectedSlot || loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  {loading ? 'Booking...' : `Confirm at ${selectedSlot || '...'}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
