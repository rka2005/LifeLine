import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { useAuth } from '../context/AuthContext.jsx'
import { auth, firebaseEnabled, googleProvider } from '../lib/firebase.js'
import { X, Mail, User as UserIcon, ChevronRight, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [mode, setMode] = useState('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userNotFound, setUserNotFound] = useState(false)

  const submitForm = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      
      console.log('🔐 [Email Sign-in] Checking if user exists...')
      console.log(`📧 Email: ${email}`)
      
      // Check if user exists
      const checkResponse = await fetch(`${backendUrl}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const checkData = await checkResponse.json()
      
      if (!checkData.exists) {
        console.log('❌ User does not exist, must sign up first')
        setError('Account not found. Please create an account first.')
        setUserNotFound(true)
        setLoading(false)
        return
      }
      
      console.log('✅ User exists, processing sign-in...')
      
      // Sign in the user
      const signinResponse = await fetch(`${backendUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const signinData = await signinResponse.json()
      
      if (!signinData.success) {
        setError(signinData.message || 'Sign-in failed')
        setLoading(false)
        return
      }
      
      console.log('✅ Sign-in successful, signin count:', signinData.user.signinCount)
      
      // Login to app
      login({
        id: signinData.user.id,
        name: signinData.user.name || name,
        email: signinData.user.email,
        phone: signinData.user.phone,
        address: signinData.user.address,
        provider: 'email',
        photoURL: signinData.user.photoURL,
        createdAt: signinData.user.createdAt
      })
      
      setLoading(false)
      onClose()
    } catch (error) {
      console.error('❌ Sign-in error:', error)
      setError(error.message || 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  const googleLogin = async () => {
    setMode('google')
    setLoading(true)
    setError('')

    if (!firebaseEnabled || !auth || !googleProvider) {
      setLoading(false)
      setMode('form')
      setError('Firebase Google login is not configured. Use email signin instead.')
      return
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      
      console.log('🔐 [Google Sign-in] User authenticated with Google')
      console.log(`📧 Email: ${result.user.email}`)
      
      // Check if user exists
      console.log('🔍 Checking if user exists in database...')
      const checkResponse = await fetch(`${backendUrl}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.user.email })
      })
      
      const checkData = await checkResponse.json()
      
      if (!checkData.exists) {
        console.log('❌ Google user does not exist, must sign up first')
        setError('Account not found. Please create an account first using your Google email.')
        setUserNotFound(true)
        setMode('form')
        await signOut(auth).catch(() => {})
        setLoading(false)
        return
      }
      
      console.log('✅ User exists, processing sign-in...')
      
      // Sign in the user
      const signinResponse = await fetch(`${backendUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.user.email })
      })
      
      const signinData = await signinResponse.json()
      
      if (!signinData.success) {
        setError(signinData.message || 'Sign-in failed')
        setMode('form')
        await signOut(auth).catch(() => {})
        setLoading(false)
        return
      }
      
      console.log('✅ Google sign-in successful, signin count:', signinData.user.signinCount)
      
      login({
        id: signinData.user.id || result.user.uid,
        name: signinData.user.name || result.user.displayName,
        email: signinData.user.email,
        phone: signinData.user.phone || '',
        address: signinData.user.address || '',
        photoURL: signinData.user.photoURL || result.user.photoURL,
        provider: 'google',
        createdAt: signinData.user.createdAt,
        signinCount: signinData.user.signinCount,
        lastSigninAt: signinData.user.lastSigninAt,
        status: signinData.user.status
      })
      
      setLoading(false)
      onClose()
    } catch (err) {
      console.error('❌ Google sign-in error:', err)
      setError(err?.message || 'Google sign-in failed.')
      setMode('form')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Sign In</h2>
            <p className="text-xs text-gray-400 mt-0.5">Access emergency features</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {mode === 'google' ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Connecting to Google...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 dark:border-red-900/60 dark:bg-red-900/20">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  {userNotFound && (
                    <Link
                      to="/signup"
                      onClick={onClose}
                      className="inline-block mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                    >
                      Go to Sign Up →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={googleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-[10px] text-gray-400 uppercase">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <form onSubmit={submitForm} className="space-y-3">
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setError('')
                    setUserNotFound(false)
                  }}
                  className="input-field pl-10"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Continue as Guest'}
              </button>

              <Link
                to="/signup"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium py-2.5 px-4 rounded-xl transition-all active:scale-95"
              >
                Create Account
                <ChevronRight size={18} />
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  )
}