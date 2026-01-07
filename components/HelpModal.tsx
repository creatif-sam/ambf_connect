"use client"

import { X, CheckCircle, UserPlus, Settings, MessageCircle, Calendar, Users, Download, Bell } from "lucide-react"
import { useEffect } from "react"

type HelpModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Getting Started Guide</h2>
            <p className="text-sm opacity-90">Everything you need to know about AMBF Connect</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-full transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-6 space-y-8">
          
          {/* What is AMBF Connect */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              What is AMBF Connect?
            </h3>
            <p className="text-gray-700 leading-relaxed ml-10">
              AMBF Connect is your all-in-one event management and networking platform. Browse events, 
              connect with attendees, send messages, and stay updated with real-time notifications.
            </p>
          </section>

          {/* Create Account */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              Create Your Account
            </h3>
            <div className="ml-10 space-y-3">
              <div className="flex items-start gap-3">
                <UserPlus className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Sign Up</p>
                  <p className="text-sm text-gray-600">Click "Register" and fill in your name, email, and password</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Verify Email</p>
                  <p className="text-sm text-gray-600">Check your inbox for the verification link</p>
                </div>
              </div>
            </div>
          </section>

          {/* Complete Profile */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              Complete Your Profile
            </h3>
            <div className="ml-10 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 Profile Completeness Matters!</p>
                <p className="text-sm text-blue-800">
                  Complete profiles get better networking opportunities. Add your photo, job title, company, and bio.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Go to Profile</p>
                  <p className="text-sm text-gray-600">Tap the Profile icon in the bottom navigation</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              Key Features
            </h3>
            <div className="ml-10 grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Calendar className="text-blue-600" size={24} />}
                title="Events"
                description="Browse and join events. View agenda, sessions, and announcements."
              />
              <FeatureCard
                icon={<Users className="text-green-600" size={24} />}
                title="Networking"
                description="Discover attendees, view profiles, and connect with people."
              />
              <FeatureCard
                icon={<MessageCircle className="text-purple-600" size={24} />}
                title="Messages"
                description="Chat in real-time with other attendees. See online status."
              />
              <FeatureCard
                icon={<Bell className="text-red-600" size={24} />}
                title="Notifications"
                description="Get instant updates for announcements and messages."
              />
            </div>
          </section>

          {/* Install App */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                5
              </div>
              Install the App
            </h3>
            <div className="ml-10 space-y-3">
              <div className="flex items-start gap-3">
                <Download className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Click the Download Icon</p>
                  <p className="text-sm text-gray-600">Look for the download button in the top navigation</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-1">✨ Benefits of Installing</p>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Faster loading times</li>
                  <li>Works offline</li>
                  <li>Push notifications even when closed</li>
                  <li>App-like experience</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Conference Badge */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                6
              </div>
              Your Conference Badge
            </h3>
            <div className="ml-10 space-y-3">
              <p className="text-gray-700">
                Get your personalized digital conference badge with your photo, name, role, and company.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-2">🎫 How to Get Your Badge</p>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Go to any profile page</li>
                  <li>Click "View Conference Badge"</li>
                  <li>Download as PNG image</li>
                  <li>Share on social media!</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-yellow-900">✨ Pro Tips</h3>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Complete your profile to 100% for maximum networking visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Enable notifications to never miss important updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Check the green dot to see who's online before messaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Download your conference badge and share it on LinkedIn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Install the PWA for the best mobile experience</span>
              </li>
            </ul>
          </section>

          {/* Support */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-bold mb-2">Need More Help?</h3>
            <p className="text-sm text-gray-600">
              Contact your event organizer or system administrator for additional support.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition">
      <div className="mt-1 flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
