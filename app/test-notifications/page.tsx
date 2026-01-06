"use client"

import { useState, useEffect } from "react"
import { Bell, Send } from "lucide-react"

export default function TestNotificationsPage() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  async function requestPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      setMessage(`Permission ${permission}`)
    } else {
      setMessage("Notifications not supported in this browser")
    }
  }

  async function testBellNotification() {
    if (!userId) {
      setMessage("Please enter a user ID")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: "Test Bell Notification",
          message: "This is a test notification for the bell icon",
          type: "system",
          link: "/events"
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("✅ Bell notification created successfully! Check the bell icon.")
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  async function testPushNotification() {
    setLoading(true)
    setMessage("")

    try {
      // Test browser push notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Test Push Notification", {
          body: "This is a test push notification",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png"
        })
        setMessage("✅ Push notification sent!")
      } else {
        setMessage("❌ Please grant notification permission first")
      }
    } catch (error) {
      setMessage(`❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test Notifications</h1>
        <p className="text-gray-600">Test both bell notifications and push notifications</p>
      </div>

      {/* Permission Status */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Permission Status</h2>
        {permissionStatus === null ? (
          <div className="text-gray-500">Loading permission status...</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">
                Browser Notification Permission:
              </span>
              <span className={`font-semibold ${
                permissionStatus === "granted" ? "text-green-600" :
                permissionStatus === "denied" ? "text-red-600" :
                "text-yellow-600"
              }`}>
                {permissionStatus.toUpperCase()}
              </span>
            </div>
            
            {permissionStatus !== "granted" && (
              <button
                onClick={requestPermission}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Permission
              </button>
            )}
          </>
        )}
      </div>

      {/* Bell Notification Test */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Test Bell Notification</h2>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID (your user ID)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g., b6ea49f2-4416-4b07-975d-c54ce075a369"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your user ID from /api/debug-users
          </p>
        </div>

        <button
          onClick={testBellNotification}
          disabled={loading || !userId}
          className="w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Bell Notification"}
        </button>
      </div>

      {/* Push Notification Test */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Test Push Notification</h2>
        </div>
        
        <button
          onClick={testPushNotification}
          disabled={loading || permissionStatus !== "granted"}
          className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Push Notification"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.startsWith("✅") ? "bg-green-50 text-green-800" :
          message.startsWith("❌") ? "bg-red-50 text-red-800" :
          "bg-blue-50 text-blue-800"
        }`}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-2">
        <h3 className="font-semibold">Setup Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Run the notifications migration in Supabase SQL Editor</li>
          <li>Get your user ID from <a href="/api/debug-users" className="text-blue-600 underline" target="_blank">/api/debug-users</a></li>
          <li>Grant notification permission when prompted</li>
          <li>Test bell notification (should appear in top nav bell icon)</li>
          <li>Test push notification (should show browser notification)</li>
        </ol>
      </div>
    </main>
  )
}
