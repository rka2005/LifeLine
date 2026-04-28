import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useGeolocation } from '../hooks/useGeolocation.js'
import LoginModal from '../components/LoginModal.jsx'
import {
  Ambulance, Shield, Stethoscope, MapPin, Clock,
  Phone, Mail, Send, CheckCircle, ChevronRight, Zap,
  Navigation, Brain, Heart, ArrowRight, Star, Activity,
  Calendar, Check, Crosshair, RefreshCw
} from 'lucide-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const topDoctors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    hospital: 'Apollo Hospital',
    experience: '14 yrs',
    rating: 4.9,
    fee: '₹800',
    initials: 'PS',
    availableToday: true,
  },
  {
    id: 2,
    name: 'Dr. Arjun Banerjee',
    specialty: 'Emergency Medicine',
    hospital: 'AMRI Hospitals',
    experience: '11 yrs',
    rating: 4.8,
    fee: '₹650',
    initials: 'AB',
    availableToday: true,
  },
  {
    id: 3,
    name: 'Dr. Meera Gupta',
    specialty: 'General Physician',
    hospital: 'Fortis Hospital',
    experience: '9 yrs',
    rating: 4.7,
    fee: '₹500',
    initials: 'MG',
    availableToday: true,
  },
  {
    id: 4,
    name: 'Dr. Rohit Sen',
    specialty: 'Orthopedic',
    hospital: 'SSKM Hospital',
    experience: '16 yrs',
    rating: 4.8,
    fee: '₹900',
    initials: 'RS',
    availableToday: false,
  },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { location: geoLocation, loading: geoLoading, accuracy, accuracyColor, refreshLocation } = useGeolocation()
  const [showLogin, setShowLogin] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleEmergency = () => {
    if (!user) setShowLogin(true)
    else navigate('/emergency')
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setForm({ name: '', email: '', message: '' })
    }, 3000)
  }

  const features = [
    { icon: MapPin, title: 'Smart Discovery', desc: 'Instant GPS-based discovery of hospitals, ambulances, and emergency services near you.', iconColor: 'text-[#C8102E]', bg: 'bg-red-50' },
    { icon: Navigation, title: 'Live Tracking', desc: 'Real-time ambulance tracking with traffic-aware routing and ETA via Socket.io.', iconColor: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Brain, title: 'AI Verification', desc: 'Gemini AI validates civilian emergency requests instantly — vehicle, purpose, contact.', iconColor: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Stethoscope, title: 'Doctor Booking', desc: 'Discover nearby doctors, filter by specialty, check available slots and confirm.', iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Shield, title: 'Police Coordination', desc: 'Auto-detect police stations along route and broadcast live alerts instantly.', iconColor: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Zap, title: 'Instant Response', desc: 'A 5-minute acceptance window with automatic fallback — you are never alone.', iconColor: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const steps = [
    { num: '01', title: 'Request Help', desc: 'Tap "Book Emergency", allow location, and we instantly find the nearest available ambulance.', icon: Ambulance },
    { num: '02', title: 'Live Tracking', desc: 'Watch your ambulance move on the map with real-time ETA and alternate route suggestions.', icon: Activity },
    { num: '03', title: 'Help Arrives', desc: 'Police alerted along route. Nearest hospital pre-selected. Every second is optimized.', icon: Heart },
  ]

  const helplines = [
    { label: 'Ambulance', number: '108', iconBg: 'bg-[#C8102E]', cardBg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Emergency', number: '112', iconBg: 'bg-orange-500', cardBg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Police', number: '100', iconBg: 'bg-blue-600', cardBg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Fire', number: '101', iconBg: 'bg-amber-500', cardBg: 'bg-amber-50', border: 'border-amber-100' },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white px-4 sm:px-8 lg:px-16 pt-14">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,16,46,0.05)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(200,16,46,0.03)_0%,_transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-0">

          {/* Left — text */}
          <div className="order-2 lg:order-1 flex flex-col items-start">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-10 mt-4">
              <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />
              <span className="text-xs font-semibold text-[#C8102E]">
                India Emergency Response Network
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold text-gray-900 leading-[1.05] mb-5">
              <span className="block text-5xl sm:text-6xl lg:text-7xl">When Every</span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl text-[#C8102E]">Second Counts.</span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-500 text-lg sm:text-xl max-w-lg mb-8 leading-relaxed">
              Ambulance tracking, hospital discovery, police coordination, and AI verification — one tap away.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
              <button
                onClick={handleEmergency}
                id="hero-emergency-btn"
                className="flex items-center justify-center gap-2.5 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#C8102E]/20 transition-all duration-200 active:scale-95 text-base"
              >
                <Ambulance size={20} />
                Book Emergency
                <ArrowRight size={16} className="opacity-80" />
              </button>
              <button
                onClick={() => navigate('/doctors')}
                id="hero-doctors-btn"
                className="flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 active:scale-95 text-base"
              >
                <Stethoscope size={18} />
                Find Doctors
              </button>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 w-full">
              {[
                { value: '< 5 min', label: 'Response Time' },
                { value: '500+', label: 'Ambulances' },
                { value: '24/7', label: 'Available' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-xl font-extrabold text-gray-900">{s.value}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Location indicator with accuracy */}
            <div className="flex items-center gap-2 mt-4 bg-gray-50 rounded-lg px-3 py-2 w-full">
              <Crosshair size={14} className={`${geoLoading ? 'animate-spin' : ''} ${accuracyColor}`} />
              <span className="text-xs text-gray-500 flex-1 truncate">
                {geoLoading ? 'Getting accurate location...' : geoLocation ? `${geoLocation.lat.toFixed(6)}, ${geoLocation.lng.toFixed(6)}` : 'Detecting location...'}
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

          {/* Right — Hero Lottie */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-xl">
              <DotLottieReact
                src="https://lottie.host/93fb06f3-844c-4188-9ebf-b76b9109f6b9/OEIzvHCqFr.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 pointer-events-none">
          <div className="w-5 h-8 rounded-full border-2 border-gray-400 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-gray-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-3">FEATURES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Everything you need in a crisis</h2>
            <p className="text-gray-500 max-w-md text-base">
              LifeLine+ combines real-time data, AI, and live coordination so you always get the fastest possible help.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={21} className={f.iconColor} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-3">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Help in 3 simple steps</h2>
            <p className="text-gray-500 max-w-md text-base">
              From tap to arrival — we handle everything so you can focus on what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-px border-t border-dashed border-gray-200" />
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center">
                      <div className="w-14 h-14 bg-[#C8102E] rounded-xl flex items-center justify-center shadow-lg shadow-[#C8102E]/20">
                        <Icon size={26} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-black text-[#C8102E]">{step.num}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="md:hidden mt-6 text-gray-200">
                      <ChevronRight size={20} className="rotate-90 mx-auto" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={handleEmergency}
              id="how-it-works-cta"
              className="inline-flex items-center gap-2.5 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#C8102E]/20 transition-all duration-200 active:scale-95 text-base"
            >
              <Ambulance size={18} />
              Try It Now
              <ArrowRight size={16} />
            </button>
            <p className="text-xs text-gray-400 mt-3">Works best with location access enabled</p>
          </div>
        </div>
      </section>

      {/* ─── TOP DOCTOR RECOMMENDATIONS ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-3">TOP DOCTORS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Trusted specialists, nearby</h2>
            <p className="text-gray-500 max-w-md text-base">
              Book an appointment with a verified specialist in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group"
              >
                {/* Avatar */}
                <div className="p-5 flex flex-col items-center border-b border-gray-50">
                  <div className="w-16 h-16 rounded-2xl bg-[#C8102E] flex items-center justify-center text-2xl font-black text-white shadow-md shadow-[#C8102E]/20 mb-3 group-hover:scale-110 transition-transform duration-300">
                    {doc.initials}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${doc.availableToday ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {doc.availableToday ? '● Available Today' : '○ Unavailable'}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{doc.name}</h3>
                  <p className="text-xs text-[#C8102E] font-semibold mt-0.5">{doc.specialty}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{doc.hospital} · {doc.experience}</p>

                  <div className="flex items-center justify-between mt-3 mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="#f59e0b" className="text-amber-400" />
                      <span className="text-xs font-bold text-gray-700">{doc.rating}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{doc.fee}</span>
                  </div>

                  <button
                    onClick={() => navigate('/doctors')}
                    className="w-full bg-[#C8102E] hover:bg-[#a50d26] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-[#C8102E]/15"
                  >
                    <Calendar size={13} />
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/doctors')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8102E] hover:gap-3 transition-all"
            >
              View all doctors
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── EMERGENCY HELPLINES ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 bg-[#C8102E] rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-[#C8102E]/20">
              <Phone size={22} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">India Emergency Helplines</h2>
            <p className="text-xs text-gray-400">Tap to call — always free, always available</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {helplines.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className={`${h.cardBg} ${h.border} border rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group`}
              >
                <div className={`w-10 h-10 ${h.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Phone size={17} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900">{h.number}</p>
                  <p className="text-[10px] text-gray-500">{h.label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-3">THE TEAM</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Built with purpose</h2>
            <p className="text-gray-500 max-w-md text-base">
              We are the <strong>LifeLine+</strong> team — built for rapid emergency response across India.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Babin Bid', role: 'Team Lead & Architecture', initials: 'BB' },
              { name: 'Atanu Saha', role: 'Frontend Developer', initials: 'AS' },
              { name: 'Rohit Kumar Adak', role: 'Idea & Backend Dev', initials: 'RK' },
              { name: 'Sagnik Bachhar', role: 'Research & Developer', initials: 'SB' },
            ].map((m) => (
              <div key={m.name} className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#C8102E]/20 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <div className="w-14 h-14 rounded-2xl bg-[#C8102E] flex items-center justify-center text-white font-black text-lg mb-3 shadow-md shadow-[#C8102E]/15 group-hover:scale-110 transition-transform">
                  {m.initials}
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{m.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT US ───────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-3">CONTACT US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">We are here 24/7</h2>
            <p className="text-gray-500 max-w-md text-base">
              For emergencies, feedback, partnerships, or technical support — reach us anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-base mb-5">Get in touch</h3>
              {[
                { icon: Phone, label: 'Emergency Helpline', value: '108 / 112 — Toll Free', href: 'tel:108', bg: 'bg-red-50', color: 'text-[#C8102E]' },
                { icon: Mail, label: 'Email Support', value: 'support@lifelineplus.in', href: 'mailto:support@lifelineplus.in', bg: 'bg-blue-50', color: 'text-blue-600' },
                { icon: MapPin, label: 'Headquarters', value: 'Kolkata, West Bengal, India', href: null, bg: 'bg-gray-50', color: 'text-gray-600' },
              ].map((c) => {
                const Icon = c.icon
                const inner = (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={17} className={c.color} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">{c.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{c.value}</p>
                    </div>
                  </div>
                )
                return c.href ? <a key={c.label} href={c.href}>{inner}</a> : <div key={c.label}>{inner}</div>
              })}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-base mb-5">Send a message</h3>
              {sent ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Message Sent!</h4>
                  <p className="text-xs text-gray-400">We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                  <input id="contact-name" className="input-field" placeholder="Your Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
                  <input id="contact-email" className="input-field" type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
                  <textarea id="contact-message" className="input-field min-h-[100px] resize-none" placeholder="Your message..." value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required />
                  <button type="submit" id="contact-submit" className="w-full bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-[#C8102E]/15">
                    <Send size={16} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="pb-8" />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
