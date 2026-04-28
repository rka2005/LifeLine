import { Outlet, useLocation } from 'react-router-dom'
import TopNav from './TopNav.jsx'
import SOSButton from './SOSButton.jsx'
import Footer from './Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('lifeline_dark') === 'true'
    setDark(saved)
    document.documentElement.classList.toggle('dark', saved)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('lifeline_dark', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  const hideSOS = ['/emergency'].includes(location.pathname)

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'dark' : ''}`}>
      <TopNav dark={dark} toggleDark={toggleDark} />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors pt-14">
        <Outlet />
      </main>
      <Footer />
      {!hideSOS && <SOSButton />}
    </div>
  )
}
