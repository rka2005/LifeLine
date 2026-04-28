import { Heart, Shield, Zap, Globe, Users, Award, ChevronRight, Trophy, Target, Sparkles } from 'lucide-react'

export default function About() {
  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold">About LifeLine+</h1>
        <p className="text-red-100 text-sm mt-1">Building India&apos;s fastest emergency response network</p>
      </div>

      <div className="px-4 -mt-6">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            LifeLine+ is a real-time emergency response and crisis coordination platform designed specifically for India.
            We combine live GPS tracking, AI-powered verification, and smart routing to connect patients with ambulances,
            hospitals, doctors, and police — faster than ever before.
          </p>
        </div>
      </div>

      {/* Google Solution Challenge Badge */}
      <div className="px-4 mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Trophy size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Google Solution Challenge 2026</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  Rapid Crisis Response
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Accelerated Emergency Response and Crisis Coordination in Hospitality
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                    Hosted on Hack2Skill
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Target size={10} /> Solving for India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
        <div className="space-y-3">
          {[
            { icon: Zap, title: 'Speed', desc: 'Under 5-minute average ambulance response time' },
            { icon: Shield, title: 'Safety', desc: 'AI-verified civilian emergency mode with police alerts' },
            { icon: Globe, title: 'Coverage', desc: 'Nationwide network of hospitals, doctors, and police' },
            { icon: Users, title: 'Community', desc: 'Citizen-driven emergency assistance when ambulances are scarce' }
          ].map((item, i) => (
            <div key={i} className="card flex gap-4 items-start group hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">The Team</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Atanu Saha', role: 'Team Lead & Strategy' },
            { name: 'Babin Bid', role: 'Tech & Architecture' },
            { name: 'Rohit Kumar Adak', role: 'Backend & APIs' },
            { name: 'Sagnik Bachhar', role: 'Frontend & UX' }
          ].map((member, i) => (
            <div key={i} className="card text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full mx-auto flex items-center justify-center text-lg font-bold text-red-600 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-red-500/20">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mt-2 group-hover:text-red-600 transition-colors">{member.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
