import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Mic, X } from 'lucide-react'

export default function SOSButton() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [listening, setListening] = useState(false)

  const goEmergency = () => {
    setShowMenu(false)
    navigate('/emergency')
  }

  const voiceTrigger = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported on this browser.')
      return
    }
    setListening(true)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      if (transcript.includes('help') || transcript.includes('emergency') || transcript.includes('sos') || transcript.includes('bachao')) {
        goEmergency()
      } else {
        alert(`Heard: "${transcript}". Say "help" or "emergency" to trigger SOS.`)
      }
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => setListening(false)
    recognition.start()
  }

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors active:scale-95 animate-pulse-slow"
        aria-label="SOS Emergency"
      >
        {showMenu ? <X size={28} /> : <AlertTriangle size={28} />}
      </button>

      {showMenu && (
        <div className="fixed bottom-44 right-4 z-50 flex flex-col gap-3 animate-slide-up">
          <button
            onClick={goEmergency}
            className="bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg font-semibold text-sm hover:bg-red-700 transition-all active:scale-95 whitespace-nowrap"
          >
            Emergency Mode
          </button>
          <button
            onClick={voiceTrigger}
            className={`${listening ? 'bg-green-600' : 'bg-gray-800 dark:bg-gray-700'} text-white px-5 py-3 rounded-2xl shadow-lg font-medium text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap`}
          >
            <Mic size={16} />
            {listening ? 'Listening...' : 'Voice SOS'}
          </button>
        </div>
      )}
    </>
  )
}
