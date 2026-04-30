import { Link, useLocation } from 'react-router-dom'
import { Shield, FileText, BookOpen, HelpCircle, Heart, Phone, Mail, MapPin, ExternalLink, Github } from 'lucide-react'

export default function Footer() {
  const { pathname } = useLocation()
  if (pathname === '/emergency') return null

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100 mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Emergency Helplines */}
        <div className="bg-red-50 rounded-2xl p-5 mb-8 border border-red-100">
          <h3 className="text-sm font-bold text-[#C8102E] flex items-center gap-2 mb-3">
            <Phone size={16} />
            Emergency Helplines (India)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Police', number: '100', color: 'bg-blue-500' },
              { label: 'Ambulance', number: '108', color: 'bg-[#C8102E]' },
              { label: 'Fire', number: '101', color: 'bg-orange-500' },
              { label: 'Women Helpline', number: '1091', color: 'bg-purple-500' },
            ].map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="group flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} group-hover:scale-125 transition-transform`} />
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#C8102E]/25">
                <Heart size={20} className="text-white fill-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-gray-900">LifeLine<span className="text-[#C8102E]">+</span></span>
                <p className="text-[10px] text-gray-400">Every second counts</p>
              </div>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Real-time emergency response platform for India. Connecting you with hospitals, ambulances, and emergency services instantly.
            </p>
            <a
              href="https://github.com/KGFCH2/LifeLine"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#C8102E] hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#C8102E]/25"
            >
              <Github size={18} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/emergency', label: 'Emergency' },
                { to: '/doctors', label: 'Doctors' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-xs text-gray-600 hover:text-[#C8102E] transition-colors duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[#C8102E] group-hover:w-2 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { to: '/privacy', icon: Shield, label: 'Privacy Policy' },
                { to: '/terms', icon: FileText, label: 'Terms of Service' },
                { to: '/faqs', icon: HelpCircle, label: 'FAQs' },
                { to: '/docs', icon: BookOpen, label: 'Documentation' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-xs text-gray-600 hover:text-[#C8102E] transition-colors duration-200"
                  >
                    <link.icon size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@lifelineplus.in" className="group flex items-center gap-2 text-xs text-gray-600 hover:text-[#C8102E] transition-colors duration-200">
                  <Mail size={11} className="group-hover:scale-110 transition-transform" />
                  support@lifelineplus.in
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin size={11} className="shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400 text-center sm:text-left">
            © {currentYear} LifeLine+ Team. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-[11px] text-gray-500 hover:text-[#C8102E] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[11px] text-gray-500 hover:text-[#C8102E] transition-colors">Terms</Link>
            <a href="#" className="text-[11px] text-gray-500 hover:text-[#C8102E] transition-colors flex items-center gap-1">
              Status <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
