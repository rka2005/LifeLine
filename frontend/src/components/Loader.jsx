import { Ambulance, Siren, Activity } from 'lucide-react'

export default function Loader({ text = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Ambulance icon with pulse */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center animate-pulse">
          <Ambulance size={32} className="text-red-600" />
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 border-4 border-red-200 dark:border-red-800 border-t-red-600 rounded-2xl animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>
      
      <div className="flex items-center gap-2">
        <Siren size={16} className="text-red-500 animate-pulse" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{text}</span>
        <Activity size={16} className="text-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
      
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  )
}
