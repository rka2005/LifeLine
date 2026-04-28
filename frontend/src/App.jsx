import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Loader from './components/Loader.jsx'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Emergency from './pages/Emergency.jsx'
import Doctors from './pages/Doctors.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import FAQs from './pages/FAQs.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import Documentation from './pages/Documentation.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  const { initAuth } = useAuth()
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const authCleanup = initAuth()
    
    // Simulate initial loading for 2 seconds for smooth transition
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 2000)

    return () => {
      authCleanup()
      clearTimeout(timer)
    }
  }, [initAuth])

  if (initialLoading) {
    return <Loader fullScreen text="Initializing LifeLine+ Emergency Services..." />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
