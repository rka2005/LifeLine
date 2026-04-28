import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Shield, Stethoscope, LayoutDashboard, User, Menu, X, Phone, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import LoginModal from './LoginModal.jsx'

export default function TopNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const scrollToSection = (id) => {
    if (pathname !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 350)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const isActive = (path) => pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center shadow-sm">
              <Shield size={15} className="text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-extrabold text-[15px] text-gray-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>LifeLine</span>
              <span className="font-black text-[15px] text-[#C8102E]" style={{ fontFamily: "'Inter', sans-serif" }}>+</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {[
              { path: '/', label: 'Home', Icon: Home },
              { path: '/emergency', label: 'Emergency', Icon: Shield },
              ...(user ? [
                { path: '/doctors', label: 'Doctors', Icon: Stethoscope },
                { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
              ] : []),
            ].map(({ path, label, Icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive(path)
                    ? 'text-[#C8102E]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {isActive(path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#C8102E] rounded-full" />
                )}
                <Icon size={13} />
                {label}
              </Link>
            ))}

            {/* Divider */}
            {pathname === '/' && (
              <span className="w-px h-4 bg-gray-200 mx-1" />
            )}

            {/* Anchor scroll links — home only */}
            {pathname === '/' && (
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Contact
                </button>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Emergency pill — always visible on desktop */}
            <Link
              to="/emergency"
              className="hidden sm:flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#a50d26] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SOS
            </Link>

            {/* User avatar or Login */}
            {user ? (
              <Link to="/profile" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#C8102E] rounded-lg flex items-center justify-center text-[11px] font-black text-white">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-[11px] font-medium text-gray-500 hidden lg:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {user.name?.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-bold px-3.5 py-1.5 rounded-lg border border-gray-200 transition-all duration-200 active:scale-95 shadow-sm"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <LogIn size={13} />
                Login
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <nav className="px-4 py-3 space-y-1">
            {[
              { path: '/', label: 'Home', Icon: Home },
              { path: '/emergency', label: 'Emergency', Icon: Shield },
              ...(user ? [
                { path: '/doctors', label: 'Doctors', Icon: Stethoscope },
                { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                { path: '/profile', label: 'Profile', Icon: User },
              ] : []),
            ].map(({ path, label, Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'text-[#C8102E] bg-red-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <div className="pt-1 border-t border-gray-100">
              <button onClick={() => scrollToSection('features')} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                Features
              </button>
              <button onClick={() => scrollToSection('contact')} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <Phone size={16} />
                Contact
              </button>
            </div>
          </nav>
        </div>
      )}
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  )
}
