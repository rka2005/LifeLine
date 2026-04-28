import { useState, useRef, useEffect } from 'react'
import { ChevronDown, HelpCircle, MessageCircle, Zap, Ambulance, Shield, CreditCard, MapPin, Wifi, Smartphone, Globe, Plus, Stethoscope, Siren, Clock, Award } from 'lucide-react'

const faqs = [
  { icon: Zap, q: 'What is LifeLine+?', a: 'LifeLine+ is a real-time emergency response platform for India. It connects users with ambulances, hospitals, doctors, and police using live GPS tracking, AI-powered routing, and instant communication — all in one app.' },
  { icon: Clock, q: 'How fast can an ambulance reach me?', a: 'Average response time is under 5 minutes in urban areas. The app calculates live ETA based on real-time traffic data from Google Maps and distance from your location. You see the exact arrival time before booking.' },
  { icon: Shield, q: 'What if no ambulance is available nearby?', a: 'If no ambulance is within range, the app offers Civilian Mode. Gemini AI verifies your emergency request using your vehicle number, purpose, and contact. If approved, your personal vehicle gets temporary emergency status for 6 hours with police alerts along your route.' },
  { icon: CreditCard, q: 'Is the LifeLine+ service free?', a: 'Emergency discovery, route planning, and AI chat assistance are completely free. Ambulance bookings and doctor appointments may involve charges set by the individual provider. We never charge for basic emergency coordination.' },
  { icon: Siren, q: 'How does Civilian Mode work step-by-step?', a: '1) Tap "No ambulance nearby? Use Civilian Mode" 2) Enter your vehicle registration number, emergency purpose, and contact 3) Gemini AI evaluates in ~3 seconds 4) If approved, a temporary emergency vehicle ID is issued 5) Police stations along your route are auto-alerted 6) Your live GPS broadcasts every 5 seconds for safety tracking.' },
  { icon: Shield, q: 'Are my location and personal data secure?', a: 'Absolutely. We use TLS 1.3 encryption for all API calls, location data is purged 24 hours after emergency resolution, and we comply with India\'s Digital Personal Data Protection Act, 2023. Location is only shared during active emergencies with authorized responders.' },
  { icon: Stethoscope, q: 'Can I book a doctor appointment through the app?', a: 'Yes. Use the Doctors tab to search nearby doctors and clinics by specialty (Cardiology, Emergency, Pediatrics, Orthopedics). View real-time availability, select a time slot, and confirm your booking. You also get the doctor\'s phone number for direct contact.' },
  { icon: Wifi, q: 'Does LifeLine+ work without internet?', a: 'The Progressive Web App (PWA) caches key assets and emergency contact numbers. Cached map tiles and saved hospital data work offline. However, live ambulance tracking, AI chat, and real-time route updates require an internet connection.' },
  { icon: Ambulance, q: 'How does the ambulance demo animation work?', a: 'When you book an ambulance, the map shows a live demo of the ambulance driving from its current location to your pickup spot. A colored path appears between the two points, and the ambulance marker smoothly animates along the route with a real-time countdown timer showing arrival time.' },
  { icon: MapPin, q: 'What is the 3D ambulance marker on the map?', a: 'Unlike flat pins, LifeLine+ uses a custom 3D-style ambulance SVG marker with depth, shadows, and a subtle floating animation. This makes it easy to spot the ambulance on the map at a glance — inspired by Uber, Rapido, and Flipkart Minutes live tracking.' },
  { icon: Globe, q: 'Can I use LifeLine+ in any city in India?', a: 'Yes. LifeLine+ works anywhere Google Maps covers in India. The backend discovers real hospitals, police stations, doctors, and pharmacies through the Google Places API. Urban areas have the highest accuracy due to denser map data.' },
  { icon: Smartphone, q: 'How do I add LifeLine+ to my phone home screen?', a: 'On Android Chrome: Tap the menu (3 dots) → "Add to Home screen". On iOS Safari: Tap the Share button → "Add to Home Screen". This installs the PWA for faster access, offline fallback, and a native app-like experience.' },
]

function AccordionItem({ item, index, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [])

  const IconComponent = item.icon || HelpCircle

  return (
    <div className={`card overflow-hidden transition-all duration-300 group ${isOpen ? 'shadow-lg ring-1 ring-red-100 dark:ring-red-900/30' : 'hover:shadow-md hover:-translate-y-0.5'}`}>
      <button
        onClick={() => onToggle(isOpen ? null : index)}
        className="w-full flex items-center justify-between text-left py-1 px-1"
      >
        <div className="flex items-center gap-3 pr-4">
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500'}`}>
            <IconComponent size={18} className={isOpen ? 'animate-pulse' : ''} />
          </div>
          <span className={`text-sm font-semibold pr-4 leading-snug transition-colors duration-200 ${isOpen ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400'}`}>
            {item.q}
          </span>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rotate-180' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500'}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{ maxHeight: isOpen ? height : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div ref={contentRef} className="pt-3 pb-1 pl-14">
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAQs() {
  const [open, setOpen] = useState(null)

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle size={24} className="animate-pulse" /> Frequently Asked Questions
        </h1>
        <p className="text-red-100 text-sm mt-1">Everything you need to know about LifeLine+</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* Quick support banner with enhanced hover */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3 mb-2 hover:shadow-md transition-all duration-300 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Still have questions?</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Reach out via the Contact page or email{' '}
              <a 
                href="mailto:support@lifelineplus.in" 
                className="text-blue-600 dark:text-blue-400 font-medium underline hover:text-blue-700 transition-colors inline-flex items-center gap-1"
              >
                support@lifelineplus.in
              </a>
            </p>
          </div>
          <Award size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {faqs.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            index={i}
            isOpen={open === i}
            onToggle={setOpen}
          />
        ))}
      </div>
    </div>
  )
}
