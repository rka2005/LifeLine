import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => { setSent(false); setForm({ name: '', email: '', message: '' }) }, 3000)
  }

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <p className="text-red-100 text-sm mt-1">We are here 24/7 for emergencies and feedback</p>
      </div>
      <div className="px-4 -mt-6 grid grid-cols-1 gap-3">
        <a href="tel:108" className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center"><Phone size={18} className="text-red-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Emergency Helpline</p>
            <p className="text-xs text-gray-500">108 / 112 - Toll Free</p>
          </div>
        </a>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center"><Mail size={18} className="text-blue-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p>
            <p className="text-xs text-gray-500">support@lifeline.plus</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center"><MapPin size={18} className="text-green-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">HQ</p>
            <p className="text-xs text-gray-500">Kolkata, West Bengal, India</p>
          </div>
        </div>
      </div>
      <div className="px-4 mt-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Send a Message</h2>
        {sent ? (
          <div className="card text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <h3 className="font-bold text-gray-900 dark:text-white">Message Sent!</h3>
            <p className="text-sm text-gray-500 mt-1">We will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <input className="input-field" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <textarea className="input-field min-h-[100px] resize-none" placeholder="Your message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} /> Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
