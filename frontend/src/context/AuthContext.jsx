import { createContext, useContext, useState, useCallback } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, firebaseEnabled } from '../lib/firebase.js'

const AuthContext = createContext(null)

function normalizeUser(userData) {
  return {
    id: userData.uid || userData.id || `local-${Date.now()}`,
    name: userData.displayName || userData.name || 'User',
    email: userData.email || '',
    photo: userData.photoURL || userData.photo || '',
    phone: userData.phoneNumber || userData.phone || '',
    provider: userData.provider || userData.providerId || 'email',
    createdAt: userData.createdAt || new Date().toISOString()
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const initAuth = useCallback(() => {
    const saved = localStorage.getItem('lifeline_user')
    let savedUser = null
    if (saved) {
      try {
        savedUser = JSON.parse(saved)
        setUser(savedUser)
      } catch (e) {
        localStorage.removeItem('lifeline_user')
      }
    }

    if (firebaseEnabled && auth) {
      return onAuthStateChanged(auth, firebaseUser => {
        if (!firebaseUser && !savedUser) {
          setUser(null)
        }
        setLoading(false)
      })
    }

    setLoading(false)
    return undefined
  }, [])

  const login = useCallback((userData) => {
    const normalized = normalizeUser(userData)
    setUser(normalized)
    localStorage.setItem('lifeline_user', JSON.stringify(normalized))
    return normalized
  }, [])

  const logout = useCallback(async () => {
    if (firebaseEnabled && auth?.currentUser) {
      await signOut(auth)
    }
    setUser(null)
    localStorage.removeItem('lifeline_user')
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('lifeline_user', JSON.stringify(next))
      
      // Sync updates to Firestore via backend
      if (next.id) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
          console.log('🔄 [Profile Update] Syncing to Firestore via:', backendUrl)
          fetch(`${backendUrl}/api/auth/profile/${next.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
          }).then(data => {
            console.log('✅ [Profile Update] Synced to Firestore:', data)
          }).catch(err => {
            console.error('❌ [Profile Update] Background update failed:', err.message)
          })
        } catch (error) {
          console.error('❌ [Profile Update] Error updating profile in Firestore:', error.message)
        }
      }
      
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, initAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
