import { Shield, Lock, Eye, Database, Trash2, Mail, Fingerprint, Server, Key, FileCheck, Send, Clock } from 'lucide-react'

export default function PrivacyPolicy() {
  window.scrollTo(0, 0)

  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      items: [
        { icon: Fingerprint, text: 'Real-time GPS location during active emergency sessions' },
        { icon: Key, text: 'Vehicle registration number (Civilian Mode only)' },
        { icon: Send, text: 'Contact phone number for emergency coordination' },
        { icon: Shield, text: 'Firebase authentication ID and display name' },
        { icon: Server, text: 'Device type and browser version for compatibility' },
      ]
    },
    {
      icon: Lock,
      title: 'How We Protect Your Data',
      items: [
        { icon: Lock, text: 'End-to-end encryption for location sharing during emergencies' },
        { icon: Shield, text: 'All API communication uses TLS 1.3 over HTTPS' },
        { icon: Trash2, text: 'Location data is purged 24 hours after emergency resolution' },
        { icon: Key, text: 'Firebase Admin SDK with service-account-only access' },
        { icon: Eye, text: 'No third-party ad trackers or analytics cookies' },
      ]
    },
    {
      icon: Database,
      title: 'Data Storage & Retention',
      items: [
        { icon: Clock, text: 'Emergency session data: retained for 24 hours then auto-deleted' },
        { icon: FileCheck, text: 'Doctor appointment records: retained until account deletion' },
        { icon: Database, text: 'User profile data: stored until you request deletion' },
        { icon: Eye, text: 'Aggregated analytics: anonymized and kept for 90 days' },
        { icon: Server, text: 'All data stored in Firebase Firestore (GCP Mumbai region)' },
      ]
    },
    {
      icon: Trash2,
      title: 'Your Rights & Deletion',
      items: [
        { icon: FileCheck, text: 'Right to access: export all your data from Profile settings' },
        { icon: Trash2, text: 'Right to deletion: request full account purge within 7 days' },
        { icon: Key, text: 'Right to rectification: update vehicle/contact info anytime' },
        { icon: Lock, text: 'Right to restriction: pause location sharing in Profile' },
        { icon: Mail, text: 'Complaints: email us at privacy@lifelineplus.in' },
      ]
    },
  ]

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield size={24} className="animate-pulse" /> Privacy Policy
        </h1>
        <p className="text-red-100 text-sm mt-1">How we handle your data with care</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border-l-4 border-red-500">
          <p className="flex items-start gap-2">
            <Lock size={18} className="text-red-500 shrink-0 mt-0.5" />
            LifeLine+ is committed to protecting your privacy. This policy explains what data we collect, 
            how we use it, and your rights under the Digital Personal Data Protection Act, 2023 (India).
          </p>
        </div>

        {sections.map((section, i) => (
          <div 
            key={i} 
            className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default border-l-4 border-transparent hover:border-l-red-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <section.icon size={20} className="text-red-500" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h2>
            </div>
            <ul className="space-y-2 pl-2">
              {section.items.map((item, j) => (
                <li 
                  key={j} 
                  className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <item.icon size={14} className="text-red-400 shrink-0 mt-0.5 group-hover:text-red-500 transition-colors" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 border-blue-100 dark:border-blue-800 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Mail size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Contact</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 pl-13">
            Questions about privacy? Reach us at{' '}
            <a 
              href="mailto:privacy@lifelineplus.in" 
              className="text-blue-600 dark:text-blue-400 font-medium underline hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              privacy@lifelineplus.in
              <Send size={12} className="inline" />
            </a>
          </p>
        </div>

        <div className="card bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-center py-4">
          <Shield size={20} className="mx-auto text-gray-400 mb-2" />
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
