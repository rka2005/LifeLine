import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext.jsx'
import { auth, firebaseEnabled, googleProvider } from '../lib/firebase.js'
import { X, Mail, User as UserIcon, ChevronRight, AlertCircle, WifiOff, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginModal({ onClose }) {
  const { login, verifyGoogleToken } = useAuth()
  const [mode, setMode] = useState('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoOption, setShowDemoOption] = useState(false)
  const [backendUnavailable, setBackendUnavailable] = useState(false)

  // LAYER 2: Pure Google OAuth Fallback
  const { login: triggerGoogleFallback } = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        console.log('🔄 [Auth Layer 2] Google OAuth Success, verifying token...')
        await verifyGoogleToken(tokenResponse.access_token, 'google_access')
        onClose()
      } catch (err) {
        console.error('❌ [Auth Layer 2] Verification failed:', err)
        setError('Fallback authentication failed. Switching to Demo Mode option...')
        setLoading(false)
        setShowDemoOption(true)
      }
    },
    onError: () => {
      console.error('❌ [Auth Layer 2] Google Login Failed')
      setError('Google Fallback failed. Switching to Demo Mode option...')
      setShowDemoOption(true)
      setLoading(false)
    }
  })

  // LAYER 1: Firebase Google Login
  const googleLogin = async () => {
    setMode('google')
    setLoading(true)
    setError('')
    setShowDemoOption(false)

    try {
      console.log('🔐 [Auth Layer 1] Attempting Firebase Google Login...')
      if (!firebaseEnabled || !auth || !googleProvider) {
        throw new Error('Firebase not configured')
      }

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      
      await verifyGoogleToken(idToken, 'firebase')
      setLoading(false)
      onClose()
    } catch (err) {
      console.warn('⚠️ [Auth Layer 1] Firebase failed, triggering Fallback Layer 2...', err.message)
      
      try {
        triggerGoogleFallback()
      } catch (fallbackErr) {
        console.error('❌ [Auth Layer 2] All Google methods failed')
        setError('Google Login unavailable. You can use Demo Mode below.')
        setShowDemoOption(true)
        setLoading(false)
        setMode('form')
      }
    }
  }

  // LAYER 3: Demo User Fallback
  const loginWithDemoMode = () => {
    setLoading(true)
    console.log('🛠️ [Auth Layer 3] Initializing Demo Mode...')
    const demoUser = {
      id: `demo-${Date.now()}`,
      name: name || 'Demo User',
      email: email || 'demo@lifelineplus.in',
      provider: 'demo',
      photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=EF4444&color=fff',
      createdAt: new Date().toISOString()
    }
    
    setTimeout(() => {
      login(demoUser)
      setLoading(false)
      onClose()
    }, 800) // Small delay for visual feedback
  }

  const submitForm = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://lifeline-backend-240882103415.us-central1.run.app'
      const response = await fetch(`${backendUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) {
        setShowDemoOption(true)
        throw new Error('Account not found or server error')
      }
      
      const data = await response.json()
      login(data.user)
      onClose()
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Sign In</h2>
            <p className="text-xs text-gray-400 mt-0.5">Triple-Layer Secure Access</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {mode === 'google' && loading && !showDemoOption ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Securing connection...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {showDemoOption ? (
              <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-3 text-amber-800">
                  <Terminal size={20} />
                  <span className="font-bold text-sm">Offline Mode Available</span>
                </div>
                <p className="text-xs text-amber-700 mb-4 leading-relaxed">
                  External login services are currently restricted. You can explore all features using a demo account.
                </p>
                <button
                  onClick={loginWithDemoMode}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  Enter Demo Mode
                </button>
              </div>
            ) : (
              <button
                onClick={googleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 mb-6 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            )}

            <div className="flex items-center gap-3 my-6 text-gray-300">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">or use guest access</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium text-sm"
                />
              </div>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-500/25 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Enter Platform'}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
