import { Shield, Lock, Eye, Database, Trash2, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  window.scrollTo(0, 0)

  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      items: [
        'Real-time GPS location during active emergency sessions',
        'Vehicle registration number (Civilian Mode only)',
        'Contact phone number for emergency coordination',
        'Firebase authentication ID and display name',
        'Device type and browser version for compatibility',
      ]
    },
    {
      icon: Lock,
      title: 'How We Protect Your Data',
      items: [
        'End-to-end encryption for location sharing during emergencies',
        'All API communication uses TLS 1.3 over HTTPS',
        'Location data is purged 24 hours after emergency resolution',
        'Firebase Admin SDK with service-account-only access',
        'No third-party ad trackers or analytics cookies',
      ]
    },
    {
      icon: Database,
      title: 'Data Storage & Retention',
      items: [
        'Emergency session data: retained for 24 hours then auto-deleted',
        'Doctor appointment records: retained until account deletion',
        'User profile data: stored until you request deletion',
        'Aggregated analytics: anonymized and kept for 90 days',
        'All data stored in Firebase Firestore (GCP Mumbai region)',
      ]
    },
    {
      icon: Trash2,
      title: 'Your Rights & Deletion',
      items: [
        'Right to access: export all your data from Profile settings',
        'Right to deletion: request full account purge within 7 days',
        'Right to rectification: update vehicle/contact info anytime',
        'Right to restriction: pause location sharing in Profile',
        'Complaints: email us at privacy@lifelineplus.in',
      ]
    },
  ]

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield size={24} /> Privacy Policy
        </h1>
        <p className="text-red-100 text-sm mt-1">How we handle your data with care</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          LifeLine+ is committed to protecting your privacy. This policy explains what data we collect, 
          how we use it, and your rights under the Digital Personal Data Protection Act, 2023 (India).
        </p>

        {sections.map((section, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <section.icon size={16} />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Contact</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions about privacy? Reach us at{' '}
            <a href="mailto:privacy@lifelineplus.in" className="text-blue-600 dark:text-blue-400 font-medium underline">
              privacy@lifelineplus.in
            </a>
          </p>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-2">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
