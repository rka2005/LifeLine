import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { auth, firebaseEnabled, googleProvider } from '../lib/firebase.js'
import { signInWithPopup, signOut } from 'firebase/auth'
import { Mail, User as UserIcon, Phone, MapPin, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft, Heart } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

      // Prepare user data
      const userData = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: '',
        signinCount: 1,
        lastSigninAt: new Date().toISOString(),
        status: 'active'
      }

      console.log('📝 [Signup] Creating new account with data:', userData)

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData?.details || responseData?.error || 'Failed to save account')
      }

      console.log('✅ [Signup] User saved to Firestore:', responseData)

      // Activate local session only after persistence succeeds
      await login(userData)
      
      console.log('✅ [Signup] Account created and signed in successfully')
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('❌ [Signup] Error:', error)
      setErrors({ submit: error.message || 'Failed to create account' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setErrors({})

    if (!firebaseEnabled || !auth || !googleProvider) {
      setErrors({ submit: 'Google signup is not configured. Please use email signup.' })
      setLoading(false)
      return
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      
      const userData = {
        id: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email,
        phone: '',
        address: '',
        provider: 'google',
        photoURL: result.user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        signinCount: 1,
        lastSigninAt: new Date().toISOString(),
        status: 'active'
      }

      console.log('📝 [Google Signup] Creating account with data:', userData)

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData?.details || responseData?.error || 'Failed to save Google account')
      }

      console.log('✅ [Google Signup] User saved to Firestore:', responseData)

      await login(userData)
      await signOut(auth).catch(() => {})
      
      console.log('✅ [Google Signup] Account created and signed in successfully')
      
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('❌ [Google Signup] Error:', error)
      setErrors({ submit: error.message || 'Google signup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Created!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Welcome to LifeLine+. Your account has been successfully created and your data is secured in our system.</p>
          <div className="w-full h-1 bg-green-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-900 dark:via-red-900/10 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-red-100 dark:bg-red-900/20 rounded-full p-3 mb-4">
            <Heart className="text-red-600" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join LifeLine+ for emergency services</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            {/* Error Messages */}
            {errors.submit && (
              <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
              </div>
            )}

            {/* Google Signup */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-all active:scale-95 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-medium">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                  <textarea
                    name="address"
                    placeholder="Street, City, State, Pin Code"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none ${
                      errors.address 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.address}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:border-red-600' 
                        : 'border-gray-200 dark:border-slate-600 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className={`w-5 h-5 rounded border-2 mt-0.5 transition-all cursor-pointer ${
                    errors.agreeTerms
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms-of-service" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 -mt-2">
                  <AlertCircle size={14} /> {errors.agreeTerms}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Your data is protected and encrypted for security</p>
        </div>
      </div>
    </div>
  )
}
