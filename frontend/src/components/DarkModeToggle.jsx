import { useState, useEffect } from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'

export default function DarkModeToggle({ dark, toggle }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayDark, setDisplayDark] = useState(dark)

  useEffect(() => {
    if (dark !== displayDark) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayDark(dark)
        setIsAnimating(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [dark, displayDark])

  const handleClick = () => {
    toggle()
  }

  return (
    <button
      onClick={handleClick}
      className="group fixed top-4 right-4 z-50 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-amber-500/20 dark:hover:shadow-purple-500/20 active:scale-95"
      aria-label="Toggle dark mode"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
        displayDark 
          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-100' 
          : 'bg-gradient-to-br from-amber-400/20 to-orange-400/20 opacity-100'
      }`} />
      
      {/* Animated glow ring */}
      <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
        displayDark ? 'bg-purple-500' : 'bg-amber-500'
      }`} style={{ animationDuration: '3s' }} />

      {/* Icon container with animation */}
      <div className="relative w-full h-full flex items-center justify-center">
        {displayDark ? (
          <Sun 
            size={20} 
            className={`text-amber-500 transition-all duration-300 ${
              isAnimating ? 'animate-spin-out' : 'animate-spin-in'
            }`}
            strokeWidth={2}
          />
        ) : (
          <Moon 
            size={20} 
            className={`text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${
              isAnimating ? 'animate-spin-out' : 'animate-spin-in'
            }`}
            strokeWidth={2}
          />
        )}
      </div>

      {/* Sparkle effects on hover */}
      <Sparkles 
        size={10} 
        className="absolute top-1 right-1 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
      />
      
      {/* Tooltip hint */}
      <span className="absolute right-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {displayDark ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}

// Add these styles to your CSS
const styles = `
@keyframes spin-in {
  0% {
    transform: rotate(-180deg) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: rotate(0deg) scale(1.2);
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes spin-out {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: rotate(90deg) scale(1.2);
  }
  100% {
    transform: rotate(180deg) scale(0.3);
    opacity: 0;
  }
}

.animate-spin-in {
  animation: spin-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-spin-out {
  animation: spin-out 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
`
